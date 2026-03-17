"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transitText, setTransitText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState("참석자 A");
  
  const recognitionRef = useRef<any>(null);
  const speakerRef = useRef(currentSpeaker);

  // Keep speakerRef in sync to use inside the event listener without recreating the listener
  useEffect(() => {
    speakerRef.current = currentSpeaker;
  }, [currentSpeaker]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "ko-KR";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript.trim();
              if (text) {
                 // Append Timestamp and Speaker
                 const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute:'2-digit', second: '2-digit' });
                 finalTranscript += `[${time}] ${speakerRef.current}: ${text}\n`;
              }
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setFinalText((prev) => prev + finalTranscript);
          }
          setTransitText(interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          setTransitText("");
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const clearText = useCallback(() => {
    setFinalText("");
    setTransitText("");
  }, []);

  return {
    isListening,
    transitText,
    finalText,
    currentSpeaker,
    setCurrentSpeaker,
    startListening,
    stopListening,
    clearText,
  };
}
