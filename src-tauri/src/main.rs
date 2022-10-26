#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::time::Duration;

use ctx::Ctx;
use deoxit::CargoDirFilter;
use event::HubEvent;
use tauri::{AppHandle, Wry};
use tokio::sync::mpsc;
pub mod ctx;
pub mod event;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn some_quote(app: AppHandle<Wry>) -> String {
    tokio::time::sleep(Duration::from_secs(1)).await;

    " ... one second later".into()
}

#[tauri::command]
async fn update_root_path(root: String, app: AppHandle<Wry>) {
    let ctx = Ctx::from_app(app);

    let (sender, mut receiver) = mpsc::channel(64);
    let h = tokio::spawn(async move {
        let mut order = Vec::new();
        while let Some((path, size)) = receiver.recv().await {
            let index = order.partition_point(|x| *x > size);
            order.insert(index, size);
            ctx.emit_hub_event(HubEvent { index, path, size });
        }
    });

    // deoxit::find_cargo_dirs_channel("/home/sim", sender).await;
    deoxit::find_dirs_filter(root, CargoDirFilter, sender).await;

    let _ = tokio::join!(h);
}

#[tauri::command]
async fn clean_directory(path: String) {
    println!("clean {:?}", path);

    let out = std::process::Command::new("cargo")
        .current_dir(path)
        .args(["clean"])
        .output()
        .unwrap();

    println!("out: {:?}", out);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            some_quote,
            update_root_path,
            clean_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
