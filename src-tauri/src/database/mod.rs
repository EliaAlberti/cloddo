pub mod connection;
pub mod migrations;
pub mod models;

use sqlx::{SqlitePool, Row};
use std::path::PathBuf;
use anyhow::Result;

#[derive(Clone)]
pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new() -> Result<Self> {
        let db_path = Self::get_database_path()?;
        
        // Ensure the directory exists
        if let Some(parent) = db_path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        let database_url = format!("sqlite:{}", db_path.display());
        
        let pool = SqlitePool::connect(&database_url).await?;
        
        // Run migrations
        migrations::run_migrations(&pool).await?;
        
        Ok(Database { pool })
    }

    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }

    fn get_database_path() -> Result<PathBuf> {
        // Use /tmp for database in development to avoid permission issues
        let db_path = std::path::Path::new("/tmp/cloddo.db");
        Ok(db_path.to_path_buf())
    }

    // Health check method
    pub async fn health_check(&self) -> Result<bool> {
        let row = sqlx::query("SELECT 1 as test")
            .fetch_one(&self.pool)
            .await?;
        
        let test_value: i32 = row.get("test");
        Ok(test_value == 1)
    }
}