// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use std::env;
use std::fs::OpenOptions;
use std::io::Write;
use chrono::Local;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct EnabledCategories {
    contentStyle: bool,
    purpose: bool,
    formality: bool,
    personalization: bool,
    emotion: bool,
    audience: bool,
    industry: bool,
    timeSensitivity: bool,
    relationship: bool,
    communicationGoal: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmailStyles {
    // Content Style & Formatting
    tone: String,
    languageComplexity: String,
    grammarSpelling: String,
    conciseness: String,
    structure: String,
    formatting: String,
    emailLength: String,
    clarity: String,
    // Purpose & Intent
    purpose: String,
    // Formality & Professionalism
    formality: String,
    // Personalization
    greeting: String,
    signoff: String,
    includeDetails: String,
    dynamicContent: String,
    // Emotion & Sentiment
    emotion: String,
    // Audience Adaptation
    audienceExpertise: String,
    hierarchicalContext: String,
    ageAppropriate: String,
    culturalSensitivity: String,
    // Industry-Specific Language
    industryContext: String,
    // Time Sensitivity
    urgency: String,
    // Relationship Context
    relationshipType: String,
    // Communication Goal
    goal: String,
    // Enabled Categories
    enabledCategories: EnabledCategories,
}

#[derive(Debug, Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Debug, Serialize)]
struct ChatCompletionRequest {
    model: String,
    messages: Vec<Message>,
    temperature: f32,
    max_tokens: i32,
}

#[derive(Debug, Deserialize)]
struct ChatCompletionResponse {
    choices: Vec<Choice>,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: ResponseMessage,
}

#[derive(Debug, Deserialize)]
struct ResponseMessage {
    content: Option<String>,
}

fn log_error(error: &str) {
    let log_dir = PathBuf::from("logs");
    std::fs::create_dir_all(&log_dir).unwrap_or_else(|e| eprintln!("Failed to create logs directory: {}", e));
    
    let log_file = log_dir.join("error.log");
    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    if let Ok(mut file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_file) {
        writeln!(file, "[{}] {}", timestamp, error).unwrap_or_else(|e| eprintln!("Failed to write to log file: {}", e));
    }
}

fn construct_system_prompt(styles: &EmailStyles) -> String {
    let mut prompt_parts = Vec::new();
    prompt_parts.push("Please refactor this email with the following styles:".to_string());

    if styles.enabledCategories.contentStyle {
        prompt_parts.push(format!(
            "Content Style:\n- Tone: {}\n- Language Complexity: {}\n- Grammar & Spelling: {}\n- Conciseness: {}\n- Structure: {}\n- Formatting: {}\n- Email Length: {}\n- Clarity: {}",
            styles.tone, styles.languageComplexity, styles.grammarSpelling, styles.conciseness,
            styles.structure, styles.formatting, styles.emailLength, styles.clarity
        ));
    }

    if styles.enabledCategories.purpose {
        prompt_parts.push(format!("Purpose: {}", styles.purpose));
    }

    if styles.enabledCategories.formality {
        prompt_parts.push(format!("Formality Level: {}", styles.formality));
    }

    if styles.enabledCategories.personalization {
        prompt_parts.push(format!(
            "Personalization:\n- Greeting Style: {}\n- Sign-off Style: {}\n- Detail Level: {}\n- Content Adaptation: {}",
            styles.greeting, styles.signoff, styles.includeDetails, styles.dynamicContent
        ));
    }

    if styles.enabledCategories.emotion {
        prompt_parts.push(format!("Emotional Tone: {}", styles.emotion));
    }
    
    if styles.enabledCategories.audience {
        prompt_parts.push(format!(
            "Audience Adaptation:\n- Audience Expertise: {}\n- Hierarchical Context: {}\n- Age Appropriateness: {}\n- Cultural Sensitivity: {}",
            styles.audienceExpertise, styles.hierarchicalContext, styles.ageAppropriate, styles.culturalSensitivity
        ));
    }
    
    if styles.enabledCategories.industry {
        prompt_parts.push(format!("Industry-Specific Language: {}", styles.industryContext));
    }
    
    if styles.enabledCategories.timeSensitivity {
        prompt_parts.push(format!("Time Sensitivity/Urgency: {}", styles.urgency));
    }
    
    if styles.enabledCategories.relationship {
        prompt_parts.push(format!("Relationship Context: {}", styles.relationshipType));
    }
    
    if styles.enabledCategories.communicationGoal {
        prompt_parts.push(format!("Communication Goal: {}", styles.goal));
    }

    prompt_parts.join("\n\n")
}

fn construct_response_system_prompt(styles: &EmailStyles, original_email: &str) -> String {
    let mut prompt_parts = Vec::new();
    prompt_parts.push("Please refactor this email as a RESPONSE to the original email, with the following styles:".to_string());

    if styles.enabledCategories.contentStyle {
        prompt_parts.push(format!(
            "Content Style:\n- Tone: {}\n- Language Complexity: {}\n- Grammar & Spelling: {}\n- Conciseness: {}\n- Structure: {}\n- Formatting: {}\n- Email Length: {}\n- Clarity: {}",
            styles.tone, styles.languageComplexity, styles.grammarSpelling, styles.conciseness,
            styles.structure, styles.formatting, styles.emailLength, styles.clarity
        ));
    }

    if styles.enabledCategories.purpose {
        prompt_parts.push(format!("Purpose: {}", styles.purpose));
    }

    if styles.enabledCategories.formality {
        prompt_parts.push(format!("Formality Level: {}", styles.formality));
    }

    if styles.enabledCategories.personalization {
        prompt_parts.push(format!(
            "Personalization:\n- Greeting Style: {}\n- Sign-off Style: {}\n- Detail Level: {}\n- Content Adaptation: {}",
            styles.greeting, styles.signoff, styles.includeDetails, styles.dynamicContent
        ));
    }

    if styles.enabledCategories.emotion {
        prompt_parts.push(format!("Emotional Tone: {}", styles.emotion));
    }
    
    if styles.enabledCategories.audience {
        prompt_parts.push(format!(
            "Audience Adaptation:\n- Audience Expertise: {}\n- Hierarchical Context: {}\n- Age Appropriateness: {}\n- Cultural Sensitivity: {}",
            styles.audienceExpertise, styles.hierarchicalContext, styles.ageAppropriate, styles.culturalSensitivity
        ));
    }
    
    if styles.enabledCategories.industry {
        prompt_parts.push(format!("Industry-Specific Language: {}", styles.industryContext));
    }
    
    if styles.enabledCategories.timeSensitivity {
        prompt_parts.push(format!("Time Sensitivity/Urgency: {}", styles.urgency));
    }
    
    if styles.enabledCategories.relationship {
        prompt_parts.push(format!("Relationship Context: {}", styles.relationshipType));
    }
    
    if styles.enabledCategories.communicationGoal {
        prompt_parts.push(format!("Communication Goal: {}", styles.goal));
    }

    prompt_parts.push(format!("\nOriginal email that you are responding to:\n{}", original_email));
    prompt_parts.push("Make sure to craft a response that directly addresses the points in the original email.".to_string());

    prompt_parts.join("\n\n")
}

#[tauri::command]
async fn refactor_email(text: String, original_email: String, is_response: bool, styles: EmailStyles) -> Result<String, String> {
    dotenv().ok();
    
    // Check for API key
    let api_key = match env::var("OPENAI_API_KEY") {
        Ok(key) => key,
        Err(e) => {
            let error_msg = format!("OpenAI API key not found: {}", e);
            log_error(&error_msg);
            return Err(error_msg);
        }
    };
    
    // Construct system prompt based on styles
    let system_prompt = if is_response {
        construct_response_system_prompt(&styles, &original_email)
    } else {
        construct_system_prompt(&styles)
    };

    // Validate API key format
    if !api_key.starts_with("sk-") {
        let error_msg = "Invalid OpenAI API key format".to_string();
        log_error(&error_msg);
        return Err(error_msg);
    }

    let mut prompt_parts = Vec::new();
    prompt_parts.push(system_prompt);
    prompt_parts.push(format!("\nOriginal email:\n{}", text));

    let prompt = prompt_parts.join("\n\n");

    let client = reqwest::Client::new();
    let request = ChatCompletionRequest {
        model: "gpt-4".to_string(),
        messages: vec![Message {
            role: "user".to_string(),
            content: prompt,
        }],
        temperature: 0.7,
        max_tokens: 2048,
    };

    match client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await {
            Ok(response) => {
                if !response.status().is_success() {
                    let error_msg = format!("OpenAI API error: {}", response.status());
                    log_error(&error_msg);
                    return Err(error_msg);
                }
                
                match response.json::<ChatCompletionResponse>().await {
                    Ok(response) => {
                        response
                            .choices
                            .first()
                            .and_then(|choice| choice.message.content.clone())
                            .ok_or_else(|| {
                                let error_msg = "No response generated".to_string();
                                log_error(&error_msg);
                                error_msg
                            })
                    }
                    Err(e) => {
                        let error_msg = format!("Failed to parse OpenAI response: {}", e);
                        log_error(&error_msg);
                        Err(error_msg)
                    }
                }
            }
            Err(e) => {
                let error_msg = format!("Failed to send request to OpenAI: {}", e);
                log_error(&error_msg);
                Err(error_msg)
            }
        }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![refactor_email])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
