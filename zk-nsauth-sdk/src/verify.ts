import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import type { CompiledCircuit } from "./prove.js";

export type VerifyNSMembershipParams = {
  /** The ZK proof bytes */
  proof: Uint8Array;
  /** Public inputs/outputs from proof generation */
  publicInputs: string[];
  /** Compiled circuit artifact (must match the one used for proving) */
  circuit: CompiledCircuit;
  /** Number of backend threads (default: 4) */
  threads?: number;
};

/**
 * Verify a ZK proof of NS-Auth membership.
 *
 * Returns true if the proof is valid, false otherwise.
 * The verifier learns nothing about the prover's identity — only that they hold
 * a valid NS-Auth token matching the public inputs (issuer, expiry bound, public key).
 */
export async function verifyNSMembership(
  params: VerifyNSMembershipParams
): Promise<boolean> {
  const { proof, publicInputs, circuit, threads = 4 } = params;

  const backend = new BarretenbergBackend(circuit, { threads });

  try {
    const isValid = await backend.verifyProof({
      proof,
      publicInputs,
    });
    return isValid;
  } finally {
    await backend.destroy();
  }
}

/**
 * Extract the nullifier from a proof's public inputs.
 * The nullifier is derived from the token's jti claim and can be used
 * to prevent the same token from being used to generate multiple valid proofs.
 */
export function extractNullifier(publicInputs: string[]): string {
  return publicInputs[0];
}
