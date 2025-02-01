use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;
use tauri::{AppHandle, Runtime, State};

struct DocumentPath(Mutex<Option<PathBuf>>);

// Helper function to ensure documents directory exists and return its path
fn ensure_documents_dir<R: Runtime>(
    handle: &impl Manager<R>,
    doc_path: &State<DocumentPath>,
) -> Result<PathBuf, String> {
    if let Some(path) = doc_path.0.lock().unwrap().clone() {
        std::fs::create_dir_all(&path)
            .map_err(|e| format!("Failed to create documents directory: {}", e))?;
        return Ok(path);
    }

    let app_local_dir = handle
        .path()
        .app_local_data_dir()
        .expect("Failed to get app local data directory");
    println!("App local data directory: {:?}", app_local_dir);

    let documents_dir = app_local_dir.join("documents");
    println!("Documents directory: {:?}", documents_dir);
    std::fs::create_dir_all(&documents_dir)
        .map_err(|e| format!("Failed to create documents directory: {}", e))?;

    Ok(documents_dir)
}

#[tauri::command]
async fn set_document_path(path: String, doc_path: State<'_, DocumentPath>) -> Result<(), String> {
    let path = PathBuf::from(path);

    // Verify the directory exists or create it
    std::fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))?;

    // Update the stored path
    *doc_path.0.lock().unwrap() = Some(path);

    Ok(())
}

#[tauri::command]
async fn get_document_path(
    app: AppHandle,
    doc_path: State<'_, DocumentPath>,
) -> Result<String, String> {
    let path = ensure_documents_dir(&app, &doc_path)?;
    Ok(path.to_string_lossy().into_owned())
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn save_file(
    app: AppHandle,
    doc_path: State<'_, DocumentPath>,
    file_name: String,
    file_data: Vec<u8>,
) -> Result<String, String> {
    let documents_dir = ensure_documents_dir(&app, &doc_path)?;
    let file_path = documents_dir.join(&file_name);

    // Write the file
    std::fs::write(&file_path, file_data).map_err(|e| format!("Failed to write file: {}", e))?;

    // Return the file path as a string
    Ok(file_path.to_string_lossy().into_owned())
}

#[tauri::command]
async fn get_file_path(
    app: AppHandle,
    doc_path: State<'_, DocumentPath>,
    file_name: String,
) -> Result<String, String> {
    let documents_dir = ensure_documents_dir(&app, &doc_path)?;
    let file_path = documents_dir.join(file_name);

    // Verify the file exists
    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }

    // Verify the file is within the documents directory
    if !file_path.starts_with(&documents_dir) {
        return Err("Invalid file path".to_string());
    }

    Ok(file_path.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .manage(DocumentPath(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            greet,
            save_file,
            get_file_path,
            set_document_path,
            get_document_path
        ])
        .setup(|app| {
            // Ensure documents directory exists on startup
            let doc_path = app.state::<DocumentPath>();
            ensure_documents_dir(app, &doc_path).map_err(|e| {
                tauri::Error::from(std::io::Error::new(std::io::ErrorKind::Other, e))
            })?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
