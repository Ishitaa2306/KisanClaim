import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const SmartVoiceInput = ({ onResult, onStart, onEnd }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState('en-IN');
  const [errorStatus, setErrorStatus] = useState(null);
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        setIsListening(true);
        if (onStart) onStart();
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'no-speech') {
          setErrorStatus(`Microphone error: ${event.error}`);
        }
        stopListening();
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (onEnd) onEnd();
        releaseMediaStream(); // Clean up audio track
      };
      
      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        handleProcessing(transcript);
      };
      
      recognitionRef.current = recognition;
    } else {
      setErrorStatus("Speech Recognition API not supported in this browser.");
    }
    
    return () => {
      stopListening();
      releaseMediaStream();
    };
  }, []);

  // Update language dynamically based on select
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const releaseMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current) return;
    setErrorStatus(null);
    
    try {
      // Step 1: Force rigorous noise suppression via getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: { ideal: true },
          echoCancellation: { ideal: true },
          autoGainControl: { ideal: true },
          // Avoid getting ambient background noise in hackathons
          channelCount: 1, 
          sampleRate: { ideal: 48000 }
        }
      });
      mediaStreamRef.current = stream;
      
      // Step 2: Start recognition engine
      recognitionRef.current.start();
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      setErrorStatus("Please allow microphone access with noise cancellation.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleProcessing = async (text) => {
    setIsProcessing(true);
    let englishText = text;

    // Translation (Free API) if not already pure english
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json && json[0] && json[0][0] && json[0][0][0]) {
        englishText = json[0].map(item => item[0]).join('');
      }
    } catch (e) {
      console.warn("Translation fallback failed", e);
      // fallback to original text if translation completely fails
    }

    const lowerText = englishText.toLowerCase();

    // Smart Agricultural Processing (Rule-Based NLP)
    let crop = 'Unknown';
    let problem = '';
    const solutions = [];

    // Crop Detection
    if (lowerText.includes('rice') || lowerText.includes('paddy')) crop = 'Rice';
    else if (lowerText.includes('wheat')) crop = 'Wheat';
    else if (lowerText.includes('maize') || lowerText.includes('corn')) crop = 'Maize';
    else if (lowerText.includes('cotton')) crop = 'Cotton';
    else if (lowerText.includes('sugarcane')) crop = 'Sugarcane';

    // Issue Detection & Solutions Mapping
    let issueDetected = false;

    // Yield / Growth
    if (lowerText.includes('yield') || lowerText.includes('slow growth') || lowerText.includes('not growing') || lowerText.includes('stunted')) {
      problem = 'Growth/Yield Issue';
      solutions.push('Determine fertilizer improvement options.');
      solutions.push('Add missing soil nutrients depending on test.');
      solutions.push('Optimize irrigation timings.');
      issueDetected = true;
    }
    
    // Calamity Detection
    if (lowerText.includes('flood') || lowerText.includes('heavy rain') || lowerText.includes('water logging')) {
      problem = problem ? problem + ', Flooding' : 'Flooding/Water Logging';
      solutions.push('Improve drainage immediately.');
      solutions.push('Begin soil recovery and dry-out procedures.');
      solutions.push('Prepare for potential replanting if crop is dead.');
      issueDetected = true;
    } else if (lowerText.includes('drought') || lowerText.includes('dry') || lowerText.includes('no water')) {
      problem = problem ? problem + ', Drought' : 'Drought';
      solutions.push('Deploy emergency irrigation.');
      solutions.push('Utilize moisture retention techniques (mulching).');
      issueDetected = true;
    }

    // Pest / Disease Detection
    if (lowerText.includes('pest') || lowerText.includes('insect') || lowerText.includes('worm')) {
      problem = problem ? problem + ', Pest Attack' : 'Pest Attack';
      solutions.push('Identify specific pest and apply appropriate pesticide.');
      issueDetected = true;
    }
    if (lowerText.includes('fungus') || lowerText.includes('disease') || lowerText.includes('mold') || lowerText.includes('rot')) {
      problem = problem ? problem + ', Fungal Disease' : 'Fungal Disease';
      solutions.push('Apply fungicide matching the specific mold type.');
      issueDetected = true;
    }
    if (lowerText.includes('yellow')) {
      problem = problem ? problem + ', Nutrient Deficiency' : 'Nutrient Deficiency (Yellowing)';
      solutions.push('Address nitrogen deficiency immediately with urea/fertilizer.');
      issueDetected = true;
    }

    // General Health
    if (!issueDetected && (lowerText.includes('weak') || lowerText.includes('damage') || lowerText.includes('unhealthy'))) {
      problem = 'General Weakness / Damage';
      solutions.push('Conduct a fast comprehensive soil testing.');
      solutions.push('Optimize generalized fertilizer and irrigation schedules.');
    }

    const analyzedData = problem ? {
      crop,
      problem,
      solution: solutions.length > 0 ? solutions : ['Monitor crop condition closely.']
    } : null;

    if (onResult) {
      onResult(englishText, analyzedData);
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col gap-2 w-full mt-2 mb-4 bg-green-50/50 p-3 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between z-10 relative">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          Voice Advisory Input
          {isProcessing && <Loader2 className="w-3 h-3 animate-spin text-green-600" />}
        </label>
        
        {/* Language Selector */}
        <select 
          className="text-[10px] uppercase font-bold text-green-700 bg-green-100 border-none rounded outline-none py-1 px-2 cursor-pointer appearance-none"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isListening || isProcessing}
        >
          <option value="en-IN">English (IN)</option>
          <option value="hi-IN">Hindi (HI)</option>
          <option value="kn-IN">Kannada (KN)</option>
          <option value="te-IN">Telugu (TE)</option>
          <option value="ta-IN">Tamil (TA)</option>
        </select>
      </div>

      <div className="flex items-center gap-3 z-10 relative">
        {/* Push to talk button */}
        <button
          type="button"
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          disabled={isProcessing}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all flex-shrink-0 ${
            isListening 
              ? 'bg-red-500 scale-110 shadow-red-200 animate-pulse' 
              : 'bg-green-600 active:scale-95'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <Mic className="text-white w-5 h-5" />
          ) : (
             <MicOff className="text-white w-5 h-5" />
          )}
        </button>

        <div className="flex-1">
          <p className="text-xs font-bold text-gray-800">
            {isProcessing ? "Processing & Translating..." : isListening ? "Listening... (Release to stop)" : "Hold mic and speak clearly"}
          </p>
          <p className="text-[10px] text-gray-500 leading-tight">
            {errorStatus ? <span className="text-red-500">{errorStatus}</span> : "Auto-translates and identifies crop issues."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartVoiceInput;
