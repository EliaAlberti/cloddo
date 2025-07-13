use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use dirs::config_dir;
use anyhow::Result;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub database: DatabaseConfig,
    pub api: ApiConfig,
    pub logging: LoggingConfig,
    pub performance: PerformanceConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub max_connections: u32,
    pub connection_timeout: u64, // seconds
    pub query_timeout: u64,      // seconds
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiConfig {
    pub anthropic_base_url: String,
    pub request_timeout: u64,    // seconds
    pub max_retries: u32,
    pub rate_limit_requests_per_minute: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
    pub file_logging: bool,
    pub max_log_files: u32,
    pub max_log_size_mb: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    pub enable_caching: bool,
    pub cache_size_mb: u64,
    pub background_task_interval: u64, // seconds
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            database: DatabaseConfig {
                max_connections: 10,
                connection_timeout: 30,
                query_timeout: 30,
            },
            api: ApiConfig {
                anthropic_base_url: "https://api.anthropic.com/v1".to_string(),
                request_timeout: 30,
                max_retries: 3,
                rate_limit_requests_per_minute: 50,
            },
            logging: LoggingConfig {
                level: "info".to_string(),
                file_logging: true,
                max_log_files: 10,
                max_log_size_mb: 10,
            },
            performance: PerformanceConfig {
                enable_caching: true,
                cache_size_mb: 100,
                background_task_interval: 300, // 5 minutes
            },
        }
    }
}

impl AppConfig {
    pub fn load() -> Result<Self> {
        let config_path = Self::get_config_path()?;
        
        if config_path.exists() {
            let config_str = std::fs::read_to_string(&config_path)?;
            let config: AppConfig = serde_json::from_str(&config_str)?;
            Ok(config)
        } else {
            let config = AppConfig::default();
            config.save()?;
            Ok(config)
        }
    }

    pub fn save(&self) -> Result<()> {
        let config_path = Self::get_config_path()?;
        
        // Ensure the directory exists
        if let Some(parent) = config_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let config_str = serde_json::to_string_pretty(self)?;
        std::fs::write(&config_path, config_str)?;
        
        Ok(())
    }

    fn get_config_path() -> Result<PathBuf> {
        let config_dir = config_dir()
            .ok_or_else(|| anyhow::anyhow!("Could not find config directory"))?;
        
        Ok(config_dir.join("cloddo").join("config.json"))
    }
}