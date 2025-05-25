import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic } from 'lucide-react';

// Types
type ScreenType = 'recording' | 'processing' | 'results';
type ProcessingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface ArchetypeResponse {
  synthesizer: string;
  connector: string;
  challenger: string;
  explorer: string;
  implementer: string;
  integrator: string;
}

interface ArchetypeInfo {
  icon: string;
  title: string;
  description: string;
  color: string;
}

// Constants
const ARCHETYPES: Record<string, ArchetypeInfo> = {
  synthesizer: {
    icon: '🔄',
    title: 'The Synthesizer',
    description: 'Organizes scattered thoughts into clear patterns and frameworks',
    color: '#3F51B5'
  },
  connector: {
    icon: '🔗',
    title: 'The Connector',
    description: 'Reveals relationships between new thoughts and existing knowledge',
    color: '#673AB7'
  },
  challenger: {
    icon: '❓',
    title: 'The Challenger',
    description: 'Questions assumptions and offers alternative perspectives',
    color: '#9C27B0'
  },
  explorer: {
    icon: '🚀',
    title: 'The Explorer',
    description: 'Discovers creative possibilities beyond conventional thinking',
    color: '#2196F3'
  },
  implementer: {
    icon: '⚙️',
    title: 'The Implementer',
    description: 'Translates concepts into practical action steps',
    color: '#4CAF50'
  },
  integrator: {
    icon: '🌐',
    title: 'The Integrator',
    description: 'Synthesizes insights from all perspectives into comprehensive wisdom',
    color: '#FF4081'
  }
};

const PROCESSING_STEPS = [
  'Initializing...',
  'Transcription Complete',
  'Synthesizer Analysis',
  'Connector Analysis',
  'Challenger Analysis',
  'Explorer Analysis',
  'Implementer Analysis',
  'Integration'
];

// Ahura Master Prompt Integration
const AHURA_MASTER_PROMPT = `You are the Ahura Archetypal Analysis System, facilitating a live conversation between six distinct archetypal perspectives. Create an engaging dialogue where each archetype contributes their unique analytical lens to understand the user's voice note transcript.

## Archetypal Voices

### 🧠 **Synthesizer** (Indigo voice)
- **Personality**: Thoughtful pattern-recognizer, seeks underlying structures
- **Speech pattern**: "I'm noticing..." "The core theme here..." "What connects these ideas..."
- **Focus**: Organizing scattered thoughts, identifying frameworks, finding coherence

### ⚔️ **Challenger** (Red voice) 
- **Personality**: Provocative questioner, challenges assumptions with wit
- **Speech pattern**: "But wait..." "What if that's wrong?" "Let's flip this..."
- **Focus**: Questioning unstated assumptions, offering contrarian views, psychological probing

### 🧭 **Explorer** (Blue voice)
- **Personality**: Curious futurist, seeks creative possibilities
- **Speech pattern**: "What if we tried..." "Imagine if..." "This could lead to..."
- **Focus**: Novel alternatives, emergent scenarios, paradigm shifts

### 🔗 **Connector** (Purple voice)
- **Personality**: Cross-disciplinary bridge-builder, finds unexpected links
- **Speech pattern**: "This reminds me of..." "In [other field]..." "There's a parallel..."
- **Focus**: Relating to other domains, interdisciplinary insights, broader context

### 🛠️ **Implementer** (Yellow voice)
- **Personality**: Practical action-oriented, focuses on making things happen
- **Speech pattern**: "So what do we actually do?" "The next step is..." "Here's how we could..."
- **Focus**: Concrete actions, resource requirements, implementation pathways

### 🧩 **Integrator** (Green voice)
- **Personality**: Wise synthesizer, weaves meaning from diverse perspectives
- **Speech pattern**: "What I'm hearing across all this..." "The deeper meaning..." "If we step back..."
- **Focus**: Holistic meaning-making, cultural context, human values

Analyze this voice note transcript and return JSON with: synthesizer, connector, challenger, explorer, implementer, integrator fields.`;

// Speech Recognition Utilities
const isSpeechRecognitionSupported = (): boolean => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

const createSpeechRecognition = (): any => {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  return recognition;
};

const getSpeechRecognitionErrorMessage = (error: string): string => {
  switch (error) {
    case 'not-allowed':
      return 'Microphone access denied. Please enable microphone permissions.';
    case 'no-speech':
      return 'No speech was detected. Please try again.';
    case 'audio-capture':
      return 'No microphone was found. Ensure that a microphone is installed.';
    case 'network':
      return 'Network error occurred. Please check your connection.';
    case 'aborted':
      return 'Speech recognition was aborted.';
    default:
      return `Speech recognition error: ${error}`;
  }
};

// Mock OpenAI API Integration with Ahura Prompt
const generateArchetypeAnalysis = async (transcript: string): Promise<ArchetypeResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Using your Ahura conversational system for realistic responses
  return {
    synthesizer: `🧠 I'm noticing three core themes woven through your thoughts: personal development, systemic thinking, and the relationship between individual growth and collective impact. What connects these ideas is your underlying search for coherence between inner work and outer expression. The pattern suggests you're integrating multiple levels of understanding - personal, interpersonal, and systemic.`,
    
    connector: `🔗 This reminds me of developmental psychology's concept of "vertical development" - how consciousness itself evolves through stages. There's a parallel to systems theory here, where individual transformation ripples outward to influence larger systems. In complexity science, this is called "emergence" - how higher-order patterns arise from the interaction of simpler elements.`,
    
    challenger: `❓ But wait - are we assuming that more complexity equals better thinking? What if the real insight is about simplification rather than integration? Let's flip this: What if your search for systemic understanding is actually avoiding something more fundamental? Challenge the premise that you need to figure it all out before taking action.`,
    
    explorer: `🚀 What if we tried thinking of this as designing a new operating system for human potential? Imagine if we could create learning environments that naturally cultivate both individual wisdom and collective intelligence. This could lead to entirely new forms of education, work, and community that we haven't even conceived yet.`,
    
    implementer: `⚙️ So what do we actually do with these insights? Here's how we could start: Week 1 - Map your current learning sources and identify gaps. Week 2 - Design one small experiment in collaborative learning. Week 3 - Document what emerges and iterate. Week 4 - Share your findings with others to test the systemic impact hypothesis.`,
    
    integrator: `🧩 What I'm hearing across all perspectives is a deep recognition that personal and collective transformation are intimately connected. The deeper meaning points to your role as a bridge-builder between different ways of knowing. If we step back, this isn't just about your own development - it's about pioneering new forms of human flourishing that honor both individual authenticity and our interconnectedness.`
  };
};

// Components
const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-[#3F51B5] to-[#7986CB] p-4 text-white shadow-md">
      <div className="container mx-auto flex items-center">
        <div className="flex items-center">
          <Mic size={24} className="mr-2" />
          <h1 className="text-xl font-bold">VoiceBro</h1>
        </div>
        <p className="ml-4 text-sm opacity-90">Transform your thoughts into insights</p>
      </div>
    </header>
  );
};

const ArchetypeCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  content: string;
  color: string;
}> = ({ icon, title, description, content, color }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-3 transition-all duration-300"
      style={{ maxHeight: isExpanded ? '500px' : '80px' }}
    >
      <div 
        className="flex items-center p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <span className="text-2xl mr-3" aria-hidden="true">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className="text-gray-400 transition-transform duration-300" style={{ 
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' 
        }}>
          ▼
        </span>
      </div>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {content}
          </p>
        </div>
      )}
    </div>
  );
};

const RecordingScreen: React.FC<{
  onTranscriptReady: (transcript: string) => void;
  setError: (error: string | null) => void;
}> = ({ onTranscriptReady, setError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    recognitionRef.current = createSpeechRecognition();
    
    if (!recognitionRef.current) {
      setError('Voice recording not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    recognitionRef.current.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      setError(getSpeechRecognitionErrorMessage(event.error));
      stopRecording();
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Recognition restart failed:', error);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [setError, isRecording]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setTranscript('');
    setRecordingTime(0);
    setError(null);
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    
    if (transcript.trim()) {
      onTranscriptReady(transcript.trim());
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full">
      <div 
        className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer mb-4 transition-all duration-300 
          ${isRecording 
            ? 'bg-red-500 animate-pulse shadow-lg' 
            : 'bg-[#3F51B5] hover:bg-[#303F9F] shadow-md'
          }`}
        onClick={toggleRecording}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        <Mic size={48} color="white" />
      </div>
      
      <p className="text-gray-600 mb-6">
        {isRecording ? 'Tap to stop' : 'Tap to speak'}
      </p>
      
      {isRecording && (
        <div className="text-center mb-4">
          <p className="text-red-500 font-semibold mb-2">Recording: {formatTime(recordingTime)}</p>
        </div>
      )}
      
      {transcript && (
        <div className="w-full mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Transcript:</h3>
          <p className="text-gray-800">{transcript}</p>
        </div>
      )}
    </div>
  );
};

const ProcessingScreen: React.FC<{
  processingStep: number;
  setProcessingStep: (step: ProcessingStep) => void;
}> = ({ processingStep, setProcessingStep }) => {
  useEffect(() => {
    const simulateProcessing = async () => {
      for (let i = processingStep + 1; i <= 7; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProcessingStep(i as ProcessingStep);
      }
    };

    if (processingStep < 7) {
      simulateProcessing();
    }
  }, [processingStep, setProcessingStep]);

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="flex items-center justify-center mb-6">
        <span className="text-4xl">🧠</span>
        <div className="ml-2 w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4 text-[#3F51B5]">
        Processing your thought...
      </h2>
      
      <p className="text-sm text-gray-500 mb-6">Estimated time: ~30 seconds</p>
      
      <div className="w-full max-w-sm">
        {PROCESSING_STEPS.map((step, index) => (
          <div 
            key={index} 
            className="flex items-center mb-3 transition-all duration-300"
          >
            <div 
              className={`w-6 h-6 flex items-center justify-center rounded-full mr-3
                ${index === 0 
                  ? 'bg-gray-200 text-gray-500' 
                  : index <= processingStep 
                    ? 'bg-green-500 text-white' 
                    : index === processingStep + 1 
                      ? 'bg-blue-500 text-white animate-pulse' 
                      : 'bg-gray-200 text-gray-500'
                }`}
            >
              {index <= processingStep 
                ? '✓' 
                : index === processingStep + 1 
                  ? '🔄' 
                  : '⏳'}
            </div>
            <span 
              className={`text-sm ${
                index <= processingStep 
                  ? 'text-green-700 font-medium' 
                  : index === processingStep + 1 
                    ? 'text-blue-700 font-medium' 
                    : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultsScreen: React.FC<{
  transcript: string;
  archetypeResponses: ArchetypeResponse;
  onReset: () => void;
}> = ({ transcript, archetypeResponses, onReset }) => {
  const handleSaveInsight = () => {
    try {
      const insight = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        transcript,
        archetypeResponses,
        title: `Insight ${new Date().toLocaleDateString()}`
      };
      
      const existingInsights = localStorage.getItem('voicebro_insights');
      const insights = existingInsights ? JSON.parse(existingInsights) : [];
      
      insights.unshift(insight);
      const trimmedInsights = insights.slice(0, 50);
      
      localStorage.setItem('voicebro_insights', JSON.stringify(trimmedInsights));
      alert('Insight saved successfully!');
    } catch (error) {
      console.error('Failed to save insight:', error);
      alert('Failed to save insight. Please try again.');
    }
  };

  return (
    <div className="flex flex-col p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-start">
          <div className="bg-gray-100 p-2 rounded-full mr-3">
            <Mic size={16} className="text-[#3F51B5]" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Your Voice Note</h3>
            <p className="text-sm text-gray-600">{transcript}</p>
          </div>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold mb-3 text-[#3F51B5]">Archetype Analysis</h2>
      
      <div className="space-y-2 mb-6">
        {Object.keys(ARCHETYPES).map(key => (
          <ArchetypeCard 
            key={key}
            icon={ARCHETYPES[key].icon}
            title={ARCHETYPES[key].title}
            description={ARCHETYPES[key].description}
            content={archetypeResponses[key as keyof ArchetypeResponse]}
            color={ARCHETYPES[key].color}
          />
        ))}
      </div>
      
      <div className="flex space-x-3 mt-4">
        <button
          className="flex-1 py-2 bg-[#3F51B5] text-white rounded-lg shadow-sm hover:bg-[#303F9F] transition-colors duration-300"
          onClick={handleSaveInsight}
        >
          Save Insight
        </button>
        <button
          className="flex-1 py-2 bg-[#FF4081] text-white rounded-lg shadow-sm hover:bg-[#F50057] transition-colors duration-300"
          onClick={onReset}
        >
          New Recording
        </button>
      </div>
    </div>
  );
};

// Main App Component
const VoiceBroApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('recording');
  const [transcript, setTranscript] = useState('');
  const [processingStep, setProcessingStep] = useState<ProcessingStep>(0);
  const [archetypeResponses, setArchetypeResponses] = useState<ArchetypeResponse>({} as ArchetypeResponse);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranscriptReady = useCallback(async (newTranscript: string) => {
    if (!newTranscript.trim()) {
      setError('No speech detected. Please try recording again.');
      return;
    }

    setTranscript(newTranscript);
    setCurrentScreen('processing');
    setProcessingStep(1);
    setIsProcessing(true);
    setError(null);
    
    try {
      const analysis = await generateArchetypeAnalysis(newTranscript);
      setArchetypeResponses(analysis);
      setIsProcessing(false);
    } catch (err) {
      console.error('Analysis failed:', err);
      setIsProcessing(false);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Analysis failed. Please check your connection and try again.';
      
      setError(errorMessage);
      setCurrentScreen('recording');
      setProcessingStep(0);
    }
  }, []);

  useEffect(() => {
    if (processingStep >= 7 && !isProcessing && Object.keys(archetypeResponses).length > 0) {
      setTimeout(() => {
        setCurrentScreen('results');
      }, 1000);
    }
  }, [processingStep, isProcessing, archetypeResponses]);

  const resetApp = useCallback(() => {
    setCurrentScreen('recording');
    setTranscript('');
    setProcessingStep(0);
    setArchetypeResponses({} as ArchetypeResponse);
    setError(null);
    setIsProcessing(false);
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />
      <main className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-[320px] h-[600px] overflow-hidden relative">
            {error && (
              <div className="absolute top-0 left-0 right-0 bg-red-100 border-b border-red-300 text-red-700 p-3 z-10" role="alert">
                <div className="flex justify-between items-start">
                  <p className="text-sm pr-2">{error}</p>
                  <button 
                    className="text-red-500 hover:text-red-700 text-lg leading-none"
                    onClick={dismissError}
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            
            <div className={`transition-all duration-300 ease-in-out h-full ${error ? 'pt-16' : ''}`}>
              {currentScreen === 'recording' && (
                <RecordingScreen 
                  onTranscriptReady={handleTranscriptReady} 
                  setError={setError}
                />
              )}
              
              {currentScreen === 'processing' && (
                <ProcessingScreen 
                  processingStep={processingStep}
                  setProcessingStep={setProcessingStep}
                />
              )}
              
              {currentScreen === 'results' && (
                <ResultsScreen 
                  transcript={transcript}
                  archetypeResponses={archetypeResponses}
                  onReset={resetApp}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoiceBroApp;