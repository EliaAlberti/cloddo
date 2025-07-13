use crate::database::{Database, models::*};
use tauri::State;
use std::sync::Arc;
use anyhow::Result;
use chrono::Utc;

#[tauri::command]
pub async fn get_agents(
    db: State<'_, Arc<Database>>,
) -> Result<Vec<Agent>, String> {
    let agents = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents ORDER BY created_at DESC",
    )
    .fetch_all(db.pool())
    .await
    .map_err(|e| e.to_string())?;

    Ok(agents)
}

#[tauri::command]
pub async fn create_agent(
    db: State<'_, Arc<Database>>,
    request: CreateAgentRequest,
) -> Result<Agent, String> {
    let mut agent = Agent::new(request.name, request.system_prompt, request.model_config);
    agent.description = request.description;
    
    if let Some(schedule_config) = request.schedule_config {
        agent.schedule_config = Some(serde_json::to_string(&schedule_config).unwrap_or_default());
    }

    sqlx::query(
        r#"
        INSERT INTO agents (id, name, description, system_prompt, model_config, schedule_config, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&agent.id)
    .bind(&agent.name)
    .bind(&agent.description)
    .bind(&agent.system_prompt)
    .bind(&agent.model_config)
    .bind(&agent.schedule_config)
    .bind(agent.enabled)
    .bind(agent.created_at)
    .bind(agent.updated_at)
    .execute(db.pool())
    .await
    .map_err(|e| e.to_string())?;

    Ok(agent)
}

#[tauri::command]
pub async fn update_agent(
    db: State<'_, Arc<Database>>,
    agent_id: String,
    request: CreateAgentRequest,
) -> Result<Agent, String> {
    let schedule_config_json = request.schedule_config
        .map(|sc| serde_json::to_string(&sc).unwrap_or_default());

    sqlx::query(
        r#"
        UPDATE agents 
        SET name = ?, description = ?, system_prompt = ?, model_config = ?, schedule_config = ?, updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(&request.name)
    .bind(&request.description)
    .bind(&request.system_prompt)
    .bind(serde_json::to_string(&request.model_config).unwrap_or_default())
    .bind(&schedule_config_json)
    .bind(Utc::now())
    .bind(&agent_id)
    .execute(db.pool())
    .await
    .map_err(|e| e.to_string())?;

    let agent = sqlx::query_as::<_, Agent>("SELECT * FROM agents WHERE id = ?")
        .bind(agent_id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(agent)
}

#[tauri::command]
pub async fn delete_agent(
    db: State<'_, Arc<Database>>,
    agent_id: String,
) -> Result<bool, String> {
    // Delete associated runs first
    sqlx::query("DELETE FROM agent_runs WHERE agent_id = ?")
        .bind(&agent_id)
        .execute(db.pool())
        .await
        .map_err(|e| e.to_string())?;

    // Delete the agent
    let result = sqlx::query("DELETE FROM agents WHERE id = ?")
        .bind(agent_id)
        .execute(db.pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(result.rows_affected() > 0)
}

#[tauri::command]
pub async fn run_agent(
    db: State<'_, Arc<Database>>,
    agent_id: String,
    input_data: Option<std::collections::HashMap<String, serde_json::Value>>,
) -> Result<String, String> {
    // Create agent run record
    let run_id = uuid::Uuid::new_v4().to_string();
    let input_json = input_data.map(|data| serde_json::to_string(&data).unwrap_or_default());

    sqlx::query(
        r#"
        INSERT INTO agent_runs (id, agent_id, status, input_data, started_at)
        VALUES (?, ?, 'pending', ?, ?)
        "#,
    )
    .bind(&run_id)
    .bind(&agent_id)
    .bind(&input_json)
    .bind(Utc::now())
    .execute(db.pool())
    .await
    .map_err(|e| e.to_string())?;

    // TODO: Implement actual agent execution logic
    // For now, just return the run ID
    Ok(run_id)
}