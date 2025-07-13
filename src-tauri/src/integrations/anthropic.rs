use serde::{Deserialize, Serialize};
use reqwest::Client;
use anyhow::Result;

#[derive(Debug, Serialize, Deserialize)]
pub struct AnthropicMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnthropicRequest {
    pub model: String,
    pub max_tokens: u32,
    pub messages: Vec<AnthropicMessage>,
    pub temperature: Option<f32>,
    pub system: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnthropicResponse {
    pub id: String,
    pub content: Vec<ContentBlock>,
    pub model: String,
    pub stop_reason: String,
    pub usage: Usage,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContentBlock {
    #[serde(rename = "type")]
    pub content_type: String,
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Usage {
    pub input_tokens: u32,
    pub output_tokens: u32,
}

pub struct AnthropicClient {
    client: Client,
    api_key: String,
    base_url: String,
}

impl AnthropicClient {
    pub fn new(api_key: String, base_url: Option<String>) -> Self {
        Self {
            client: Client::new(),
            api_key,
            base_url: base_url.unwrap_or_else(|| "https://api.anthropic.com/v1".to_string()),
        }
    }

    pub async fn send_message(&self, request: AnthropicRequest) -> Result<AnthropicResponse> {
        let url = format!("{}/messages", self.base_url);
        
        let response = self
            .client
            .post(&url)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("API request failed: {}", error_text));
        }

        let anthropic_response: AnthropicResponse = response.json().await?;
        Ok(anthropic_response)
    }

    pub async fn validate_api_key(&self) -> Result<bool> {
        log::info!("🔍 Validating API key: length={}, starts_with={}", 
            self.api_key.len(), 
            if self.api_key.len() >= 15 { &self.api_key[..15] } else { &self.api_key }
        );

        // First check basic format - Anthropic API keys start with 'sk-ant-api03-' or 'sk-ant-api04-'
        if !self.api_key.starts_with("sk-ant-api03-") && !self.api_key.starts_with("sk-ant-api04-") {
            log::error!("❌ Invalid API key format: must start with 'sk-ant-api03-' or 'sk-ant-api04-'. Current format: {}...", 
                if self.api_key.len() >= 15 { &self.api_key[..15] } else { &self.api_key });
            return Ok(false);
        }

        // Check minimum length (Anthropic keys are typically ~95+ characters)
        if self.api_key.len() < 90 {
            log::error!("❌ Invalid API key format: too short (length: {}, expected ~95+)", self.api_key.len());
            return Ok(false);
        }

        log::info!("✅ API key format validation passed, testing with API call...");

        // Test with actual API call using a minimal request
        let test_request = AnthropicRequest {
            model: "claude-3-haiku-20240307".to_string(),
            max_tokens: 10,
            messages: vec![AnthropicMessage {
                role: "user".to_string(),
                content: "Test".to_string(),
            }],
            temperature: None,
            system: None,
        };

        match self.send_message(test_request).await {
            Ok(_) => {
                log::info!("API key validation successful");
                Ok(true)
            },
            Err(e) => {
                let error_str = e.to_string();
                log::error!("API key validation failed: {}", error_str);
                
                // Provide more specific error information
                if error_str.contains("401") || error_str.contains("authentication") {
                    log::error!("Authentication failed - API key is invalid or expired");
                } else if error_str.contains("429") {
                    log::warn!("Rate limit hit during validation - API key might be valid");
                    // If it's just a rate limit, consider the key potentially valid
                    return Ok(true);
                } else if error_str.contains("network") || error_str.contains("connection") {
                    log::error!("Network error during validation - check internet connection");
                }
                
                Ok(false)
            }
        }
    }
}