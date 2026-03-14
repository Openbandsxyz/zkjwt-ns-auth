use jwt::JWT;

/// NS-Auth ZK membership proof circuit
///
/// Proves that the prover holds a valid NS-Auth access token without revealing their identity.
///
/// Public outputs:
///   - nullifier: Pedersen hash of the jti claim (prevents proof replay)
///
/// Public inputs:
///   - pubkey_modulus_limbs: NS-Auth RSA-4096 public key modulus (from JWKS)
///   - expected_issuer: The expected token issuer string
///   - min_exp_timestamp: Minimum acceptable expiration timestamp (proves token is not expired)
///
/// Private inputs (hidden in the proof):
///   - data: The full signed JWT data (header.payload in base64)
///   - base64_decode_offset: Offset for base64 decoding
///   - redc_params_limbs: Barrett reduction parameters for RSA verification
///   - signature_limbs: The RSA signature

// 4096-bit RSA: ceil(4096 / 120) = 35 limbs
global NUM_LIMBS: u32 = 35;
global MOD_BITS: u32 = 4096;
// NS-Auth tokens are ~400-700 bytes base64; 1200 provides ample margin
global MAX_DATA_LENGTH: u32 = 1200;
// Max length for string claim values
global MAX_ISS_LENGTH: u32 = 128;
global MAX_JTI_LENGTH: u32 = 64;

fn main(
    // Private inputs
    data: BoundedVec<u8, MAX_DATA_LENGTH>,
    base64_decode_offset: u32,
    redc_params_limbs: [u128; NUM_LIMBS],
    signature_limbs: [u128; NUM_LIMBS],
    // Public inputs
    pubkey_modulus_limbs: pub [u128; NUM_LIMBS],
    expected_issuer: pub BoundedVec<u8, MAX_ISS_LENGTH>,
    min_exp_timestamp: pub u64,
) -> pub Field {
    // 1. Initialize and verify JWT signature (RSA-4096 + SHA256)
    let jwt: JWT<MAX_DATA_LENGTH, NUM_LIMBS, MOD_BITS> = JWT::init(
        data,
        base64_decode_offset,
        pubkey_modulus_limbs,
        redc_params_limbs,
        signature_limbs,
    );
    jwt.verify();

    // 2. Prove token is from NS-Auth by checking issuer
    jwt.assert_claim_string("iss".as_bytes(), expected_issuer);

    // 3. Prove token is not expired
    let exp = jwt.get_claim_number("exp".as_bytes());
    assert(exp > min_exp_timestamp, "token expired");

    // 4. Compute nullifier from jti (unique token ID) to prevent proof replay
    //    The nullifier is a hash of the jti bytes, published as a public output.
    //    A verifier can track seen nullifiers to reject duplicate proofs from the same token.
    let jti: BoundedVec<u8, MAX_JTI_LENGTH> = jwt.get_claim_string("jti".as_bytes());

    let mut jti_fields: [Field; MAX_JTI_LENGTH] = [0; MAX_JTI_LENGTH];
    for i in 0..MAX_JTI_LENGTH {
        if i < jti.len() {
            jti_fields[i] = jti.get(i) as Field;
        }
    }
    std::hash::pedersen_hash(jti_fields)
}
