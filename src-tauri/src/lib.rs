use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;
use tauri::{AppHandle, Runtime, State};
use std::fs;

struct DocumentPath(Mutex<Option<PathBuf>>);

// Helper function to get the path where we store the custom document path configuration
fn get_config_file_path<R: Runtime>(handle: &impl Manager<R>) -> PathBuf {
    handle
        .path()
        .app_config_dir()
        .expect("Failed to get app config directory")
        .join("document_path.txt")
}

// Helper function to persist the document path to disk
fn persist_document_path<R: Runtime>(
    handle: &impl Manager<R>,
    path: &Option<PathBuf>,
) -> Result<(), String> {
    let config_path = get_config_file_path(handle);
    
    // Create config directory if it doesn't exist
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    if let Some(path) = path {
        fs::write(&config_path, path.to_string_lossy().as_bytes())
            .map_err(|e| format!("Failed to write config file: {}", e))?;
    } else {
        // If path is None, remove the config file if it exists
        if config_path.exists() {
            fs::remove_file(&config_path)
                .map_err(|e| format!("Failed to remove config file: {}", e))?;
        }
    }
    Ok(())
}

// Helper function to load the persisted document path
fn load_document_path<R: Runtime>(handle: &impl Manager<R>) -> Option<PathBuf> {
    let config_path = get_config_file_path(handle);
    
    if config_path.exists() {
        if let Ok(content) = fs::read_to_string(&config_path) {
            let path = PathBuf::from(content.trim());
            if path.exists() {
                return Some(path);
            }
        }
    }
    None
}

// Helper function to ensure documents directory exists and return its path
fn ensure_documents_dir<R: Runtime>(
    handle: &impl Manager<R>,
    doc_path: &State<DocumentPath>,
) -> Result<PathBuf, String> {
    // First check if we have a custom path set
    let path = doc_path.0.lock().unwrap().clone();
    
    // If we have a custom path, use it
    if let Some(custom_path) = path {
        std::fs::create_dir_all(&custom_path)
            .map_err(|e| format!("Failed to create custom documents directory: {}", e))?;
        return Ok(custom_path);
    }

    // If no custom path is set, use the default app directory
    let app_local_dir = handle
        .path()
        .app_local_data_dir()
        .expect("Failed to get app local data directory");

    let documents_dir = app_local_dir.join("documents");
    std::fs::create_dir_all(&documents_dir)
        .map_err(|e| format!("Failed to create default documents directory: {}", e))?;

    Ok(documents_dir)
}

#[tauri::command]
async fn set_document_path(
    app: AppHandle,
    path: String,
    doc_path: State<'_, DocumentPath>,
) -> Result<(), String> {
    let path = PathBuf::from(path);

    // Verify the directory exists or create it
    std::fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))?;

    // Update the stored path
    let mut lock = doc_path.0.lock().unwrap();
    *lock = Some(path);

    // Persist the path
    persist_document_path(&app, &lock)?;

    Ok(())
}

#[tauri::command]
async fn get_document_path(
    app: AppHandle,
    doc_path: State<'_, DocumentPath>,
) -> Result<String, String> {
    // First check if we have a custom path set
    if let Some(custom_path) = doc_path.0.lock().unwrap().clone() {
        return Ok(custom_path.to_string_lossy().into_owned());
    }
    
    // If no custom path, fall back to default
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
    let file_path = documents_dir.join(&file_name);

    // Verify the file exists
    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }

    // If we have a custom path, we don't need to verify it's within the documents directory
    if doc_path.0.lock().unwrap().is_some() {
        return Ok(file_path.to_string_lossy().into_owned());
    }

    // For default path, verify the file is within the documents directory
    if !file_path.starts_with(&documents_dir) {
        return Err("Invalid file path".to_string());
    }

    Ok(file_path.to_string_lossy().into_owned())
}

#[tauri::command]
async fn test_file_access(
    app: AppHandle,
    doc_path: State<'_, DocumentPath>,
    file_name: String,
) -> Result<String, String> {
    // Get the current document path setting
    let current_setting = doc_path.0.lock().unwrap().clone();
    let mut result = String::new();
    
    result.push_str(&format!("Current document path setting: {:?}\n", current_setting));
    
    // Get the documents directory
    let documents_dir = ensure_documents_dir(&app, &doc_path)?;
    result.push_str(&format!("Documents directory: {:?}\n", documents_dir));
    
    // Construct and check the file path
    let file_path = documents_dir.join(&file_name);
    result.push_str(&format!("Full file path: {:?}\n", file_path));
    
    // Check if file exists
    if file_path.exists() {
        result.push_str("File exists: Yes\n");
        
        // Try to read a few bytes to verify permissions
        match std::fs::read(&file_path) {
            Ok(bytes) => {
                result.push_str(&format!("File is readable: Yes (size: {} bytes)\n", bytes.len()));
            }
            Err(e) => {
                result.push_str(&format!("File exists but cannot be read: {}\n", e));
            }
        }
    } else {
        result.push_str("File exists: No\n");
    }
    
    Ok(result)
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
            get_document_path,
            test_file_access
        ])
        .setup(|app| {
            // Load persisted document path on startup
            let doc_path = app.state::<DocumentPath>();
            if let Some(persisted_path) = load_document_path(app) {
                *doc_path.0.lock().unwrap() = Some(persisted_path);
            }
            
            // Ensure documents directory exists
            ensure_documents_dir(app, &doc_path).map_err(|e| {
                tauri::Error::from(std::io::Error::new(std::io::ErrorKind::Other, e))
            })?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
