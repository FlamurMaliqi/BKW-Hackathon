/**
 * Custom hook for speech-to-text functionality
 * 
 * This hook provides speech recognition capabilities using the Web Speech API.
 * It handles microphone access, speech recognition, and provides real-time
 * transcription of spoken words.
 * 
 * Features:
 * - Start/stop speech recognition
 * - Real-time transcription
 * - Error handling
 * - Language support
 * - Continuous listening mode
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const useSpeechToText = (options = {}) => {
  const {
    continuous = true,
    interimResults = true,
    lang = 'en-US',
    onResult = () => {},
    onError = () => {}
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Check if speech recognition is supported
  const checkSupport = useCallback(() => {
    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext || 
                           window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1';
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    
    console.log('Speech Recognition Support Check:', {
      hasSpeechRecognition: !!SpeechRecognition,
      isSecureContext,
      supported,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      userAgent: navigator.userAgent
    });
    
    setIsSupported(supported);
    return supported;
  }, []);

  // Check support on mount
  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!checkSupport()) {
      const isSecureContext = window.isSecureContext || 
                             window.location.protocol === 'https:' || 
                             window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1';
      
      if (!isSecureContext) {
        setError('Speech recognition requires HTTPS or localhost. Please use https:// or localhost to access this feature.');
      } else {
        setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      }
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current += final;
        setTranscript(finalTranscriptRef.current);
        onResult(finalTranscriptRef.current, final);
      }

      if (interim) {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
      onError(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [continuous, interimResults, lang, onResult, onError, checkSupport]);

  // Start listening
  const startListening = useCallback(() => {
    if (isListening) return;

    const recognition = initializeRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        setError('Failed to start speech recognition: ' + err.message);
      }
    }
  }, [isListening, initializeRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    clearError
  };
};

export default useSpeechToText;
