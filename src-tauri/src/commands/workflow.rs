use crate::database::{Database, models::*};
use tauri::State;
use std::sync::Arc;
use anyhow::Result;
use chrono::Utc;

#[tauri::command]
pub async fn get_hooks(
    db: State<'_, Arc<Database>>,
) -> Result<Vec<Hook>, String> {
    let hooks = sqlx::query_as::<_, Hook>(
        "SELECT * FROM hooks ORDER BY created_at DESC",
    )
    .fetch_all(db.pool())
    .await
    .map_err(|e| e.to_string())?;

    Ok(hooks)
}

#[tauri::command]
pub async fn create_hook(
    db: State<'_, Arc<Database>>,
    request: CreateHookRequest,
) -> Result<Hook, String> {
    let mut hook = Hook::new(
        request.name,
        request.trigger_type,
        request.trigger_config,
        request.action_type,
        request.action_config,
    );
    hook.description = request.description;

    sqlx::query(
        r#"
        INSERT INTO hooks (id, name, description, trigger_type, trigger_config, action_type, action_config, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&hook.id)
    .bind(&hook.name)
    .bind(&hook.description)
    .bind(&hook.trigger_type)
    .bind(&hook.trigger_config)
    .bind(&hook.action_type)
    .bind(&hook.action_config)
    .bind(hook.enabled)
    .bind(hook.created_at)
    .bind(hook.updated_at)
    .execute(db.pool())
    .await
    .map_err(|e| e.to_string())?;

    Ok(hook)
}

#[tauri::command]
pub async fn update_hook(
    db: State<'_, Arc<Database>>,
    hook_id: String,
    request: CreateHookRequest,
) -> Result<Hook, String> {
    sqlx::query(
        r#"
        UPDATE hooks 
        SET name = ?, description = ?, trigger_type = ?, trigger_config = ?, action_type = ?, action_config = ?, updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(&request.name)
    .bind(&request.description)
    .bind(&request.trigger_type)
    .bind(serde_json::to_string(&request.trigger_config).unwrap_or_default())
    .bind(&request.action_type)
    .bind(serde_json::to_string(&request.action_config).unwrap_or_default())
    .bind(Utc::now())
    .bind(&hook_id)
    .execute(db.pool())
    .await
    .map_err(|e| e.to_string())?;

    let hook = sqlx::query_as::<_, Hook>("SELECT * FROM hooks WHERE id = ?")
        .bind(hook_id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(hook)
}

#[tauri::command]
pub async fn delete_hook(
    db: State<'_, Arc<Database>>,
    hook_id: String,
) -> Result<bool, String> {
    let result = sqlx::query("DELETE FROM hooks WHERE id = ?")
        .bind(hook_id)
        .execute(db.pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(result.rows_affected() > 0)
}

#[tauri::command]
pub async fn trigger_hook(
    db: State<'_, Arc<Database>>,
    hook_id: String,
    trigger_data: Option<std::collections::HashMap<String, serde_json::Value>>,
) -> Result<String, String> {
    // Get the hook
    let hook = sqlx::query_as::<_, Hook>("SELECT * FROM hooks WHERE id = ?")
        .bind(&hook_id)
        .fetch_optional(db.pool())
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Hook not found".to_string())?;

    if !hook.enabled {
        return Err("Hook is disabled".to_string());
    }

    // TODO: Implement actual hook execution logic
    // For now, just log the trigger
    log::info!("Hook triggered: {} ({})", hook.name, hook.id);
    
    Ok(format!("Hook {} triggered successfully", hook.name))
}