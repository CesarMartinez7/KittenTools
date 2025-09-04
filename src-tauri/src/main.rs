#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::command;
use reqwest::{Client, Method};
use std::collections::HashMap;
use std::time::Instant;
use serde::{Deserialize, Serialize};

// Definición de la estructura ApiResponse
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ApiResponse {
    data: String,
    status: u16,
    headers: HashMap<String, String>,
    time_response: String,
    is_error: bool,
}

// -------------------- COMANDOS --------------------
#[command]
async fn http_request(
    url: String,
    method: String,
    headers: Option<HashMap<String, String>>,
    body: Option<String>,
) -> Result<ApiResponse, String> {
    let client = Client::new();

    let method: Method = method
        .parse::<Method>()
        .map_err(|e| e.to_string())?;

    let mut request = client.request(method, &url);

    if let Some(h) = &headers {
        for (k, v) in h {
            request = request.header(k, v);
        }
    }

    if headers
        .as_ref()
        .map_or(true, |h| !h.contains_key("User-Agent"))
    {
        request = request.header("User-Agent", "Elisa-App/0.1.0");
    }

    if let Some(b) = body {
        request = request.body(b);
    }

    let start_time = Instant::now();
    let response = request.send().await.map_err(|e| e.to_string())?;
    let end_time = Instant::now();

    let status = response.status();
    let headers_map: HashMap<String, String> = response
        .headers()
        .iter()
        .map(|(name, value)| {
            (
                name.to_string(),
                String::from_utf8_lossy(value.as_bytes()).into_owned(),
            )
        })
        .collect();

    let text = response.text().await.map_err(|e| e.to_string())?;

    let elapsed_time = (end_time - start_time).as_secs_f64();
    let is_error = status.is_server_error() || status.is_client_error();

    let api_response = ApiResponse {
        data: text,
        status: status.as_u16(),
        headers: headers_map,
        time_response: format!("{:.3}", elapsed_time),
        is_error,
    };

    Ok(api_response)
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