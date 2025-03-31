// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_store::StoreBuilder;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            // Create a store for our app's settings
            let handle = app.handle();
            let settings_path = handle
                .path()
                .app_config_dir()
                .unwrap()
                .join("settings.json");

            // Initialize the store
            let store = StoreBuilder::new(handle, settings_path).build();
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
