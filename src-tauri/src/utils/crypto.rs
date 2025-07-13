use ring::{aead, pbkdf2, rand};
use ring::rand::SecureRandom;
use anyhow::Result;
use base64::{engine::general_purpose, Engine as _};

const CREDENTIAL_LEN: usize = 32; // AES-256-GCM key length
const NONCE_LEN: usize = 12; // AES-256-GCM nonce length
const SALT_LEN: usize = 32;

pub struct SecureStorage {
    key: aead::LessSafeKey,
}

impl SecureStorage {
    pub fn new(password: &str, salt: &[u8]) -> Result<Self> {
        let mut key = [0u8; CREDENTIAL_LEN];
        pbkdf2::derive(
            pbkdf2::PBKDF2_HMAC_SHA256,
            std::num::NonZeroU32::new(100_000).unwrap(),
            salt,
            password.as_bytes(),
            &mut key,
        );

        let unbound_key = aead::UnboundKey::new(&aead::AES_256_GCM, &key)
            .map_err(|e| anyhow::anyhow!("Failed to create encryption key: {:?}", e))?;
        let key = aead::LessSafeKey::new(unbound_key);

        Ok(SecureStorage { key })
    }

    pub fn encrypt(&self, data: &str) -> Result<String> {
        let rng = rand::SystemRandom::new();
        let mut nonce_bytes = [0u8; NONCE_LEN];
        rng.fill(&mut nonce_bytes)
            .map_err(|e| anyhow::anyhow!("Failed to generate nonce: {:?}", e))?;
        
        let nonce = aead::Nonce::assume_unique_for_key(nonce_bytes);
        
        let mut in_out = data.as_bytes().to_vec();
        self.key.seal_in_place_append_tag(nonce, aead::Aad::empty(), &mut in_out)
            .map_err(|e| anyhow::anyhow!("Failed to encrypt data: {:?}", e))?;
        
        let mut encrypted = nonce_bytes.to_vec();
        encrypted.extend_from_slice(&in_out);
        
        Ok(general_purpose::STANDARD.encode(&encrypted))
    }

    pub fn decrypt(&self, encrypted_data: &str) -> Result<String> {
        let encrypted_bytes = general_purpose::STANDARD.decode(encrypted_data)?;
        
        if encrypted_bytes.len() < NONCE_LEN {
            return Err(anyhow::anyhow!("Invalid encrypted data length"));
        }
        
        let (nonce_bytes, ciphertext) = encrypted_bytes.split_at(NONCE_LEN);
        let nonce = aead::Nonce::try_assume_unique_for_key(nonce_bytes)
            .map_err(|e| anyhow::anyhow!("Failed to create nonce: {:?}", e))?;
        
        let mut in_out = ciphertext.to_vec();
        let plaintext = self.key.open_in_place(nonce, aead::Aad::empty(), &mut in_out)
            .map_err(|e| anyhow::anyhow!("Failed to decrypt data: {:?}", e))?;
        
        Ok(String::from_utf8(plaintext.to_vec())?)
    }
}

pub fn generate_salt() -> [u8; SALT_LEN] {
    let rng = rand::SystemRandom::new();
    let mut salt = [0u8; SALT_LEN];
    rng.fill(&mut salt).expect("Failed to generate salt");
    salt
}

pub fn hash_api_key(api_key: &str) -> String {
    use ring::digest;
    let hash = digest::digest(&digest::SHA256, api_key.as_bytes());
    general_purpose::STANDARD.encode(hash.as_ref())
}