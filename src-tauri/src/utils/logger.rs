use log::LevelFilter;
use std::path::PathBuf;
use dirs::data_dir;
use anyhow::Result;

pub fn init_logger() -> Result<()> {
    let log_level = std::env::var("CLODDO_LOG_LEVEL")
        .unwrap_or_else(|_| "info".to_string());
    
    let level = match log_level.to_lowercase().as_str() {
        "error" => LevelFilter::Error,
        "warn" => LevelFilter::Warn,
        "info" => LevelFilter::Info,
        "debug" => LevelFilter::Debug,
        "trace" => LevelFilter::Trace,
        _ => LevelFilter::Info,
    };

    env_logger::Builder::from_default_env()
        .filter_level(level)
        .init();

    log::info!("Logger initialized with level: {}", log_level);
    Ok(())
}

pub fn get_log_dir() -> Result<PathBuf> {
    let data_dir = data_dir()
        .ok_or_else(|| anyhow::anyhow!("Could not find data directory"))?;
    
    let log_dir = data_dir.join("cloddo").join("logs");
    std::fs::create_dir_all(&log_dir)?;
    
    Ok(log_dir)
}