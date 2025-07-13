use sqlx::{SqlitePool, sqlite::SqliteConnectOptions};
use std::str::FromStr;
use anyhow::Result;

pub struct ConnectionOptions {
    pub database_url: String,
    pub max_connections: u32,
    pub min_connections: u32,
    pub acquire_timeout: std::time::Duration,
    pub idle_timeout: Option<std::time::Duration>,
    pub max_lifetime: Option<std::time::Duration>,
}

impl Default for ConnectionOptions {
    fn default() -> Self {
        Self {
            database_url: String::new(),
            max_connections: 10,
            min_connections: 1,
            acquire_timeout: std::time::Duration::from_secs(30),
            idle_timeout: Some(std::time::Duration::from_secs(600)), // 10 minutes
            max_lifetime: Some(std::time::Duration::from_secs(3600)), // 1 hour
        }
    }
}

pub async fn create_pool(options: ConnectionOptions) -> Result<SqlitePool> {
    let connect_options = SqliteConnectOptions::from_str(&options.database_url)?
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
        .pragma("cache_size", "1000")
        .pragma("temp_store", "memory")
        .pragma("mmap_size", "268435456"); // 256 MB

    let pool = SqlitePool::connect_with(connect_options).await?;

    log::info!("Database connection pool created successfully");
    Ok(pool)
}

pub async fn test_connection(pool: &SqlitePool) -> Result<()> {
    sqlx::query("SELECT 1").fetch_one(pool).await?;
    log::info!("Database connection test successful");
    Ok(())
}