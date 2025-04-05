// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_store::StoreBuilder;
use tauri::{Manager, menu::{Menu, MenuItem}, tray::TrayIconBuilder, WindowEvent, Event,RunEvent};


use tauri::tray::TrayIconEvent;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
use log::{info, error};

fn main() {
    // Initialize logging
    simple_logger::init_with_level(log::Level::Debug).unwrap();
    info!("Application starting...");

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            info!("Setting up application...");
            // Create a store for our app's settings
            let handle = app.handle();
            let settings_path = handle
                .path()
                .app_config_dir()
                .unwrap()
                .join("settings.json");

            // Initialize the store
            let store = StoreBuilder::new(handle, settings_path).build();

            // Create the tray menu
            let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let hide = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            
            let menu = Menu::with_items(app, &[&show, &hide, &MenuItem::new(app, "---", true, None::<&str>)?, &quit])?;

            // Create the tray icon
            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| {
                    info!("Tray menu event: {:?}", event.id);
                    let window = app.get_webview_window("main").unwrap();
                    match event.id.as_ref() {
                        "show" => {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                        "hide" => {
                            window.hide().unwrap();
                        }
                        "quit" => {
                            info!("Quit requested from tray menu");
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: tauri::tray::MouseButton::Left, .. } = event {
                        let window = tray.app_handle().get_webview_window("main").unwrap();
                        if window.is_visible().unwrap() {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                })
                .build(app)?;
            
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                info!("Window close requested");
                let app_handle = window.app_handle();
                
                // Show confirmation dialog
                let should_minimize = app_handle.dialog()
                    .message("Do you want to minimize to tray or quit the application?")
                    .title("Close Application")
                    .buttons(MessageDialogButtons::OkCancelCustom("Minimize".to_string(), "Quit".to_string()))
                    .blocking_show();

                info!("Dialog result: {}", should_minimize);
                if should_minimize {
                    info!("Minimize to tray requested");
                    window.hide().unwrap();
                    info!("Window hidden");
                    api.prevent_close();
                } else {
                    info!("Quit requested from dialog");
                    app_handle.exit(0);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
