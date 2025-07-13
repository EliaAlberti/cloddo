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
        // First check basic format - Anthropic API keys start with 'sk-ant-'
        if !self.api_key.starts_with("sk-ant-") {
            log::error!("Invalid API key format: must start with 'sk-ant-'");
            return Ok(false);
        }

        // Check minimum length (Anthropic keys are typically longer)
        if self.api_key.len() < 40 {
            log::error!("Invalid API key format: too short");
            return Ok(false);
        }

        // Test with actual API call
        let test_request = AnthropicRequest {
            model: "claude-3-haiku-20240307".to_string(),
            max_tokens: 10,
            messages: vec![AnthropicMessage {
                role: "user".to_string(),
                content: "Hi".to_string(),
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
                log::error!("API key validation failed: {}", e);
                Ok(false)
            }
        }
    }
}