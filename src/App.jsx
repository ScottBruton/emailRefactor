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
          conciseness: 'balanced',
          structure: 'paragraph',
          formatting: 'none',
          emailLength: 'medium (100–200 words)',
          clarity: 'direct',
          purpose: 'inform',
          formality: 'semiformal',
          greeting: 'dear',
          signoff: 'best regards',
          includeDetails: 'basic',
          dynamicContent: 'standard',
          emotion: 'neutral',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          ageAppropriate: 'adult',
          culturalSensitivity: 'universal',
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
          tone: 'direct',
          languageComplexity: 'simple',
          grammarSpelling: 'standard',
          conciseness: 'ultra brief',
          structure: 'paragraph',
          formatting: 'none',
          emailLength: 'ultra short (under 50 words)',
          clarity: 'direct',
          purpose: 'inform',
          formality: 'casual',
          greeting: 'hi',
          signoff: 'best',
          includeDetails: 'minimal',
          dynamicContent: 'template only',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          urgency: 'time-sensitive',
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
          structure: 'bullet points',
          formatting: 'emphasis on action items',
          emailLength: 'medium (100–200 words)',
          clarity: 'direct',
          purpose: 'request',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'best regards',
          includeDetails: 'detailed',
          dynamicContent: 'personalized',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          industryContext: 'business',
          urgency: 'time-sensitive',
          relationshipType: 'professional-only',
          goal: 'request'
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
          structure: 'bullet points',
          formatting: 'highlighted key points',
          emailLength: 'long (200–400 words)',
          clarity: 'direct',
          purpose: 'promotion',
          formality: 'semiformal',
          greeting: 'dear',
          signoff: 'best regards',
          includeDetails: 'full context',
          dynamicContent: 'highly personalized',
          emotion: 'positive',
          audienceExpertise: 'non-technical',
          hierarchicalContext: 'speaking-to-client',
          industryContext: 'sales',
          urgency: 'time-sensitive',
          relationshipType: 'prospect',
          goal: 'close a sale'
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
          tone: 'professional',
          languageComplexity: 'professional',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'paragraph',
          formatting: 'clear spacing',
          emailLength: 'medium (100–200 words)',
          clarity: 'diplomatic',
          purpose: 'request',
          formality: 'very formal',
          greeting: 'dear',
          signoff: 'regards',
          includeDetails: 'detailed',
          dynamicContent: 'standard',
          audienceExpertise: 'professional',
          hierarchicalContext: 'speaking-to-superior',
          industryContext: 'business',
          urgency: 'time-sensitive',
          relationshipType: 'manager',
          goal: 'request'
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
          languageComplexity: 'conversational',
          grammarSpelling: 'casual',
          conciseness: 'brief',
          structure: 'paragraph',
          formatting: 'none',
          emailLength: 'short (50–100 words)',
          clarity: 'direct',
          purpose: 'inform',
          formality: 'casual',
          greeting: 'hi',
          signoff: 'best',
          includeDetails: 'basic',
          dynamicContent: 'standard',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          relationshipType: 'colleague',
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
          formatting: 'clear spacing',
          emailLength: 'medium (100–200 words)',
          clarity: 'transparent',
          purpose: 'announcement',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'best regards',
          includeDetails: 'full context',
          dynamicContent: 'standard',
          emotion: 'neutral',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          urgency: 'time-sensitive',
          relationshipType: 'colleague',
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
          structure: 'bullet points',
          formatting: 'bold headers',
          emailLength: 'long (200–400 words)',
          clarity: 'direct',
          purpose: 'report',
          formality: 'semiformal',
          greeting: 'hi',
          signoff: 'best',
          includeDetails: 'full context',
          dynamicContent: 'standard',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          industryContext: 'business',
          urgency: 'time-sensitive',
          relationshipType: 'colleague',
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
          grammarSpelling: 'standard',
          conciseness: 'brief',
          structure: 'paragraph',
          formatting: 'none',
          emailLength: 'short (50–100 words)',
          clarity: 'direct',
          purpose: 'follow-up',
          formality: 'semiformal',
          greeting: 'hi',
          signoff: 'best',
          includeDetails: 'minimal',
          dynamicContent: 'standard',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          urgency: 'time-sensitive',
          relationshipType: 'established',
          goal: 'encourage action'
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
          languageComplexity: 'conversational',
          grammarSpelling: 'casual',
          conciseness: 'balanced',
          structure: 'paragraph',
          formatting: 'none',
          emailLength: 'medium (100–200 words)',
          clarity: 'direct',
          purpose: 'inform',
          formality: 'casual',
          greeting: 'hi',
          signoff: 'cheers',
          includeDetails: 'basic',
          dynamicContent: 'personalized',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          relationshipType: 'friend',
          goal: 'build trust'
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
          formatting: 'none',
          emailLength: 'medium (100–200 words)',
          clarity: 'clear but cautious',
          purpose: 'apology',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'sincerely',
          includeDetails: 'detailed',
          dynamicContent: 'personalized',
          emotion: 'concerned',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          urgency: 'high',
          relationshipType: 'established',
          goal: 'resolve an issue'
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
          structure: 'bullet points',
          formatting: 'emphasis on action items',
          emailLength: 'medium (100–200 words)',
          clarity: 'direct',
          purpose: 'request',
          formality: 'semiformal',
          greeting: 'hi',
          signoff: 'best',
          includeDetails: 'detailed',
          dynamicContent: 'personalized',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          industryContext: 'creative',
          urgency: 'time-sensitive',
          relationshipType: 'colleague',
          goal: 'request'
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
          structure: 'headers & sections',
          formatting: 'bold headers',
          emailLength: 'very long (400+ words)',
          clarity: 'direct',
          purpose: 'report',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'best regards',
          includeDetails: 'full context',
          dynamicContent: 'standard',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          industryContext: 'marketing',
          urgency: 'time-sensitive',
          relationshipType: 'colleague',
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
          languageComplexity: 'technical',
          grammarSpelling: 'strict',
          conciseness: 'detailed',
          structure: 'bullet points',
          formatting: 'table format',
          emailLength: 'long (200–400 words)',
          clarity: 'direct',
          purpose: 'report',
          formality: 'formal',
          greeting: 'dear',
          signoff: 'best regards',
          includeDetails: 'full context',
          dynamicContent: 'standard',
          audienceExpertise: 'expert',
          hierarchicalContext: 'speaking-to-equals',
          industryContext: 'marketing',
          urgency: 'time-sensitive',
          relationshipType: 'colleague',
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
          structure: 'bullet points',
          formatting: 'highlighted key points',
          emailLength: 'long (200–400 words)',
          clarity: 'direct',
          purpose: 'proposal',
          formality: 'semiformal',
          greeting: 'dear',
          signoff: 'best regards',
          includeDetails: 'full context',
          dynamicContent: 'personalized',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-client',
          industryContext: 'media',
          urgency: 'time-sensitive',
          relationshipType: 'prospect',
          goal: 'close a sale'
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
          structure: 'bullet points',
          formatting: 'highlighted key points',
          emailLength: 'long (200–400 words)',
          clarity: 'direct',
          purpose: 'proposal',
          formality: 'semiformal',
          greeting: 'dear',
          signoff: 'best regards',
          includeDetails: 'full context',
          dynamicContent: 'personalized',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-client',
          industryContext: 'media',
          urgency: 'time-sensitive',
          relationshipType: 'prospect',
          goal: 'close a sale'
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
          structure: 'bullet points',
          formatting: 'highlighted key points',
          emailLength: 'long (200–400 words)',
          clarity: 'direct',
          purpose: 'proposal',
          formality: 'semiformal',
          greeting: 'dear',
          signoff: 'best regards',
          includeDetails: 'full context',
          dynamicContent: 'personalized',
          emotion: 'positive',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-client',
          industryContext: 'media',
          urgency: 'time-sensitive',
          relationshipType: 'prospect',
          goal: 'close a sale'
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
          structure: 'table format',
          formatting: 'table format',
          emailLength: 'short (50–100 words)',
          clarity: 'direct',
          purpose: 'inform',
          formality: 'semiformal',
          greeting: 'hi',
          signoff: 'best',
          includeDetails: 'basic',
          dynamicContent: 'standard',
          audienceExpertise: 'mixed',
          hierarchicalContext: 'speaking-to-equals',
          industryContext: 'media',
          urgency: 'time-sensitive',
          relationshipType: 'prospect',
          goal: 'inform'
        }
      }
    }
  };
  
  const categories = {
    contentStyle: {
      title: "Content Style & Formatting",
      options: {
        tone: ["formal", "neutral", "informal", "friendly", "enthusiastic", "persuasive", "empathetic", "apologetic", "direct", "playful", "reserved"],
        languageComplexity: ["simple", "conversational", "professional", "technical", "academic"],
        grammarSpelling: ["strict", "standard", "casual", "none"],
        conciseness: ["ultra brief", "brief", "balanced", "detailed", "elaborate"],
        structure: ["paragraph", "bullet points", "numbered list", "hybrid", "Q&A", "headers & sections"],
        formatting: ["none", "bold headers", "highlighted key points", "callouts", "clear spacing", "table format", "emphasis on action items"],
        emailLength: ["ultra short (under 50 words)", "short (50–100 words)", "medium (100–200 words)", "long (200–400 words)", "very long (400+ words)"],
        clarity: ["direct", "neutral", "diplomatic", "nuanced", "transparent", "clear but cautious"]
      }
    },
    purpose: {
      title: "Purpose & Intent",
      options: {
        purpose: ["inquiry", "request", "follow-up", "proposal", "introduction", "report", "reminder", "confirmation", "announcement", "feedback", "escalation", "support", "update", "promotion"]
      }
    },
    formality: {
      title: "Formality & Professionalism",
      options: {
        formality: ["casual", "semiformal", "formal", "very formal", "executive"]
      }
    },
    personalization: {
      title: "Personalization",
      options: {
        greeting: ["hi", "hello", "hey", "dear", "to whom it may concern", "none", "custom"],
        signoff: ["thanks", "regards", "best", "sincerely", "cheers", "warm regards", "none", "custom"],
        includeDetails: ["minimal", "basic", "detailed", "full context", "summary with attachments"],
        dynamicContent: ["template only", "standard", "personalized", "highly personalized"]
      }
    },
    emotion: {
      title: "Emotion & Sentiment",
      options: {
        emotion: ["neutral", "positive", "friendly", "enthusiastic", "motivational", "reassuring", "empathetic", "supportive", "apologetic", "concerned", "critical", "frustrated", "sarcastic", "celebratory", "grateful", "disappointed", "sympathetic", "angry"]
      }
    },
    audience: {
      title: "Audience Adaptation",
      options: {
        audienceExpertise: ["non-technical", "somewhat technical", "technical", "expert"],
        hierarchicalContext: ["speaking-to-superior", "speaking-to-subordinate", "speaking-to-equals", "speaking-to-client", "speaking-to-audience"],
        ageAppropriate: ["teen", "young adult", "adult", "senior", "universal"],
        culturalSensitivity: ["universal", "region-specific", "localized", "inclusive", "neutral"]
      }
    },
    industry: {
      title: "Industry-Specific Language",
      options: {
        industryContext: ["general", "media", "marketing", "advertising", "sales", "tech", "finance", "healthcare", "education", "legal", "government", "nonprofit", "entertainment"]
      }
    },
    timeSensitivity: {
      title: "Time Sensitivity",
      options: {
        urgency: ["no-urgency", "low", "medium", "high", "urgent", "critical", "time-sensitive"]
      }
    },
    relationship: {
      title: "Relationship Context",
      options: {
        relationshipType: ["new contact", "acquaintance", "colleague", "manager", "direct report", "peer", "client", "vendor", "partner", "stakeholder", "friend", "trusted contact", "long-term relationship", "former contact", "prospect", "general audience"]
      }
    },
    communicationGoal: {
      title: "Communication Goal",
      options: {
        goal: ["inform", "request", "persuade", "clarify", "reassure", "inspire", "apologize", "summarize", "negotiate", "encourage action", "build trust", "close a sale", "resolve an issue"]
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
    try {
      console.log('Starting refactoring process...');
      console.log('Input text:', inputText);
      console.log('Enabled categories:', enabledCategories);
      console.log('Selected styles:', styles);

      if (!inputText.trim()) {
        console.log('Error: Empty input text');
        setError('Please enter some text to refactor');
        return;
      }

      if (isResponseEmail && !originalEmail.trim()) {
        console.log('Error: Empty original email for response');
        setError('Cannot generate a response to an empty email. Please paste the original email you are responding to.');
        return;
      }

      const hasEnabledCategory = Object.values(enabledCategories).some(value => value === true);
      if (!hasEnabledCategory) {
        console.log('Error: No categories enabled');
        setError('Please enable at least one refactoring setting category.');
        return;
      }

      console.log('All validation passed, calling refactor_email...');
      
      setError('');
      setIsLoading(true);

      // Ensure all required style fields are present
      const styleConfig = {
        tone: styles.tone || 'neutral',
        languageComplexity: styles.languageComplexity || 'professional',
        grammarSpelling: styles.grammarSpelling || 'standard',
        conciseness: styles.conciseness || 'balanced',
        structure: styles.structure || 'paragraph',
        formatting: styles.formatting || 'none',
        emailLength: styles.emailLength || 'medium (100–200 words)',
        clarity: styles.clarity || 'direct',
        purpose: styles.purpose || 'inform',
        formality: styles.formality || 'semiformal',
        greeting: styles.greeting || 'hi',
        signoff: styles.signoff || 'best',
        includeDetails: styles.includeDetails || 'basic',
        dynamicContent: styles.dynamicContent || 'standard',
        emotion: styles.emotion || 'neutral',
        audienceExpertise: styles.audienceExpertise || 'mixed',
        hierarchicalContext: styles.hierarchicalContext || 'speaking-to-equals',
        ageAppropriate: styles.ageAppropriate || 'adult',
        culturalSensitivity: styles.culturalSensitivity || 'universal',
        industryContext: styles.industryContext || 'general',
        urgency: styles.urgency || 'no-urgency',
        relationshipType: styles.relationshipType || 'established',
        goal: styles.goal || 'inform',
        enabledCategories
      };

      console.log('Sending style config:', styleConfig);

      const result = await invoke('refactor_email', {
        text: inputText,
        isResponse: isResponseEmail,
        originalEmail: originalEmail,
        styles: styleConfig
      });

      console.log('Refactor result:', result);

      if (!result) {
        throw new Error('Received empty result from refactor_email');
      }

      setOutputText(result);
      setIsLoading(false);
    } catch (error) {
      console.error('Refactoring error:', error);
      setError(`Failed to refactor email: ${error.message || 'Please try again.'}`);
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
