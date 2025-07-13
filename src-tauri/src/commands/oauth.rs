use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ring::digest;
use base64::{Engine as _, engine::general_purpose};

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthTokenResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub scope: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthError {
    pub error: String,
    pub error_description: String,
}

// Anthropic OAuth configuration
const ANTHROPIC_AUTH_URL: &str = "https://console.anthropic.com/oauth/authorize";
const ANTHROPIC_TOKEN_URL: &str = "https://api.anthropic.com/v1/oauth/token";
const REDIRECT_URI: &str = "http://localhost:8080/oauth/callback";

#[tauri::command]
pub async fn initiate_oauth_flow() -> Result<String, String> {
    // Use Claude Code's official client ID for desktop applications
    let client_id = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
    let state = format!("state_{}", chrono::Utc::now().timestamp());
    
    // Generate PKCE parameters
    let code_verifier = generate_code_verifier();
    let code_challenge = generate_code_challenge(&code_verifier);
    
    // Store code_verifier for later use in token exchange
    // In a real app, this should be stored securely
    log::info!("Generated PKCE code_verifier (first 20 chars): {}", &code_verifier[..20]);
    
    // Build proper OAuth URL with PKCE parameters
    let oauth_url = format!(
        "{}?response_type=code&client_id={}&redirect_uri={}&scope=&state={}&code_challenge={}&code_challenge_method=S256",
        ANTHROPIC_AUTH_URL,
        urlencoding::encode(client_id),
        urlencoding::encode(REDIRECT_URI),
        urlencoding::encode(&state),
        urlencoding::encode(&code_challenge)
    );
    
    log::info!("Generated OAuth URL with PKCE for Claude authentication");
    Ok(oauth_url)
}

#[tauri::command]
pub async fn exchange_oauth_code(
    code: String,
    _state: String,
) -> Result<OAuthTokenResponse, String> {
    let client = reqwest::Client::new();
    
    let client_id = get_client_id();
    let client_secret = get_client_secret();
    
    let mut params = HashMap::new();
    params.insert("grant_type", "authorization_code");
    params.insert("code", &code);
    params.insert("redirect_uri", REDIRECT_URI);
    params.insert("client_id", &client_id);
    params.insert("client_secret", &client_secret);
    
    let response = client
        .post(ANTHROPIC_TOKEN_URL)
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Failed to exchange OAuth code: {}", e))?;
        
    if response.status().is_success() {
        let token_response: OAuthTokenResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse token response: {}", e))?;
        Ok(token_response)
    } else {
        let error: OAuthError = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse error response: {}", e))?;
        Err(format!("OAuth error: {}", error.error_description))
    }
}

#[tauri::command]
pub async fn refresh_oauth_token(refresh_token: String) -> Result<OAuthTokenResponse, String> {
    let client = reqwest::Client::new();
    
    let client_id = get_client_id();
    let client_secret = get_client_secret();
    
    let mut params = HashMap::new();
    params.insert("grant_type", "refresh_token");
    params.insert("refresh_token", &refresh_token);
    params.insert("client_id", &client_id);
    params.insert("client_secret", &client_secret);
    
    let response = client
        .post(ANTHROPIC_TOKEN_URL)
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Failed to refresh OAuth token: {}", e))?;
        
    if response.status().is_success() {
        let token_response: OAuthTokenResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse refresh response: {}", e))?;
        Ok(token_response)
    } else {
        let error: OAuthError = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse error response: {}", e))?;
        Err(format!("OAuth refresh error: {}", error.error_description))
    }
}

#[tauri::command]
pub async fn validate_oauth_token(access_token: String) -> Result<bool, String> {
    let client = reqwest::Client::new();
    
    // Test the token with a simple API call
    let response = client
        .get("https://api.anthropic.com/v1/models")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("anthropic-version", "2023-06-01")
        .send()
        .await
        .map_err(|e| format!("Failed to validate token: {}", e))?;
        
    Ok(response.status().is_success())
}

// PKCE helper functions
fn generate_code_verifier() -> String {
    use rand::Rng;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let mut rng = rand::thread_rng();
    
    (0..128)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

fn generate_code_challenge(verifier: &str) -> String {
    let digest = digest::digest(&digest::SHA256, verifier.as_bytes());
    general_purpose::URL_SAFE_NO_PAD.encode(digest.as_ref())
}

// Helper functions for OAuth configuration
fn get_client_id() -> String {
    std::env::var("ANTHROPIC_CLIENT_ID")
        .unwrap_or_else(|_| {
            log::error!("ANTHROPIC_CLIENT_ID environment variable not set. OAuth will not work without proper credentials.");
            // Return a clearly invalid client ID that will trigger proper error handling
            "INVALID_CLIENT_ID_NOT_CONFIGURED".to_string()
        })
}

fn get_client_secret() -> String {
    std::env::var("ANTHROPIC_CLIENT_SECRET")
        .unwrap_or_else(|_| {
            log::error!("ANTHROPIC_CLIENT_SECRET environment variable not set. OAuth will not work without proper credentials.");
            "INVALID_CLIENT_SECRET_NOT_CONFIGURED".to_string()
        })
}

#[tauri::command]
pub async fn open_url(url: String) -> Result<(), String> {
    use std::process::Command;
    
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", &url])
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn start_oauth_server() -> Result<u16, String> {
    // Start a local server to handle the OAuth callback
    // This is a simplified version - in production you'd want a more robust server
    use std::net::TcpListener;
    
    let listener = TcpListener::bind("127.0.0.1:0")
        .map_err(|e| format!("Failed to bind OAuth callback server: {}", e))?;
    
    let port = listener.local_addr()
        .map_err(|e| format!("Failed to get server port: {}", e))?
        .port();
    
    // In a real implementation, you'd spawn a server here to handle the callback
    // For now, we'll just return the port
    Ok(port)
}