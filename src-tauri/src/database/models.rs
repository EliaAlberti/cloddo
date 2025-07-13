use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use sqlx::FromRow;
use std::collections::HashMap;

// User Profile
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserProfile {
    pub id: String,
    pub auth_type: String, // 'anthropic_oauth' | 'api_key'
    pub anthropic_user_id: Option<String>,
    pub subscription_tier: Option<String>,
    pub api_key_hash: Option<String>,
    pub preferences: Option<String>, // JSON string
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Session
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Session {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub folder_path: Option<String>,
    pub tags: Option<String>, // JSON array
    pub is_favorite: bool,
    pub total_messages: i32,
    pub token_usage: i32,
    pub last_activity: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub metadata: Option<String>, // JSON string
}

// Session Analytics
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SessionAnalytics {
    pub id: String,
    pub session_id: String,
    pub tokens_used: i32,
    pub api_calls: i32,
    pub cost_estimate: f64,
    pub date: String, // DATE string
}

// Project
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Chat
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Chat {
    pub id: String,
    pub session_id: String,
    pub project_id: Option<String>,
    pub title: String,
    pub folder_path: Option<String>,
    pub is_favorite: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub metadata: Option<String>, // JSON string
}

// Message
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Message {
    pub id: String,
    pub chat_id: String,
    pub role: String, // 'user' | 'assistant' | 'system'
    pub content: String,
    pub metadata: Option<String>, // JSON string
    pub created_at: DateTime<Utc>,
}

// Agent
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub system_prompt: String,
    pub model_config: String, // JSON string
    pub schedule_config: Option<String>, // JSON string
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Agent Run
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AgentRun {
    pub id: String,
    pub agent_id: String,
    pub status: String, // 'pending' | 'running' | 'completed' | 'failed'
    pub input_data: Option<String>, // JSON string
    pub output_data: Option<String>, // JSON string
    pub error_message: Option<String>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
}

// Hook
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Hook {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub trigger_type: String,
    pub trigger_config: String, // JSON string
    pub action_type: String,
    pub action_config: String, // JSON string
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Settings
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Setting {
    pub key: String,
    pub value: String,
    pub setting_type: String, // 'string' | 'number' | 'boolean' | 'json'
    pub updated_at: DateTime<Utc>,
}

// Create structs for API requests
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateChatRequest {
    pub session_id: String,
    pub project_id: Option<String>,
    pub title: String,
    pub folder_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateChatRequest {
    pub title: Option<String>,
    pub folder_path: Option<String>,
    pub is_favorite: Option<bool>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateMessageRequest {
    pub chat_id: String,
    pub role: String,
    pub content: String,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAgentRequest {
    pub name: String,
    pub description: Option<String>,
    pub system_prompt: String,
    pub model_config: HashMap<String, serde_json::Value>,
    pub schedule_config: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateHookRequest {
    pub name: String,
    pub description: Option<String>,
    pub trigger_type: String,
    pub trigger_config: HashMap<String, serde_json::Value>,
    pub action_type: String,
    pub action_config: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProjectRequest {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
}

// Helper functions for ID generation
impl UserProfile {
    pub fn new(auth_type: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            auth_type,
            anthropic_user_id: None,
            subscription_tier: None,
            api_key_hash: None,
            preferences: None,
            created_at: now,
            updated_at: now,
        }
    }
}

impl Session {
    pub fn new(user_id: String, title: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            user_id,
            title,
            folder_path: None,
            tags: None,
            is_favorite: false,
            total_messages: 0,
            token_usage: 0,
            last_activity: now,
            created_at: now,
            metadata: None,
        }
    }
}

impl Chat {
    pub fn new(session_id: String, title: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            session_id,
            project_id: None,
            title,
            folder_path: None,
            is_favorite: false,
            created_at: now,
            updated_at: now,
            metadata: None,
        }
    }
}

impl Message {
    pub fn new(chat_id: String, role: String, content: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            chat_id,
            role,
            content,
            metadata: None,
            created_at: Utc::now(),
        }
    }
}

impl Agent {
    pub fn new(name: String, system_prompt: String, model_config: HashMap<String, serde_json::Value>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            description: None,
            system_prompt,
            model_config: serde_json::to_string(&model_config).unwrap_or_default(),
            schedule_config: None,
            enabled: true,
            created_at: now,
            updated_at: now,
        }
    }
}

impl Hook {
    pub fn new(
        name: String,
        trigger_type: String,
        trigger_config: HashMap<String, serde_json::Value>,
        action_type: String,
        action_config: HashMap<String, serde_json::Value>,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            description: None,
            trigger_type,
            trigger_config: serde_json::to_string(&trigger_config).unwrap_or_default(),
            action_type,
            action_config: serde_json::to_string(&action_config).unwrap_or_default(),
            enabled: true,
            created_at: now,
            updated_at: now,
        }
    }
}

impl Project {
    pub fn new(name: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            description: None,
            color: None,
            created_at: now,
            updated_at: now,
        }
    }
}