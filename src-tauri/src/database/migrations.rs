use sqlx::SqlitePool;
use anyhow::Result;

pub async fn run_migrations(pool: &SqlitePool) -> Result<()> {
    log::info!("Running database migrations...");

    // Create user_profiles table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS user_profiles (
            id TEXT PRIMARY KEY,
            auth_type TEXT NOT NULL CHECK (auth_type IN ('anthropic_oauth', 'api_key')),
            anthropic_user_id TEXT,
            subscription_tier TEXT,
            api_key_hash TEXT,
            preferences TEXT, -- JSON
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create sessions table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            folder_path TEXT,
            tags TEXT, -- JSON
            is_favorite BOOLEAN DEFAULT FALSE,
            total_messages INTEGER DEFAULT 0,
            token_usage INTEGER DEFAULT 0,
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT, -- JSON
            FOREIGN KEY (user_id) REFERENCES user_profiles(id)
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create session_analytics table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS session_analytics (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            tokens_used INTEGER DEFAULT 0,
            api_calls INTEGER DEFAULT 0,
            cost_estimate REAL DEFAULT 0.0,
            date DATE DEFAULT (date('now')),
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create projects table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            color TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create chats table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            project_id TEXT,
            title TEXT NOT NULL,
            folder_path TEXT,
            is_favorite BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT, -- JSON
            FOREIGN KEY (session_id) REFERENCES sessions(id),
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create messages table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            chat_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
            content TEXT NOT NULL,
            metadata TEXT, -- JSON
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chat_id) REFERENCES chats(id)
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create agents table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            system_prompt TEXT NOT NULL,
            model_config TEXT NOT NULL, -- JSON
            schedule_config TEXT, -- JSON
            enabled BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create agent_runs table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS agent_runs (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
            input_data TEXT, -- JSON
            output_data TEXT, -- JSON
            error_message TEXT,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (agent_id) REFERENCES agents(id)
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create hooks table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS hooks (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            trigger_type TEXT NOT NULL,
            trigger_config TEXT NOT NULL, -- JSON
            action_type TEXT NOT NULL,
            action_config TEXT NOT NULL, -- JSON
            enabled BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create settings table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'json')),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create indexes for better performance
    create_indexes(pool).await?;

    log::info!("Database migrations completed successfully");
    Ok(())
}

async fn create_indexes(pool: &SqlitePool) -> Result<()> {
    let indexes = vec![
        // Sessions indexes
        "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity)",
        
        // Chats indexes
        "CREATE INDEX IF NOT EXISTS idx_chats_session_id ON chats(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_chats_project_id ON chats(project_id)",
        "CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_chats_is_favorite ON chats(is_favorite)",
        
        // Messages indexes
        "CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)",
        "CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role)",
        
        // Agents indexes
        "CREATE INDEX IF NOT EXISTS idx_agents_enabled ON agents(enabled)",
        "CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at)",
        
        // Agent runs indexes
        "CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON agent_runs(agent_id)",
        "CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status)",
        "CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON agent_runs(started_at)",
        
        // Hooks indexes
        "CREATE INDEX IF NOT EXISTS idx_hooks_enabled ON hooks(enabled)",
        "CREATE INDEX IF NOT EXISTS idx_hooks_trigger_type ON hooks(trigger_type)",
        
        // Session analytics indexes
        "CREATE INDEX IF NOT EXISTS idx_session_analytics_session_id ON session_analytics(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_session_analytics_date ON session_analytics(date)",
    ];

    for index_sql in indexes {
        sqlx::query(index_sql).execute(pool).await?;
    }

    log::info!("Database indexes created successfully");
    Ok(())
}