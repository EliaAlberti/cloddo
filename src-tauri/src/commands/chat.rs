use crate::database::models::*;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use chrono::Utc;

fn get_chats_file_path() -> String {
    "/tmp/cloddo_chats.json".to_string()
}

fn load_chats() -> Result<Vec<Chat>, String> {
    let path = get_chats_file_path();
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
    let path = get_chats_file_path();
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
    
    let chat = Chat {
        id: format!("chat_{}", Utc::now().timestamp()),
        session_id: request.session_id,
        project_id: request.project_id,
        title: request.title,
        folder_path: request.folder_path,
        is_favorite: false,
        created_at: Utc::now(),
        updated_at: Utc::now(),
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
            chat.updated_at = Utc::now();
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

#[tauri::command]
pub async fn send_claude_message(request: CreateMessageRequest) -> Result<Message, String> {
    // Simple mock response for now
    let message = Message {
        id: format!("msg_{}", Utc::now().timestamp()),
        chat_id: request.chat_id,
        role: "assistant".to_string(),
        content: "Hello! This is a test response from Cloddo. The OAuth implementation is working correctly.".to_string(),
        created_at: Utc::now(),
        metadata: Some("{}".to_string()),
    };
    
    Ok(message)
}