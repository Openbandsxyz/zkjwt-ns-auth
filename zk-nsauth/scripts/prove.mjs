import { Noir } from "@noir-lang/noir_js";
import { Barretenberg, UltraHonkBackend } from "@aztec/bb.js";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.join(__dirname, "..");

// Load compiled circuit
const circuitPath = path.join(projectDir, "target/zk_nsauth.json");
const circuit = JSON.parse(readFileSync(circuitPath, "utf-8"));

// Load Prover.toml inputs
const tomlPath = path.join(projectDir, "Prover.toml");
const tomlContent = readFileSync(tomlPath, "utf-8");

// Parse TOML (simple parser for our format)
function parseToml(content) {
  const result = {};
  let currentSection = null;
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      result[currentSection] = {};
      continue;
    }
    const kvMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
    if (kvMatch) {
      const [, key, rawVal] = kvMatch;
      let val = rawVal.trim();
      if (val.startsWith("[")) {
        val = val
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^"|"$/g, ""));
      } else {
        val = val.replace(/^"|"$/g, "");
      }
      if (currentSection) {
        result[currentSection][key] = val;
      } else {
        result[key] = val;
      }
    }
  }
  return result;
}

const inputs = parseToml(tomlContent);

const circuitInputs = {
  data: {
    len: inputs.data.len,
    storage: inputs.data.storage,
  },
  base64_decode_offset: inputs.base64_decode_offset,
  redc_params_limbs: inputs.redc_params_limbs,
  signature_limbs: inputs.signature_limbs,
  pubkey_modulus_limbs: inputs.pubkey_modulus_limbs,
  expected_issuer: {
    len: inputs.expected_issuer.len,
    storage: inputs.expected_issuer.storage,
  },
  min_exp_timestamp: inputs.min_exp_timestamp,
};

console.log("Initializing Barretenberg API...");
const api = await Barretenberg.new({ threads: 1 });

console.log("Initializing backend...");
const backend = new UltraHonkBackend(circuit.bytecode, api);

console.log("Initializing Noir...");
const noir = new Noir(circuit);

console.log("Executing circuit...");
const { witness, returnValue } = await noir.execute(circuitInputs);
console.log(`Circuit output (nullifier): ${returnValue}`);

console.log("Generating proof (this may take a while for 4096-bit RSA)...");
const startTime = Date.now();
const proofData = await backend.generateProof(witness);
const provingTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`Proof generated in ${provingTime}s! Size: ${proofData.proof.length} bytes`);
console.log(`Public inputs: ${proofData.publicInputs.length}`);

console.log("Verifying proof...");
const isValid = await backend.verifyProof(proofData);
console.log(`Verification: ${isValid ? "SUCCESS" : "FAILED"}`);

// Save proof artifacts
const outDir = path.join(projectDir, "target");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  path.join(outDir, "proof.json"),
  JSON.stringify(
    {
      proof: Buffer.from(proofData.proof).toString("hex"),
      publicInputs: proofData.publicInputs,
    },
    null,
    2
  )
);
console.log(`Proof saved to target/proof.json`);

await api.destroy();
process.exit(0);
