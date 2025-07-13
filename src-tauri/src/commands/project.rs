use crate::database::{Database, models::*};
use tauri::State;
use std::sync::Arc;
use anyhow::Result;
use chrono::Utc;

#[tauri::command]
pub async fn get_projects(
    db: State<'_, Arc<Database>>,
) -> Result<Vec<Project>, String> {
    let projects = sqlx::query_as::<_, Project>(
        "SELECT * FROM projects ORDER BY created_at DESC",
    )
    .fetch_all(db.pool())
    .await
    .map_err(|e| e.to_string())?;

    Ok(projects)
}

#[tauri::command]
pub async fn create_project(
    db: State<'_, Arc<Database>>,
    request: CreateProjectRequest,
) -> Result<Project, String> {
    let mut project = Project::new(request.name);
    project.description = request.description;
    project.color = request.color;

    sqlx::query(
        r#"
        INSERT INTO projects (id, name, description, color, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&project.id)
    .bind(&project.name)
    .bind(&project.description)
    .bind(&project.color)
    .bind(project.created_at)
    .bind(project.updated_at)
    .execute(db.pool())
    .await
    .map_err(|e| e.to_string())?;

    Ok(project)
}

#[tauri::command]
pub async fn update_project(
    db: State<'_, Arc<Database>>,
    project_id: String,
    request: CreateProjectRequest,
) -> Result<Project, String> {
    sqlx::query(
        r#"
        UPDATE projects 
        SET name = ?, description = ?, color = ?, updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(&request.name)
    .bind(&request.description)
    .bind(&request.color)
    .bind(Utc::now())
    .bind(&project_id)
    .execute(db.pool())
    .await
    .map_err(|e| e.to_string())?;

    let project = sqlx::query_as::<_, Project>("SELECT * FROM projects WHERE id = ?")
        .bind(project_id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(project)
}

#[tauri::command]
pub async fn delete_project(
    db: State<'_, Arc<Database>>,
    project_id: String,
) -> Result<bool, String> {
    let result = sqlx::query("DELETE FROM projects WHERE id = ?")
        .bind(project_id)
        .execute(db.pool())
        .await
        .map_err(|e| e.to_string())?;

    Ok(result.rows_affected() > 0)
}