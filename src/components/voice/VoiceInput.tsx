import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, X } from 'lucide-react';
import { voiceCommandProcessor } from '../../services/voiceCommands';

interface VoiceInputProps {
  onCommand: (action: any) => void;
  className?: string;
}

export function VoiceInput({ onCommand, className = '' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setShowTranscript(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Process command after a brief pause
      if (event.results[current].isFinal) {
        processVoiceCommand(transcriptText);
      } else {
        // Set timeout for processing if user stops speaking
        timeoutRef.current = setTimeout(() => {
          processVoiceCommand(transcriptText);
        }, 1500);
      }
    };

    recognition.onerror = (event: any) => {
      setError(`Error: ${event.error}`);
      setIsListening(false);
      
      // Auto-hide error after 3 seconds
      setTimeout(() => {
        setError(null);
        setShowTranscript(false);
      }, 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Hide transcript after a delay
      setTimeout(() => {
        if (!isListening) {
          setShowTranscript(false);
          setTranscript('');
        }
      }, 2000);
    };

    recognitionRef.current = recognition;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processVoiceCommand = (text: string) => {
    const action = voiceCommandProcessor.processCommand(text);
    
    if (action) {
      onCommand(action);
      // Show success feedback
      setTranscript(`✓ ${text}`);
    } else {
      // Show error feedback
      setError('Command not recognized. Try: "Show me AI news" or "Search for climate change"');
    }
    
    // Stop listening after processing
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError('Failed to start speech recognition');
      }
    }
  };

  const suggestions = voiceCommandProcessor.getSuggestions();

  return (
    <>
      {/* Voice button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        className={`relative p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 
                   border border-purple-500/30 rounded-full backdrop-blur-md
                   hover:from-purple-600/30 hover:to-blue-600/30 
                   transition-all duration-200 ${className}`}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <Mic className="w-5 h-5 text-purple-400" />
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-purple-400"
              />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic className="w-5 h-5 text-purple-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Transcript overlay */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-black/95 
                          backdrop-blur-2xl rounded-2xl border border-white/10 
                          shadow-2xl p-6 min-w-[300px] max-w-[500px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isListening ? (
                    <>
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-sm text-purple-400">Listening...</span>
                    </>
                  ) : error ? (
                    <span className="text-sm text-red-400">Error</span>
                  ) : (
                    <span className="text-sm text-green-400">Processing</span>
                  )}
                </div>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Transcript or error */}
              {error ? (
                <p className="text-red-400 text-sm">{error}</p>
              ) : transcript ? (
                <p className="text-white text-lg">{transcript}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Try saying:</p>
                  <ul className="space-y-1">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <li key={index} className="text-gray-300 text-sm">
                        "{suggestion}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Visual indicator */}
              {isListening && (
                <div className="flex justify-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, 20, 8] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                      className="w-1 bg-purple-400 rounded-full"
                      style={{ height: 8 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}