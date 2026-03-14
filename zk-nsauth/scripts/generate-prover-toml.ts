// @ts-ignore
import crypto from "crypto";
import { createRequire } from "module";
import { generateInputs } from "../../noir-jwt/js/src/generate-inputs.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve jsonwebtoken from noir-jwt/js/node_modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(path.join(__dirname, "../../noir-jwt/js/"));
const jsonwebtoken = require("jsonwebtoken");

const ISSUER = "https://auth.networkschool.org";
const MAX_DATA_LENGTH = 1200;
const MAX_ISS_LENGTH = 128;

async function main() {
  console.log("Generating 4096-bit RSA key pair...");
  const key = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicExponent: 65537,
  });

  const privateKey = key.privateKey;
  const publicKey = key.publicKey;

  // NS-Auth token payload
  const payload = {
    iss: ISSUER,
    sub: "550e8400-e29b-41d4-a716-446655440000",
    aud: "demo-app-client-id",
    exp: 1799999999, // 2027-01-15
    iat: 1737642217,
    jti: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    scope: "openid profile email roles",
    client_id: "demo-app-client-id",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
  };

  console.log("Signing JWT with RS256...");
  const jwt = jsonwebtoken.sign(payload, privateKey, { algorithm: "RS256" });
  jsonwebtoken.verify(jwt, publicKey);
  console.log("JWT signed and verified successfully.");
  console.log(`JWT length: ${jwt.length} chars`);

  const signedDataString = jwt.split(".").slice(0, 2).join(".");
  const signedDataBytes = new TextEncoder().encode(signedDataString);
  console.log(`Signed data length: ${signedDataBytes.length} bytes`);

  if (signedDataBytes.length > MAX_DATA_LENGTH) {
    throw new Error(
      `Signed data (${signedDataBytes.length}) exceeds MAX_DATA_LENGTH (${MAX_DATA_LENGTH})`
    );
  }

  const pubkeyJwk = publicKey.export({ format: "jwk" });

  console.log("Generating circuit inputs...");
  const inputs = await generateInputs({
    jwt,
    pubkey: pubkeyJwk as JsonWebKey,
    maxSignedDataLength: MAX_DATA_LENGTH,
    modBits: 4096,
  });

  console.log(`Limbs generated: ${inputs.pubkey_modulus_limbs.length}`);
  console.log(
    `base64_decode_offset: ${inputs.base64_decode_offset}`
  );
  console.log(`data.len: ${inputs.data!.len}`);

  // Build Prover.toml
  const issuerBytes = new TextEncoder().encode(ISSUER);
  const issuerPadded = new Uint8Array(MAX_ISS_LENGTH);
  issuerPadded.set(issuerBytes);

  const minExpTimestamp = Math.floor(Date.now() / 1000); // current time

  const lines: string[] = [];

  // Scalar values
  lines.push(`base64_decode_offset = "${inputs.base64_decode_offset}"`);
  lines.push(`min_exp_timestamp = "${minExpTimestamp}"`);

  // u128 limb arrays
  lines.push(
    `pubkey_modulus_limbs = [${inputs.pubkey_modulus_limbs.map((v) => `"${v}"`).join(", ")}]`
  );
  lines.push(
    `redc_params_limbs = [${inputs.redc_params_limbs.map((v) => `"${v}"`).join(", ")}]`
  );
  lines.push(
    `signature_limbs = [${inputs.signature_limbs.map((v) => `"${v}"`).join(", ")}]`
  );

  // BoundedVec<u8, 1200> data
  lines.push("");
  lines.push("[data]");
  lines.push(`len = "${inputs.data!.len}"`);
  lines.push(
    `storage = [${inputs.data!.storage.map((v) => `"${v}"`).join(", ")}]`
  );

  // BoundedVec<u8, 128> expected_issuer
  lines.push("");
  lines.push("[expected_issuer]");
  lines.push(`len = "${issuerBytes.length}"`);
  lines.push(
    `storage = [${Array.from(issuerPadded)
      .map((v) => `"${v}"`)
      .join(", ")}]`
  );

  const toml = lines.join("\n") + "\n";
  const outPath = path.join(__dirname, "..", "Prover.toml");
  fs.writeFileSync(outPath, toml);
  console.log(`\nWrote Prover.toml (${toml.length} bytes) to ${outPath}`);
  console.log(`min_exp_timestamp = ${minExpTimestamp} (${new Date(minExpTimestamp * 1000).toISOString()})`);
  console.log(`token exp = ${payload.exp} (${new Date(payload.exp * 1000).toISOString()})`);
  console.log("\nReady for: nargo execute");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
