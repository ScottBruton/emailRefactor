import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [isResponseEmail, setIsResponseEmail] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');
  
  const styleControlsRef = useRef(null);
  
  const [enabledCategories, setEnabledCategories] = useState({
    contentStyle: true,
    purpose: true,
    formality: true,
    personalization: true,
    emotion: true,
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

  const renderStyleControls = () => {
    return (
      <div className={`sidebar-container ${sidebarHidden ? 'hidden' : ''}`}>
        <div className="style-controls">
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

  return (
    <div className="container">
      {renderStyleControls()}
      <div className={`main-content ${sidebarHidden ? 'sidebar-hidden' : ''}`}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="response-toggle-container">
          <label className="response-toggle-label">
            <span>Response Email</span>
            <div className="toggle">
              <input
                type="checkbox"
                checked={isResponseEmail}
                onChange={() => setIsResponseEmail(!isResponseEmail)}
              />
            </div>
          </label>
        </div>
        
        {isResponseEmail && (
          <div className="original-email-container">
            <textarea
              value={originalEmail}
              onChange={(e) => setOriginalEmail(e.target.value)}
              placeholder="Paste the original email you're responding to here..."
              className="original-email-input"
            />
          </div>
        )}
        
        <div className="panels">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your email text here..."
            className="input-panel"
            disabled={isLoading}
          />
          <div className="output-container">
            <textarea
              value={outputText}
              readOnly
              className="output-panel"
              placeholder="Refactored email will appear here..."
            />
            <button 
              onClick={handleCopy} 
              className="copy-button"
              disabled={!outputText || isLoading}
            >
              Copy
            </button>
          </div>
        </div>

        <button 
          onClick={handleRefactor} 
          className="refactor-button"
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? 'Refactoring...' : 'Refactor Email'}
        </button>
        
        <div className="active-settings-summary">
          <div className="settings-header">Active Settings</div>
          <div className="settings-content">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
