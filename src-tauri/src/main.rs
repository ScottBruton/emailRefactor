// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// Comment this out during debugging to see console logs
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_store::StoreBuilder;
use tauri::{Manager, menu::{Menu, MenuItem}, tray::TrayIconBuilder, WindowEvent, Event, RunEvent};
use emailrefactor_lib::run;

use tauri::tray::TrayIconEvent;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

use log::{info, error, Level};
use simplelog::{WriteLogger, Config as LogConfig, LevelFilter};
use std::fs::File;

use tauri_plugin_updater;
use tauri_plugin_dialog;

#[tauri::command]
async fn graceful_restart(app: tauri::AppHandle) -> Result<(), String> {
    app.restart();
    Ok(())
}

fn main() {
    info!("Updater checking endpoint: {:?}", std::env::var("TAURI_CONF_json").ok());
    // Log to file so we can see errors in release mode
    WriteLogger::init(
        LevelFilter::Debug,
        LogConfig::default(),
        File::create("updater-log.txt").unwrap()
    ).unwrap();

    info!("Application starting...");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![graceful_restart])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
