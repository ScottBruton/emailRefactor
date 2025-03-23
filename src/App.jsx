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
  
  const styleControlsRef = useRef(null);
  
  const [enabledCategories, setEnabledCategories] = useState({
    contentStyle: true,
    purpose: true,
    formality: true,
    personalization: true,
    emotion: true
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
    emotion: 'neutral'
  });

  const categories = {
    contentStyle: {
      title: "Content Style & Formatting",
      options: {
        tone: ["formal", "informal", "friendly", "authoritative", "apologetic", "persuasive"],
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
        emotion: ["neutral", "positive", "urgent", "empathetic", "encouraging", "critical"]
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

    setIsLoading(true);
    setError(null);
    try {
      const result = await invoke('refactor_email', { 
        text: inputText,
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
      </div>
    </div>
  );
}

export default App;
