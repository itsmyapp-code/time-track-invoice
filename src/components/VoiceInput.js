import React, { useState, useEffect, useCallback } from 'react';
import { FaMicrophone } from 'react-icons/fa';

/**
 * VoiceInput component that uses the Web Speech API to transcribe voice to text.
 * @param {function} onTranscription - Callback when text is transcribed.
 * @param {string} className - Additional CSS classes.
 */
const VoiceInput = ({ onTranscription, className = "" }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  // Use refs to keep track of values without triggering re-runs of useEffect
  const onTranscriptionRef = React.useRef(onTranscription);
  const silenceTimerRef = React.useRef(null);

  useEffect(() => {
    onTranscriptionRef.current = onTranscription;
  }, [onTranscription]);

  useEffect(() => {
    // browser-native Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-GB';

      recog.onresult = (event) => {
        // Clear silence timer on every result
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          // Use ref to call the latest callback
          onTranscriptionRef.current(finalTranscript.trim());
        }

        // Set silence timer to stop after 2.5 seconds of inactivity
        silenceTimerRef.current = setTimeout(() => {
          recog.stop();
        }, 2500);
      };

      recog.onstart = () => {
        setIsListening(true);
      };

      recog.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recog.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.error("Speech recognition error:", event.error);
        }
        setIsListening(false);
      };

      setRecognition(recog);

      return () => {
        recog.stop();
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };
    }
  }, []); // Only run once on mount

  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognition) recognition.stop();
    } else {
      if (recognition) {
        try {
          recognition.start();
        } catch (e) {
          console.warn("Recognition already started or error:", e);
        }
      } else {
        alert("Speech Recognition is not supported in this browser.");
      }
    }
  }, [isListening, recognition]);

  if (!recognition) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
        isListening 
          ? 'bg-red-500 text-white animate-pulse scale-110 shadow-lg' 
          : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
      } ${className}`}
      title={isListening ? "Listening (stop after 2.5s of silence)..." : "Start Voice Input"}
    >
      <FaMicrophone size={18} />
    </button>
  );
};

export default VoiceInput;
