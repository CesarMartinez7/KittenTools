#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::command;
use reqwest::{Client, Method};
use std::collections::HashMap;

// -------------------- COMANDOS --------------------
#[command]
async fn http_request(
    url: String,
    method: String,
    headers: Option<HashMap<String, String>>,
    body: Option<String>,
) -> Result<String, String> {
    let client = Client::new();

    let method: Method = method
        .parse::<Method>()
        .map_err(|e| e.to_string())?;

    let mut request = client.request(method, &url);

    // Añadimos headers del usuario
    if let Some(h) = &headers {
        for (k, v) in h {
            request = request.header(k, v);
        }
    }

    // Siempre asegurarse de tener un User-Agent
    if headers
        .as_ref()
        .map_or(true, |h| !h.contains_key("User-Agent"))
    {
        request = request.header("User-Agent", "ELisa-App/0.1.0");
    }

    // Body opcional
    if let Some(b) = body {
        request = request.body(b);
    }

    let response = request.send().await.map_err(|e| e.to_string())?;
    let text = response.text().await.map_err(|e| e.to_string())?;

    Ok(text)
}

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// -------------------- ENTRY POINT --------------------
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, http_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
