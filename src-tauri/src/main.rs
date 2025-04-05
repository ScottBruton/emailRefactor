// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_store::StoreBuilder;
use tauri::{Manager, menu::{Menu, MenuItem}, tray::TrayIconBuilder, WindowEvent, Event,RunEvent};
use emailrefactor_lib::run;

use tauri::tray::TrayIconEvent;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
use log::{info, error};

fn main() {
    // Initialize logging
    simple_logger::init_with_level(log::Level::Debug).unwrap();
    info!("Application starting...");
    
    run();
}
