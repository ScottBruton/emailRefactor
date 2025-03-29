import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
// Removing file system imports temporarily
// import { appDataDir } from "@tauri-apps/api/path";
// import { readTextFile, writeTextFile, createDir, exists } from "@tauri-apps/api/fs";
import "./App.css";
import darkIcon from '../assets/dark.svg';
import lightIcon from '../assets/light.svg';
import addPresetIcon from '../assets/addPreset.svg';
import deleteIcon from '../assets/delete.svg';

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
  const [isAddPresetModalOpen, setIsAddPresetModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState(null);
  const [customPresets, setCustomPresets] = useState({});
  
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
    custom: {
      label: "Custom",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'paragraph',
          purpose: 'inform',
          formality: 'semiformal',
          greeting: 'dear',
          signoff: 'best regards',
          emotion: 'neutral',
          audienceExpertise: 'mixed',
          industryContext: 'general',
          urgency: 'no-urgency',
          relationshipType: 'established',
          goal: 'inform'
        }
      }
    },
    quickReply: {
      label: "Quick Reply",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: false,
          audience: true,
          industry: false,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'brief',
          structure: 'paragraph',
          purpose: 'inform',
          formality: 'semiformal',
          greeting: 'hi',
          signoff: 'best',
          audienceExpertise: 'mixed',
          urgency: 'time-bound',
          relationshipType: 'established',
          goal: 'inform'
        }
      }
    },
    quoteRequest: {
      label: "Quote Request",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: false,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'bullet-points',
          purpose: 'request',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'best regards',
          audienceExpertise: 'mixed',
          industryContext: 'business',
          urgency: 'time-bound',
          relationshipType: 'professional-only',
          goal: 'request-action'
        }
      }
    },
    salesPitch: {
      label: "Sales Pitch",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'enthusiastic',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'paragraph',
          purpose: 'persuasion',
          formality: 'semiformal',
          greeting: 'dear',
          signoff: 'best regards',
          emotion: 'positive',
          audienceExpertise: 'non-technical',
          industryContext: 'business',
          urgency: 'time-bound',
          relationshipType: 'first-contact',
          goal: 'persuade'
        }
      }
    },
    managementRequest: {
      label: "Management Request",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: false,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'authoritative',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'paragraph',
          purpose: 'request',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'regards',
          audienceExpertise: 'professional',
          hierarchicalContext: 'speaking-to-superiors',
          industryContext: 'business',
          urgency: 'time-bound',
          relationshipType: 'professional-only',
          goal: 'request-action'
        }
      }
    },
    teammate: {
      label: "Teammate",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: true,
          industry: false,
          timeSensitivity: false,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'friendly',
          languageComplexity: 'professional',
          grammarSpelling: 'relaxed',
          conciseness: 'brief',
          structure: 'paragraph',
          purpose: 'inform',
          formality: 'casual',
          greeting: 'hi',
          signoff: 'best',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          relationshipType: 'established',
          goal: 'inform'
        }
      }
    },
    hrCommunication: {
      label: "HR Communication",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: true,
          industry: false,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'paragraph',
          purpose: 'inform',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'best regards',
          emotion: 'neutral',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          urgency: 'time-bound',
          relationshipType: 'professional-only',
          goal: 'inform'
        }
      }
    },
    progressReport: {
      label: "Progress Report",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: false,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'bullet-points',
          purpose: 'inform',
          formality: 'semiformal',
          greeting: 'hi',
          signoff: 'best',
          audienceExpertise: 'mixed',
          industryContext: 'business',
          urgency: 'time-bound',
          relationshipType: 'established',
          goal: 'inform'
        }
      }
    },
    followUp: {
      label: "Follow-Up",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: true,
          industry: false,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'brief',
          structure: 'paragraph',
          purpose: 'follow-up',
          formality: 'semiformal',
          greeting: 'hi',
          signoff: 'best',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          urgency: 'time-bound',
          relationshipType: 'established',
          goal: 'request-action'
        }
      }
    },
    friendly: {
      label: "Friendly",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: true,
          industry: false,
          timeSensitivity: false,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'friendly',
          languageComplexity: 'casual',
          grammarSpelling: 'relaxed',
          conciseness: 'brief',
          structure: 'paragraph',
          purpose: 'inform',
          formality: 'casual',
          greeting: 'hi',
          signoff: 'best',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          relationshipType: 'established',
          goal: 'build-relationship'
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
          audience: true,
          industry: false,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'apologetic',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'paragraph',
          purpose: 'apology',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'sincerely',
          emotion: 'concerned',
          audienceExpertise: 'mixed',
          urgency: 'immediate-action',
          relationshipType: 'established',
          goal: 'build-relationship'
        }
      }
    },
    reviewRequest: {
      label: "Review Request",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'bullet-points',
          purpose: 'request',
          formality: 'semiformal',
          greeting: 'hi',
          signoff: 'best',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          industryContext: 'creative',
          urgency: 'time-bound',
          relationshipType: 'established',
          goal: 'request-action'
        }
      }
    },
    campaignBrief: {
      label: "Campaign Brief",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: false,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'bullet-points',
          purpose: 'inform',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'best regards',
          audienceExpertise: 'mixed',
          industryContext: 'marketing',
          urgency: 'time-bound',
          relationshipType: 'established',
          goal: 'inform'
        }
      }
    },
    targetAudienceStrategy: {
      label: "Target Audience Strategy",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: false,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'bullet-points',
          purpose: 'inform',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'best regards',
          audienceExpertise: 'professional',
          industryContext: 'marketing',
          urgency: 'time-bound',
          relationshipType: 'established',
          goal: 'inform'
        }
      }
    },
    digitalAudioProposal: {
      label: "Digital Audio Proposal",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'enthusiastic',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'bullet-points',
          purpose: 'persuasion',
          formality: 'semiformal',
          greeting: 'dear',
          signoff: 'best regards',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          industryContext: 'marketing',
          urgency: 'time-bound',
          relationshipType: 'professional-only',
          goal: 'persuade'
        }
      }
    },
    podcastSponsorshipPitch: {
      label: "Podcast Sponsorship Pitch",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'enthusiastic',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'bullet-points',
          purpose: 'persuasion',
          formality: 'semiformal',
          greeting: 'dear',
          signoff: 'best regards',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          industryContext: 'marketing',
          urgency: 'time-bound',
          relationshipType: 'professional-only',
          goal: 'persuade'
        }
      }
    },
    streamingMediaPackage: {
      label: "Streaming Media Package",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: true,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'enthusiastic',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'bullet-points',
          purpose: 'persuasion',
          formality: 'semiformal',
          greeting: 'dear',
          signoff: 'best regards',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          industryContext: 'marketing',
          urgency: 'time-bound',
          relationshipType: 'professional-only',
          goal: 'persuade'
        }
      }
    },
    availabilityRateCard: {
      label: "Availability & Rate Card",
      settings: {
        enabledCategories: {
          contentStyle: true,
          purpose: true,
          formality: true,
          personalization: true,
          emotion: false,
          audience: true,
          industry: true,
          timeSensitivity: true,
          relationship: true,
          communicationGoal: true
        },
        styles: {
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'brief',
          structure: 'bullet-points',
          purpose: 'inform',
          formality: 'semiformal',
          greeting: 'hi',
          signoff: 'best',
          audienceExpertise: 'mixed',
          industryContext: 'marketing',
          urgency: 'time-bound',
          relationshipType: 'professional-only',
          goal: 'inform'
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
    // Load saved settings and custom presets when the app starts
    loadSettings();
    loadCustomPresets();
    
    // Load the last used theme preference
    const savedTheme = localStorage.getItem('isDarkMode');
    if (savedTheme !== null) {
      setIsDarkMode(JSON.parse(savedTheme));
    }
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
      const selectedPresetData = presets[selectedValue] || customPresets[selectedValue];
      if (selectedPresetData?.settings) {
        // Apply preset settings
        if (selectedPresetData.settings.enabledCategories) {
          setEnabledCategories(selectedPresetData.settings.enabledCategories);
        }
        
        if (selectedPresetData.settings.styles) {
          setStyles(selectedPresetData.settings.styles);
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
        isResponseEmail,
        selectedPreset  // Save the currently selected preset
      };
      
      // Save settings to localStorage
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

      if (settingsData.selectedPreset !== undefined) {
        setSelectedPreset(settingsData.selectedPreset);
      }
      
      // Store the loaded settings for revert functionality
      setLastSavedSettings(settingsData);
      
      console.log('Settings loaded successfully.');
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings.');
    }
  };

  const loadCustomPresets = () => {
    try {
      const savedPresets = localStorage.getItem('customPresets');
      if (savedPresets) {
        setCustomPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error('Error loading custom presets:', error);
      setError('Failed to load custom presets.');
    }
  };

  const handleAddPreset = () => {
    if (newPresetName.trim()) {
      const presetKey = newPresetName.toLowerCase().replace(/\s+/g, '');
      const newPreset = {
        label: newPresetName.trim(),
        settings: {
          enabledCategories: {...enabledCategories},
          styles: {...styles}
        }
      };
      
      // Update state with new preset
      const updatedPresets = {
        ...customPresets,
        [presetKey]: newPreset
      };
      
      // Save to state and localStorage
      setCustomPresets(updatedPresets);
      localStorage.setItem('customPresets', JSON.stringify(updatedPresets));
      
      // Reset and close modal
      setNewPresetName('');
      setIsAddPresetModalOpen(false);
    }
  };

  const handleDeletePreset = (presetKey, e) => {
    e.stopPropagation();
    setPresetToDelete(presetKey);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePreset = () => {
    if (presetToDelete) {
      const updatedCustomPresets = { ...customPresets };
      delete updatedCustomPresets[presetToDelete];
      
      // Update state and localStorage
      setCustomPresets(updatedCustomPresets);
      localStorage.setItem('customPresets', JSON.stringify(updatedCustomPresets));
      
      if (selectedPreset === presetToDelete) {
        setSelectedPreset('none');
      }
    }
    setIsDeleteModalOpen(false);
    setPresetToDelete(null);
  };

  const renderStyleControls = () => {
    return (
      <div className={`sidebar-container ${sidebarHidden ? 'hidden' : ''}`}>
        <div className="style-controls">
          <div className="sidebar-header">
            <div className="settings-controls">
              <div className="preset-controls">
                <div className="preset-header">
                  <button 
                    className="add-preset-button"
                    onClick={() => setIsAddPresetModalOpen(true)}
                    title="Add new preset"
                  >
                    <img src={addPresetIcon} alt="Add preset" />
                  </button>
                  <span className="preset-label">Presets</span>
                </div>
                <div className="preset-selection">
                  <select 
                    className="preset-dropdown"
                    value={selectedPreset}
                    onChange={handlePresetChange}
                    title="Select a preset for different email types"
                  >
                    {Object.entries(presets).map(([key, preset]) => (
                      <option key={key} value={key}>{preset.label}</option>
                    ))}
                    {Object.entries(customPresets).map(([key, preset]) => (
                      <option key={key} value={key} className="custom-preset-option">
                        {preset.label}
                      </option>
                    ))}
                  </select>
                  {selectedPreset !== 'none' && customPresets[selectedPreset] && (
                    <button
                      className="delete-preset-button"
                      onClick={(e) => handleDeletePreset(selectedPreset, e)}
                      title="Delete preset"
                    >
                      <img src={deleteIcon} alt="Delete" />
                    </button>
                  )}
                </div>
              </div>
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

  // Add effect to save theme preference
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

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

      {/* Add Preset Modal */}
      {isAddPresetModalOpen && (
        <div className="modal-overlay visible" onClick={() => setIsAddPresetModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Preset</div>
              <button className="modal-close" onClick={() => setIsAddPresetModalOpen(false)}>&times;</button>
            </div>
            <input
              type="text"
              className="preset-name-input"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Enter preset name..."
            />
            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={() => setIsAddPresetModalOpen(false)}>Cancel</button>
              <button className="modal-button ok" onClick={handleAddPreset}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay visible" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Delete Preset</div>
              <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
            </div>
            <p className="modal-message">Are you sure you want to delete this preset?</p>
            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="modal-button delete" onClick={confirmDeletePreset}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
