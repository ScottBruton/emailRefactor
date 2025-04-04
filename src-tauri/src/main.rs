// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_store::StoreBuilder;
use tauri::{Manager, menu::{Menu, MenuItem}, tray::TrayIconBuilder, WindowEvent};
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

            // Handle window close button click
            let window = app.get_webview_window("main").unwrap();
            let window_handle = window.clone();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { .. } = event {
                    info!("Window close requested");
                    // Show confirmation dialog
                    let app_handle = window_handle.app_handle();
                    let should_minimize = app_handle.dialog()
                        .message("Do you want to minimize to tray or quit the application?")
                        .title("Close Application")
                        .buttons(MessageDialogButtons::OkCancelCustom("Minimize".to_string(), "Quit".to_string()))
                        .blocking_show();

                    info!("Dialog result: {}", should_minimize);
                    if should_minimize {
                        info!("Minimize to tray requested");
                        // User clicked "Minimize" - minimize to tray
                        window_handle.hide().unwrap();
                        info!("Window hidden");
                    } else {
                        info!("Quit requested from dialog");
                        // User clicked "Quit" - quit the application
                        app_handle.exit(0);
                    }
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
