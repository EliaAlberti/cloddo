use std::collections::HashMap;
use std::fs;
use std::path::Path;

#[tauri::command]
pub async fn get_settings() -> Result<HashMap<String, serde_json::Value>, String> {
    let settings_path = "/tmp/cloddo_settings.json";
    
    if Path::new(settings_path).exists() {
        let content = fs::read_to_string(settings_path)
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
    let settings_path = "/tmp/cloddo_settings.json";
    
    let json_content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    fs::write(settings_path, json_content)
        .map_err(|e| format!("Failed to write settings: {}", e))?;
    
    Ok(true)
}