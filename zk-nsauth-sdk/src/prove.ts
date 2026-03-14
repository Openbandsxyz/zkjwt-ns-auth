import { Noir } from "@noir-lang/noir_js";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";

// Circuit artifact type (compiled Noir program)
export type CompiledCircuit = {
  bytecode: string;
  abi: any;
};

export type ProveNSMembershipParams = {
  /** The NS-Auth access token (JWT string) */
  jwt: string;
  /** NS-Auth public key in JWK format (from /.well-known/jwks.json) */
  nsauthPubkey: JsonWebKey;
  /** Expected token issuer (e.g., "https://backend-production-c59b.up.railway.app") */
  expectedIssuer: string;
  /** Minimum expiration timestamp — tokens expiring before this are rejected */
  minExpTimestamp: number;
  /** Compiled circuit artifact (from nargo compile) */
  circuit: CompiledCircuit;
  /** Number of backend threads (default: 4, lower for browsers) */
  threads?: number;
};

export type NSMembershipProof = {
  /** The ZK proof bytes */
  proof: Uint8Array;
  /** Public inputs/outputs from the circuit */
  publicInputs: string[];
  /** The nullifier (first public output) — hash of jti for replay prevention */
  nullifier: string;
};

/**
 * Generate a ZK proof that the caller holds a valid NS-Auth membership token.
 *
 * The proof reveals NOTHING about the user's identity (sub, user_id are private).
 * Only the nullifier (derived from jti), issuer, expiry bound, and public key are revealed.
 */
export async function proveNSMembership(
  params: ProveNSMembershipParams
): Promise<NSMembershipProof> {
  const {
    jwt,
    nsauthPubkey,
    expectedIssuer,
    minExpTimestamp,
    circuit,
    threads = 4,
  } = params;

  // Dynamically import noir-jwt's generateInputs (it may be installed as a dependency or path import)
  const { generateInputs } = await import("noir-jwt");

  // 1. Generate circuit inputs from the JWT and public key
  const jwtInputs = await generateInputs({
    jwt,
    pubkey: nsauthPubkey,
    maxSignedDataLength: 1200,
    modBits: 4096,
  });

  // 2. Prepare the full circuit inputs
  const issuerBytes = Array.from(new TextEncoder().encode(expectedIssuer));
  const issuerPadded = new Array(128).fill(0);
  for (let i = 0; i < issuerBytes.length; i++) {
    issuerPadded[i] = issuerBytes[i];
  }

  const circuitInputs = {
    // Private inputs
    data: jwtInputs.data,
    base64_decode_offset: jwtInputs.base64_decode_offset,
    redc_params_limbs: jwtInputs.redc_params_limbs,
    signature_limbs: jwtInputs.signature_limbs,
    // Public inputs
    pubkey_modulus_limbs: jwtInputs.pubkey_modulus_limbs,
    expected_issuer: {
      storage: issuerPadded,
      len: issuerBytes.length,
    },
    min_exp_timestamp: minExpTimestamp,
  };

  // 3. Initialize Noir backend and generate proof
  const backend = new BarretenbergBackend(circuit, { threads });
  const noir = new Noir(circuit);

  const { witness } = await noir.execute(circuitInputs as any);
  const proof = await backend.generateProof(witness);

  // Clean up backend resources
  await backend.destroy();

  return {
    proof: proof.proof,
    publicInputs: proof.publicInputs,
    nullifier: proof.publicInputs[0],
  };
}
