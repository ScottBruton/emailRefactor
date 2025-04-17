// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_store::StoreBuilder;
use tauri::{Manager, menu::{Menu, MenuItem}, tray::TrayIconBuilder, WindowEvent, Event,RunEvent};
use emailrefactor_lib::run;
use std::fs::OpenOptions;
use std::path::PathBuf;
use chrono::Local;
use log::{info, error, LevelFilter};
use tauri::tray::TrayIconEvent;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
use tauri_plugin_updater;

fn setup_logging() -> Result<(), Box<dyn std::error::Error>> {
    let log_dir = if cfg!(debug_assertions) {
        PathBuf::from("logs")
    } else {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("ScoBro Mail - Refactor");
        path.push("logs");
        path
    };

    std::fs::create_dir_all(&log_dir)?;

    let log_file = log_dir.join(format!("app_{}.log", Local::now().format("%Y%m%d_%H%M%S")));
    
    let file = OpenOptions::new()
        .write(true)
        .create(true)
        .append(true)
        .open(&log_file)?;

    let config = simplelog::Config::default();

    simplelog::CombinedLogger::init(vec![
        simplelog::WriteLogger::new(LevelFilter::Debug, config.clone(), file),
        simplelog::TermLogger::new(
            LevelFilter::Debug,
            config,
            simplelog::TerminalMode::Mixed,
            simplelog::ColorChoice::Auto,
        ),
    ])?;

    info!("Logging initialized. Log file: {:?}", log_file);
    Ok(())
}

fn main() {
    if let Err(e) = setup_logging() {
        eprintln!("Failed to initialize logging: {}", e);
    }

    info!("Application starting...");
    
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            info!("App version: {}", app.package_info().version.to_string());
            let window = app.get_webview_window("main").unwrap();
            window.open_devtools();
            Ok(())
        });

    info!("Builder configured, running application...");
    
    match app.run(tauri::generate_context!()) {
        Ok(_) => info!("Application terminated normally"),
        Err(e) => error!("Application terminated with error: {}", e),
    }
}
