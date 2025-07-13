use std::collections::HashMap;
use std::fs;
use std::path::Path;
use crate::integrations::anthropic::AnthropicClient;

fn get_settings_file_path() -> Result<String, String> {
    let app_data_dir = dirs::data_dir()
        .unwrap_or_else(|| std::env::temp_dir())
        .join("cloddo");
    
    // Create directory if it doesn't exist
    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    }
    
    Ok(app_data_dir.join("settings.json").to_string_lossy().to_string())
}

#[tauri::command]
pub async fn get_settings() -> Result<HashMap<String, serde_json::Value>, String> {
    let settings_path = get_settings_file_path()?;
    
    if Path::new(&settings_path).exists() {
        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("Failed to read settings: {}", e))?;
        
        let settings: HashMap<String, serde_json::Value> = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings: {}", e))?;
        
        Ok(settings)
    } else {
        // Return default settings
        let mut defaults = HashMap::new();
        defaults.insert("api.anthropicApiKey".to_string(), serde_json::Value::String("".to_string()));
        defaults.insert("api.defaultModel".to_string(), serde_json::Value::String("claude-3-5-sonnet-20241022".to_string()));
        defaults.insert("api.authMethod".to_string(), serde_json::Value::String("api_key".to_string()));
        Ok(defaults)
    }
}

#[tauri::command]
pub async fn update_settings(
    settings: HashMap<String, serde_json::Value>,
) -> Result<bool, String> {
    let settings_path = get_settings_file_path()?;
    
    let json_content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    fs::write(&settings_path, json_content)
        .map_err(|e| format!("Failed to write settings: {}", e))?;
    
    Ok(true)
}

#[tauri::command]
pub async fn validate_api_key(api_key: String) -> Result<bool, String> {
    log::info!("🔑 validate_api_key called with key length: {}", api_key.len());
    log::info!("🔑 Key starts with: {}", if api_key.len() >= 15 { &api_key[..15] } else { &api_key });
    
    if api_key.is_empty() {
        log::error!("❌ API key is empty");
        return Ok(false);
    }
    
    let client = AnthropicClient::new(api_key, None);
    log::info!("🔑 Created AnthropicClient, calling validate_api_key...");
    
    match client.validate_api_key().await {
        Ok(is_valid) => {
            log::info!("✅ API key validation result: {}", is_valid);
            Ok(is_valid)
        },
        Err(e) => {
            log::error!("❌ API key validation error: {}", e);
            Ok(false)
        }
    }
}

#[tauri::command]
pub async fn debug_settings() -> Result<String, String> {
    let settings = get_settings().await?;
    log::info!("Debug settings called, found: {:?}", settings);
    Ok(format!("Settings: {:?}", settings))
}