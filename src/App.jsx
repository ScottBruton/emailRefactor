import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
// Removing file system imports temporarily
// import { appDataDir } from "@tauri-apps/api/path";
// import { readTextFile, writeTextFile, createDir, exists } from "@tauri-apps/api/fs";
import "./App.css";
import darkIcon from '../assets/dark.svg';
import lightIcon from '../assets/light.svg';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [isResponseEmail, setIsResponseEmail] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('none');
  const [lastSavedSettings, setLastSavedSettings] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const styleControlsRef = useRef(null);
  
  const [enabledCategories, setEnabledCategories] = useState({
    contentStyle: false,
    purpose: false,
    formality: false,
    personalization: false,
    emotion: false,
    audience: false,
    industry: false,
    timeSensitivity: false,
    relationship: false,
    communicationGoal: false
  });

  const [styles, setStyles] = useState({
    // Content Style & Formatting
    tone: 'formal',
    languageComplexity: 'professional',
    grammarSpelling: 'strict',
    conciseness: 'brief',
    structure: 'paragraph',
    formatting: 'none',
    emailLength: 'medium',
    clarity: 'direct',
    // Purpose & Intent
    purpose: 'inquiry',
    // Formality & Professionalism
    formality: 'semiformal',
    // Personalization
    greeting: 'dear',
    signoff: 'regards',
    includeDetails: 'basic',
    dynamicContent: 'standard',
    // Emotion & Sentiment
    emotion: 'neutral',
    // Audience Adaptation
    audienceExpertise: 'non-technical',
    hierarchicalContext: 'speaking-to-equals',
    ageAppropriate: 'adult',
    culturalSensitivity: 'universal',
    // Industry-Specific Language
    industryContext: 'general',
    // Time Sensitivity
    urgency: 'no-urgency',
    // Relationship Context
    relationshipType: 'established',
    // Communication Goal
    goal: 'inform'
  });

  // Preset definitions
  const presets = {
    none: { label: "None" },
    formal: { 
      label: "Formal Business", 
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: false,
          formality: true,
          personalization: true,
          emotion: false,
          audience: true,
          industry: true,
          timeSensitivity: false,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'formal',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'sincerely',
          audienceExpertise: 'non-technical',
          hierarchicalContext: 'speaking-to-equals',
          industryContext: 'business',
          relationshipType: 'professional-only',
          goal: 'inform'
        }
      }
    },
    casual: {
      label: "Casual Team",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: false,
          formality: true,
          personalization: true,
          emotion: true,
          audience: false,
          industry: false,
          timeSensitivity: false,
          relationship: true,
          communicationGoal: false
        },
        styles: {
          tone: 'friendly',
          formality: 'casual',
          greeting: 'hi',
          signoff: 'cheers',
          emotion: 'positive',
          relationshipType: 'established'
        }
      }
    },
    urgent: {
      label: "Urgent Request",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: false,
          emotion: true,
          audience: false,
          industry: false,
          timeSensitivity: true,
          relationship: false,
          communicationGoal: true
        },
        styles: {
          tone: 'authoritative',
          conciseness: 'brief',
          clarity: 'direct',
          purpose: 'request',
          formality: 'semiformal',
          emotion: 'urgent',
          urgency: 'immediate-action',
          goal: 'request-action'
        }
      }
    },
    technical: {
      label: "Technical Report",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: false,
          emotion: false,
          audience: true,
          industry: true,
          timeSensitivity: false,
          relationship: false,
          communicationGoal: true
        },
        styles: {
          tone: 'formal',
          languageComplexity: 'professional',
          conciseness: 'detailed',
          structure: 'paragraph',
          purpose: 'inform',
          formality: 'formal',
          audienceExpertise: 'technical',
          industryContext: 'technical',
          goal: 'inform'
        }
      }
    },
    apology: {
      label: "Apology",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: false,
          industry: false,
          timeSensitivity: false,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'apologetic',
          purpose: 'apology',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'sincerely',
          emotion: 'concerned',
          relationshipType: 'established',
          goal: 'build-relationship'
        }
      }
    }
  };
  
  const categories = {
    contentStyle: {
      title: "Content Style & Formatting",
      options: {
        tone: ["formal", "informal", "friendly", "authoritative", "apologetic", "persuasive", "humorous", "sarcastic", "inspirational", "diplomatic", "enthusiastic", "respectful", "sympathetic", "assertive", "curious"],
        languageComplexity: ["simple", "professional", "academic", "casual"],
        grammarSpelling: ["strict", "relaxed", "conversational"],
        conciseness: ["brief", "detailed"],
        structure: ["paragraph", "bullet-points", "numbered-lists"],
        formatting: ["none", "bold", "italics", "underlines", "hyperlinks"],
        emailLength: ["short", "medium", "long"],
        clarity: ["direct", "nuanced"]
      }
    },
    purpose: {
      title: "Purpose & Intent",
      options: {
        purpose: ["inquiry", "response", "request", "follow-up", "reminder", "apology", "thank-you", "complaint", "persuasion", "invitation"]
      }
    },
    formality: {
      title: "Formality & Professionalism",
      options: {
        formality: ["casual", "semiformal", "formal"]
      }
    },
    personalization: {
      title: "Personalization",
      options: {
        greeting: ["dear", "hi", "hello"],
        signoff: ["best", "regards", "sincerely", "cheers"],
        includeDetails: ["none", "basic", "detailed"],
        dynamicContent: ["standard", "cultural", "contextual"]
      }
    },
    emotion: {
      title: "Emotion & Sentiment",
      options: {
        emotion: ["neutral", "positive", "urgent", "empathetic", "encouraging", "critical", "excited", "disappointed", "hopeful", "surprised", "grateful", "concerned", "confident"]
      }
    },
    audience: {
      title: "Audience Adaptation",
      options: {
        audienceExpertise: ["technical", "non-technical", "mixed"],
        hierarchicalContext: ["speaking-to-superiors", "speaking-to-equals", "speaking-to-subordinates"],
        ageAppropriate: ["youth", "adult", "senior", "all-ages"],
        culturalSensitivity: ["regional", "international", "universal"]
      }
    },
    industry: {
      title: "Industry-Specific Language",
      options: {
        industryContext: ["general", "business", "academic", "legal", "medical", "technical", "creative", "marketing"]
      }
    },
    timeSensitivity: {
      title: "Time Sensitivity",
      options: {
        urgency: ["immediate-action", "time-bound", "no-urgency"]
      }
    },
    relationship: {
      title: "Relationship Context",
      options: {
        relationshipType: ["first-contact", "established", "close", "professional-only"]
      }
    },
    communicationGoal: {
      title: "Communication Goal",
      options: {
        goal: ["inform", "persuade", "build-relationship", "collaborate", "request-action", "problem-solve"]
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (styleControlsRef.current && !styleControlsRef.current.contains(event.target)) {
        setExpandedCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    Object.entries(enabledCategories).forEach(([key, enabled]) => {
      if (!enabled && expandedCategory === key) {
        setExpandedCategory(null);
      }
    });
  }, [enabledCategories, expandedCategory]);

  useEffect(() => {
    // Load saved settings when the app starts
    loadSettings();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const handleCategoryClick = (categoryKey, event) => {
    // If the click is on the toggle button, don't handle expansion
    if (event.target.closest('.toggle')) {
      return;
    }
    
    if (!enabledCategories[categoryKey]) {
      setExpandedCategory(null);
      return;
    }
    setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey);
  };

  const handleToggleClick = (categoryKey, event) => {
    event.stopPropagation();
    const newEnabled = !enabledCategories[categoryKey];
    setEnabledCategories({
      ...enabledCategories,
      [categoryKey]: newEnabled
    });
    // If we're disabling a category, collapse it
    if (!newEnabled && expandedCategory === categoryKey) {
      setExpandedCategory(null);
    }
    // When settings change, set preset to 'none'
    setSelectedPreset('none');
  };

  const handlePresetChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedPreset(selectedValue);
    
    if (selectedValue !== 'none') {
      const preset = presets[selectedValue];
      if (preset && preset.settings) {
        // Apply preset settings
        if (preset.settings.enabledCategories) {
          setEnabledCategories({
            ...enabledCategories,
            ...preset.settings.enabledCategories
          });
        }
        
        if (preset.settings.styles) {
          setStyles({
            ...styles,
            ...preset.settings.styles
          });
        }
      }
    }
  };

  const handleRevertToSaved = () => {
    if (lastSavedSettings) {
      // Apply saved settings
      if (lastSavedSettings.enabledCategories) {
        setEnabledCategories(lastSavedSettings.enabledCategories);
      }
      
      if (lastSavedSettings.styles) {
        setStyles(lastSavedSettings.styles);
      }
      
      if (lastSavedSettings.isResponseEmail !== undefined) {
        setIsResponseEmail(lastSavedSettings.isResponseEmail);
      }
      
      // Reset preset selection
      setSelectedPreset('none');
      
      // Show temporary success message
      const successMessage = document.getElementById('revert-success-message');
      if (successMessage) {
        successMessage.style.opacity = '1';
        setTimeout(() => {
          successMessage.style.opacity = '0';
        }, 3000);
      }
    } else {
      setError('No saved settings found to revert to.');
    }
  };

  const handleClearSettings = () => {
    // Reset to default settings (initial state)
    setEnabledCategories({
      contentStyle: false,
      purpose: false,
      formality: false,
      personalization: false,
      emotion: false,
      audience: false,
      industry: false,
      timeSensitivity: false,
      relationship: false,
      communicationGoal: false
    });
    
    setStyles({
      // Content Style & Formatting
      tone: 'formal',
      languageComplexity: 'professional',
      grammarSpelling: 'strict',
      conciseness: 'brief',
      structure: 'paragraph',
      formatting: 'none',
      emailLength: 'medium',
      clarity: 'direct',
      // Purpose & Intent
      purpose: 'inquiry',
      // Formality & Professionalism
      formality: 'semiformal',
      // Personalization
      greeting: 'dear',
      signoff: 'regards',
      includeDetails: 'basic',
      dynamicContent: 'standard',
      // Emotion & Sentiment
      emotion: 'neutral',
      // Audience Adaptation
      audienceExpertise: 'non-technical',
      hierarchicalContext: 'speaking-to-equals',
      ageAppropriate: 'adult',
      culturalSensitivity: 'universal',
      // Industry-Specific Language
      industryContext: 'general',
      // Time Sensitivity
      urgency: 'no-urgency',
      // Relationship Context
      relationshipType: 'established',
      // Communication Goal
      goal: 'inform'
    });
    
    // Reset response email setting
    setIsResponseEmail(false);
    
    // Reset preset selection
    setSelectedPreset('none');
    
    // Show temporary success message
    const successMessage = document.getElementById('clear-success-message');
    if (successMessage) {
      successMessage.style.opacity = '1';
      setTimeout(() => {
        successMessage.style.opacity = '0';
      }, 3000);
    }
  };

  const handleRefactor = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to refactor');
      return;
    }

    if (isResponseEmail && !originalEmail.trim()) {
      setError('Cannot generate a response to an empty email. Please paste the original email you are responding to.');
      return;
    }

    // Check if at least one category is enabled
    const hasEnabledCategory = Object.values(enabledCategories).some(value => value === true);
    if (!hasEnabledCategory) {
      setError('Please enable at least one refactoring setting category.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await invoke('refactor_email', { 
        text: inputText,
        originalEmail: isResponseEmail ? originalEmail : '',
        isResponse: isResponseEmail,
        styles: {
          ...styles,
          enabledCategories
        }
      });
      setOutputText(result);
    } catch (error) {
      console.error('Error refactoring email:', error);
      setError('Failed to refactor email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
    } catch (error) {
      console.error('Failed to copy text:', error);
      setError('Failed to copy text to clipboard');
    }
  };

  const toggleSidebar = () => {
    setSidebarHidden(!sidebarHidden);
  };

  const saveSettings = () => {
    try {
      setIsSaving(true);
      
      const settingsData = {
        enabledCategories,
        styles,
        isResponseEmail
      };
      
      localStorage.setItem('emailRefactorSettings', JSON.stringify(settingsData));
      
      // Store the saved settings for revert functionality
      setLastSavedSettings(settingsData);
      
      setError(null);
      
      // Show temporary success message
      const successMessage = document.getElementById('save-success-message');
      if (successMessage) {
        successMessage.style.opacity = '1';
        setTimeout(() => {
          successMessage.style.opacity = '0';
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSettings = () => {
    try {
      const settingsContent = localStorage.getItem('emailRefactorSettings');
      
      if (!settingsContent) {
        // No settings yet, use defaults
        console.log('No settings found. Using defaults.');
        return;
      }
      
      const settingsData = JSON.parse(settingsContent);
      
      // Apply saved settings
      if (settingsData.enabledCategories) {
        setEnabledCategories(settingsData.enabledCategories);
      }
      
      if (settingsData.styles) {
        setStyles(settingsData.styles);
      }
      
      if (settingsData.isResponseEmail !== undefined) {
        setIsResponseEmail(settingsData.isResponseEmail);
      }
      
      // Store the loaded settings for revert functionality
      setLastSavedSettings(settingsData);
      
      console.log('Settings loaded successfully.');
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings.');
    }
  };

  const renderStyleControls = () => {
    return (
      <div className={`sidebar-container ${sidebarHidden ? 'hidden' : ''}`}>
        <div className="style-controls">
          <div className="sidebar-header">
            <div className="settings-controls">
              <div className="preset-label">Presets</div>
              <select 
                className="preset-dropdown"
                value={selectedPreset}
                onChange={handlePresetChange}
                title="Select a preset for different email types"
              >
                {Object.entries(presets).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.label}</option>
                ))}
              </select>
              
              <button 
                className="save-settings-button" 
                onClick={saveSettings}
                title="Save current settings"
                disabled={isSaving}
                aria-label="Save settings"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              </button>
              
              <button 
                className="revert-settings-button" 
                onClick={handleRevertToSaved}
                title="Revert to last saved settings"
                disabled={!lastSavedSettings}
                aria-label="Revert to saved settings"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
              
              <button 
                className="clear-settings-button" 
                onClick={handleClearSettings}
                title="Reset all settings to default"
                aria-label="Clear all settings"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
            <div className="messages-container">
              <span id="save-success-message" className="save-success-message">Settings saved!</span>
              <span id="revert-success-message" className="revert-success-message">Settings reverted!</span>
              <span id="clear-success-message" className="clear-success-message">Settings cleared!</span>
            </div>
          </div>
          <div className="style-categories-container">
            {Object.entries(categories).map(([categoryKey, category]) => (
              <div key={categoryKey} className="style-category">
                <div 
                  className="category-header"
                  onClick={(e) => handleCategoryClick(categoryKey, e)}
                >
                  <span className="category-title">{category.title}</span>
                  <div className="toggle" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={enabledCategories[categoryKey]}
                      onChange={(e) => handleToggleClick(categoryKey, e)}
                    />
                  </div>
                </div>
                <div 
                  className={`category-controls ${
                    expandedCategory === categoryKey && enabledCategories[categoryKey] ? 'expanded' : ''
                  } ${!enabledCategories[categoryKey] ? 'disabled' : ''}`}
                >
                  {Object.entries(category.options).map(([optionKey, values]) => (
                    <div key={optionKey} className="control-group">
                      <label className="control-label">
                        {optionKey.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())}
                      </label>
                      <select
                        value={styles[optionKey]}
                        onChange={(e) => setStyles({...styles, [optionKey]: e.target.value})}
                        disabled={!enabledCategories[categoryKey]}
                      >
                        {values.map(value => (
                          <option key={value} value={value}>
                            {value.replace(/-/g, ' ').replace(/^./, str => str.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={sidebarHidden ? 'Show sidebar' : 'Hide sidebar'}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="currentColor"
            width="24"
            height="24"
          >
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </button>
      </div>
    );
  };

  // Add new handlers for modal
  const openModal = () => {
    if (isResponseEmail) {
      setIsModalOpen(true);
    }
  };

  const closeModal = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setIsModalOpen(false);
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleOverlayClick = () => {
    closeModal();
  };

  // Update the response toggle handler
  const handleResponseToggle = () => {
    setIsResponseEmail(!isResponseEmail);
    if (!isResponseEmail) {
      setOriginalEmail('');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="container">
      {renderStyleControls()}
      <div className={`main-content ${sidebarHidden ? 'sidebar-hidden' : ''}`}>
        <div className="theme-toggle-container">
          <label className="theme-toggle-label">
            <span>Dark Theme</span>
            <div className="toggle">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
              />
            </div>
          </label>
        </div>
        {error && <div className="error-message">{error}</div>}
        
        <div className="response-toggle-container">
          <label className="response-toggle-label">
            <span>Response Email</span>
            <div className="toggle">
              <input
                type="checkbox"
                checked={isResponseEmail}
                onChange={handleResponseToggle}
              />
            </div>
          </label>
        </div>
        
        <div className="content-flex-container">
          {isResponseEmail && (
            <textarea
              className="response-email-preview"
              value={originalEmail}
              onChange={(e) => setOriginalEmail(e.target.value)}
              onClick={openModal}
              placeholder="Click to add the original email you're responding to..."
              readOnly
            />
          )}
          
          <div className="panels">
            <textarea
              className="input-panel"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your email text here..."
              disabled={isLoading}
              rows={25}
            />
            <div className="output-container">
              <textarea
                className="output-panel"
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                placeholder="Refactored email will appear here..."
                disabled={isLoading}
                rows={25}
                readOnly
              />
              <button
                className="copy-button"
                onClick={handleCopy}
                disabled={!outputText || isLoading}
              >
                Copy
              </button>
            </div>
          </div>

          <button 
            onClick={handleRefactor} 
            className="refactor-button"
            disabled={isLoading || !inputText.trim() || !Object.values(enabledCategories).some(value => value === true)}
          >
            {isLoading ? 'Refactoring...' : 'Refactor Email'}
          </button>
          
          <div className="active-settings-summary">
            <div className="settings-header">Active Settings</div>
            <div className="settings-content">
              {!Object.values(enabledCategories).some(value => value === true) ? (
                <div className="no-settings">No refactor settings selected</div>
              ) : (
                <>
                  {enabledCategories.contentStyle && 
                    <div><span className="setting-category">Content:</span> {styles.tone}, {styles.languageComplexity}, {styles.grammarSpelling}, {styles.conciseness}, {styles.structure}, {styles.formatting}, {styles.emailLength}, {styles.clarity}</div>
                  }
                  {enabledCategories.purpose && 
                    <div><span className="setting-category">Purpose:</span> {styles.purpose}</div>
                  }
                  {enabledCategories.formality && 
                    <div><span className="setting-category">Formality:</span> {styles.formality}</div>
                  }
                  {enabledCategories.personalization && 
                    <div><span className="setting-category">Personalization:</span> {styles.greeting}, {styles.signoff}, {styles.includeDetails}, {styles.dynamicContent}</div>
                  }
                  {enabledCategories.emotion && 
                    <div><span className="setting-category">Emotion:</span> {styles.emotion}</div>
                  }
                  {enabledCategories.audience && 
                    <div><span className="setting-category">Audience:</span> {styles.audienceExpertise}, {styles.hierarchicalContext}, {styles.ageAppropriate}, {styles.culturalSensitivity}</div>
                  }
                  {enabledCategories.industry && 
                    <div><span className="setting-category">Industry:</span> {styles.industryContext}</div>
                  }
                  {enabledCategories.timeSensitivity && 
                    <div><span className="setting-category">Time Sensitivity:</span> {styles.urgency}</div>
                  }
                  {enabledCategories.relationship && 
                    <div><span className="setting-category">Relationship:</span> {styles.relationshipType}</div>
                  }
                  {enabledCategories.communicationGoal && 
                    <div><span className="setting-category">Goal:</span> {styles.goal}</div>
                  }
                  {isResponseEmail && 
                    <div><span className="setting-category">Mode:</span> Response Email</div>
                  }
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <button 
        className="theme-toggle-button"
        onClick={toggleTheme}
        aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
      >
        <img 
          src={isDarkMode ? lightIcon : darkIcon} 
          alt={isDarkMode ? "Light theme" : "Dark theme"}
        />
      </button>

      {/* Modal */}
      <div 
        className={`modal-overlay ${isModalOpen ? 'visible' : ''}`}
        onClick={handleOverlayClick}
      >
        <div className="modal-content" onClick={handleModalClick}>
          <div className="modal-header">
            <div className="modal-title">Original Email</div>
            <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>
          <textarea
            className="modal-textarea"
            value={originalEmail}
            onChange={(e) => setOriginalEmail(e.target.value)}
            placeholder="Paste the original email you're responding to here..."
          />
        </div>
      </div>
    </div>
  );
}

export default App;
