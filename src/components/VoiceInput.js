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
  const [silenceTimer, setSilenceTimer] = useState(null);

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
        if (silenceTimer) clearTimeout(silenceTimer);

        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onTranscription(finalTranscript);
        }

        // Set silence timer to stop after 2 seconds of inactivity
        const timer = setTimeout(() => {
          recog.stop();
        }, 2000);
        setSilenceTimer(timer);
      };

      recog.onstart = () => setIsListening(true);
      recog.onend = () => {
        setIsListening(false);
        if (silenceTimer) clearTimeout(silenceTimer);
      };
      recog.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [onTranscription, silenceTimer]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognition.stop();
    } else {
      if (recognition) {
        recognition.start();
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
      title={isListening ? "Listening (stop after 2s of silence)..." : "Start Voice Input"}
    >
      <FaMicrophone size={18} />
    </button>
  );
};

export default VoiceInput;
