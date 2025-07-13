// Module declarations
pub mod commands;
pub mod database;
pub mod agents;
pub mod workflows;
pub mod integrations;
pub mod utils;

use commands::{chat, project, settings, agent, oauth};
use database::Database;
use utils::config::AppConfig;
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // Initialize logging
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Initialize configuration
      let config = AppConfig::load().expect("Failed to load configuration");
      app.manage(Arc::new(config));

      // Skip database initialization for now - will initialize lazily
      // TODO: Initialize database properly

      log::info!("Cloddo application initialized successfully");
      Ok(())
    })
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      // Chat commands
      chat::get_chats,
      chat::get_chat_by_id,
      chat::create_chat,
      chat::update_chat,
      chat::delete_chat,
      chat::get_messages,
      chat::send_claude_message,
      
      // Project commands
      project::get_projects,
      project::create_project,
      project::update_project,
      project::delete_project,
      
      // Settings commands
      settings::get_settings,
      settings::update_settings,
      settings::validate_api_key,
      
      // Agent commands
      agent::get_agents,
      agent::create_agent,
      agent::update_agent,
      agent::delete_agent,
      agent::run_agent,
      
      
      // OAuth commands
      oauth::initiate_oauth_flow,
      oauth::exchange_oauth_code,
      oauth::refresh_oauth_token,
      oauth::validate_oauth_token,
      oauth::start_oauth_server,
      oauth::open_url,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
