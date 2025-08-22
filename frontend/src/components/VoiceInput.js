import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, VolumeX, Volume2, Settings } from 'lucide-react';

const VoiceInput = ({ onTranscription, isLoading = false, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const animationRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    const cleanup = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };

    return cleanup;
  }, [isRecording]);

  // Audio level monitoring
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(Math.min(100, (average / 255) * 100));
    
    animationRef.current = requestAnimationFrame(monitorAudioLevel);
  };

  const startRecording = async () => {
    try {
      setError('');
      setRecordingTime(0);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;

      // Set up audio analysis
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start monitoring
      monitorAudioLevel();
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      setAudioLevel(0);
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      setIsProcessing(true);
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        try {
          const response = await fetch('/api/transcribe-audio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audio: base64Audio,
              options: {
                model: 'nova-2',
                language: 'en-US',
                punctuate: true,
                smart_format: true
              }
            }),
          });

          const result = await response.json();
          
          if (result.success) {
            onTranscription({
              transcript: result.transcript,
              confidence: result.confidence,
              enhancementApplied: result.enhancement_applied,
              metadata: result.metadata
            });
          } else {
            setError(result.error || 'Transcription failed');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          setError('Failed to transcribe audio. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (error) {
      console.error('Audio processing error:', error);
      setError('Failed to process audio. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAudioLevelColor = () => {
    if (audioLevel < 30) return 'bg-green-500';
    if (audioLevel < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="voice-input-container">
      {/* Voice Input Button */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isLoading || isProcessing}
          className={`
            relative p-4 rounded-full transition-all duration-200 transform
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
            }
            ${(disabled || isLoading || isProcessing) 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer'
            }
            text-white shadow-lg hover:shadow-xl
          `}
        >
          {isRecording ? (
            <MicOff size={24} />
          ) : isProcessing ? (
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Mic size={24} />
          )}
        </button>

        {/* Recording Status */}
        <div className="flex-1">
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Recording: {formatTime(recordingTime)}
                </span>
              </div>
              
              {/* Audio Level Indicator */}
              <div className="flex items-center gap-2">
                <VolumeX size={16} className="text-slate-400" />
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-100 ${getAudioLevelColor()}`}
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
                <Volume2 size={16} className="text-slate-400" />
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Processing audio...
              </span>
            </div>
          )}

          {!isRecording && !isProcessing && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click the microphone to start voice input
            </p>
          )}
        </div>

        {/* Settings Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Settings size={16} />
          <span>Enhanced with LJ Speech</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        <p>• Speak clearly and at normal volume</p>
        <p>• Enhanced with 13,101 speech training samples</p>
        <p>• Automatic noise reduction and smart formatting</p>
      </div>
    </div>
  );
};

export default VoiceInput;
