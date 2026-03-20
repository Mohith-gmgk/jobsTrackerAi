// useVoiceInput.js - Browser Web Speech API (no API key needed, completely free)
import { useState, useCallback, useRef } from "react";

export function useVoiceInput({ onResult, onError }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      onError?.("Voice input not supported in this browser. Try Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎙️ Voice input:", transcript);
      onResult?.(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Voice error:", event.error);
      onError?.(event.error === "not-allowed" ? "Microphone permission denied." : "Voice input failed.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [onResult, onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, startListening, stopListening };
}
