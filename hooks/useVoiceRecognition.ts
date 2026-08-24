"use client";

import { useEffect, useRef, useCallback } from "react";
import { VoiceError } from "@/types";
import { useShoppingStore } from "@/store/shoppingStore";

// Web Speech API type declarations (not in standard TypeScript DOM lib for all targets)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionAPI = any;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionAPI;
    webkitSpeechRecognition: SpeechRecognitionAPI;
  }
}

interface UseVoiceRecognitionReturn {
  start: () => void;
  stop: () => void;
  isListening: boolean;
  error: VoiceError | null;
  isSupported: boolean;
}

export function useVoiceRecognition(
  onFinalTranscript: (transcript: string) => void
): UseVoiceRecognitionReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const errorRef = useRef<VoiceError | null>(null);
  const isSupportedRef = useRef<boolean>(false);

  const { voiceState, setVoiceState, setInterimTranscript, setTranscript, addToast } =
    useShoppingStore();

  const isListening = voiceState === "listening";

  const onFinalTranscriptRef = useRef(onFinalTranscript);
  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    isSupportedRef.current = !!SpeechRecognitionAPI;

    if (!SpeechRecognitionAPI) {
      errorRef.current = {
        code: "NOT_SUPPORTED",
        message: "Voice recognition is not supported in this browser. Try Chrome or Edge.",
      };
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setVoiceState("listening");
      setInterimTranscript("");
      errorRef.current = null;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) setInterimTranscript(interim);

      if (final) {
        setTranscript(final);
        setInterimTranscript("");
        onFinalTranscriptRef.current(final);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      let error: VoiceError;

      switch (event.error) {
        case "not-allowed":
          error = {
            code: "PERMISSION_DENIED",
            message: "Microphone access was denied. Please allow mic access in browser settings.",
          };
          break;
        case "network":
          error = {
            code: "NETWORK",
            message: "Network error during speech recognition. Check your connection.",
          };
          break;
        case "no-speech":
          error = {
            code: "NO_SPEECH",
            message: "No speech detected. Try speaking closer to your microphone.",
          };
          break;
        case "audio-capture":
          error = {
            code: "AUDIO_CAPTURE",
            message: "Microphone not found. Connect a microphone and try again.",
          };
          break;
        case "service-not-allowed":
          error = {
            code: "SERVICE_NOT_ALLOWED",
            message: "Speech recognition service not allowed.",
          };
          break;
        default:
          error = {
            code: "UNKNOWN",
            message: `Speech recognition error: ${event.error}`,
          };
      }

      errorRef.current = error;
      setVoiceState("error");

      if (event.error !== "no-speech") {
        addToast({ type: "error", message: error.message });
      }
    };

    recognition.onend = () => {
      // Access latest state via the store directly
      const currentState = useShoppingStore.getState().voiceState;
      if (currentState === "listening") {
        setVoiceState("idle");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => {
    if (!isSupportedRef.current) {
      addToast({
        type: "error",
        message: "Voice recognition not supported. Use Chrome or Edge.",
      });
      return;
    }

    if (recognitionRef.current && voiceState !== "listening") {
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  }, [voiceState, addToast]);

  const stop = useCallback(() => {
    if (recognitionRef.current && voiceState === "listening") {
      recognitionRef.current.stop();
      setVoiceState("idle");
    }
  }, [voiceState, setVoiceState]);

  return {
    start,
    stop,
    isListening,
    error: errorRef.current,
    isSupported: isSupportedRef.current,
  };
}
