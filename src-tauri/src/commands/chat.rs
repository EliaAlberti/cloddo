use crate::database::models::*;
use crate::integrations::anthropic::{AnthropicClient, AnthropicRequest, AnthropicMessage};
use crate::commands::settings;
use std::fs;
use std::path::Path;
use chrono::Utc;

fn get_chats_file_path() -> Result<String, String> {
    let app_data_dir = dirs::data_dir()
        .unwrap_or_else(|| std::env::temp_dir())
        .join("cloddo");
    
    // Create directory if it doesn't exist
    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    }
    
    Ok(app_data_dir.join("chats.json").to_string_lossy().to_string())
}

fn load_chats() -> Result<Vec<Chat>, String> {
    let path = get_chats_file_path()?;
    if Path::new(&path).exists() {
        let content = fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read chats: {}", e))?;
        let chats: Vec<Chat> = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse chats: {}", e))?;
        Ok(chats)
    } else {
        Ok(Vec::new())
    }
}

fn save_chats(chats: &Vec<Chat>) -> Result<(), String> {
    let path = get_chats_file_path()?;
    let json_content = serde_json::to_string_pretty(chats)
        .map_err(|e| format!("Failed to serialize chats: {}", e))?;
    fs::write(&path, json_content)
        .map_err(|e| format!("Failed to write chats: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn get_chats(
    session_id: Option<String>,
    project_id: Option<String>,
    folder_path: Option<String>,
    limit: Option<i32>,
    offset: Option<i32>,
) -> Result<Vec<Chat>, String> {
    let chats = load_chats()?;
    Ok(chats)
}

#[tauri::command]
pub async fn get_chat_by_id(chat_id: String) -> Result<Option<Chat>, String> {
    let chats = load_chats()?;
    let chat = chats.into_iter().find(|c| c.id == chat_id);
    Ok(chat)
}

#[tauri::command]
pub async fn create_chat(request: CreateChatRequest) -> Result<Chat, String> {
    let mut chats = load_chats()?;
    
    let now = Utc::now();
    let chat = Chat {
        id: format!("chat_{}", now.timestamp()),
        session_id: request.session_id,
        project_id: request.project_id,
        title: request.title,
        folder_path: request.folder_path,
        is_favorite: false,
        last_activity: now,
        created_at: now,
        updated_at: now,
        metadata: Some("{}".to_string()),
    };
    
    chats.push(chat.clone());
    save_chats(&chats)?;
    
    Ok(chat)
}

#[tauri::command]
pub async fn update_chat(chat_id: String, request: UpdateChatRequest) -> Result<Chat, String> {
    let mut chats = load_chats()?;
    
    let mut updated_chat = None;
    
    for chat in chats.iter_mut() {
        if chat.id == chat_id {
            if let Some(title) = request.title {
                chat.title = title;
            }
            if let Some(is_favorite) = request.is_favorite {
                chat.is_favorite = is_favorite;
            }
            if let Some(folder_path) = request.folder_path {
                chat.folder_path = Some(folder_path);
            }
            let now = Utc::now();
            chat.updated_at = now;
            chat.last_activity = now;
            updated_chat = Some(chat.clone());
            break;
        }
    }
    
    if let Some(chat) = updated_chat {
        save_chats(&chats)?;
        Ok(chat)
    } else {
        Err("Chat not found".to_string())
    }
}

#[tauri::command]
pub async fn delete_chat(chat_id: String) -> Result<bool, String> {
    let mut chats = load_chats()?;
    let initial_len = chats.len();
    chats.retain(|c| c.id != chat_id);
    
    if chats.len() < initial_len {
        save_chats(&chats)?;
        Ok(true)
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub async fn get_messages(
    chat_id: String,
    limit: Option<i32>,
    offset: Option<i32>,
) -> Result<Vec<Message>, String> {
    // For now, return empty messages - will implement when needed
    Ok(Vec::new())
}

async fn get_api_key_from_settings() -> Result<String, String> {
    let settings = settings::get_settings().await?;
    let api_key = settings.get("api.anthropicApiKey")
        .and_then(|v| v.as_str())
        .ok_or("API key not found in settings")?;
    
    if api_key.is_empty() {
        return Err("API key is empty. Please configure your Anthropic API key in settings.".to_string());
    }
    
    Ok(api_key.to_string())
}

#[tauri::command]
pub async fn send_claude_message(request: CreateMessageRequest) -> Result<Message, String> {
    // Get API key from settings
    let api_key = get_api_key_from_settings().await?;
    
    // Create Anthropic client
    let client = AnthropicClient::new(api_key, None);
    
    // Build the request for Claude API
    let anthropic_request = AnthropicRequest {
        model: "claude-3-5-sonnet-20241022".to_string(),
        max_tokens: 4096,
        messages: vec![AnthropicMessage {
            role: request.role.clone(),
            content: request.content.clone(),
        }],
        temperature: Some(0.7),
        system: Some("You are Claude, a helpful AI assistant created by Anthropic. You are running in Cloddo, a desktop application alternative to Claude Desktop.".to_string()),
    };
    
    // Send message to Claude API
    match client.send_message(anthropic_request).await {
        Ok(response) => {
            let content = response.content.first()
                .map(|block| block.text.clone())
                .unwrap_or_else(|| "No response content".to_string());
            
            let assistant_message = Message {
                id: format!("msg_{}", Utc::now().timestamp()),
                chat_id: request.chat_id,
                role: "assistant".to_string(),
                content,
                created_at: Utc::now(),
                metadata: Some(format!(r#"{{"input_tokens": {}, "output_tokens": {}}}"#, 
                    response.usage.input_tokens, response.usage.output_tokens)),
            };
            
            Ok(assistant_message)
        },
        Err(e) => {
            // Fallback to informative error message
            let error_message = Message {
                id: format!("msg_{}", Utc::now().timestamp()),
                chat_id: request.chat_id,
                role: "assistant".to_string(),
                content: format!("I'm unable to process your request right now. Error: {}. Please check your API key configuration in settings.", e),
                created_at: Utc::now(),
                metadata: Some(r#"{"error": true}"#.to_string()),
            };
            
            Ok(error_message)
        }
    }
}