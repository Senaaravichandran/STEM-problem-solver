import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceInputButton = ({ onTranscription, isLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check supported formats
      console.log('Supported MIME types:');
      console.log('audio/wav:', MediaRecorder.isTypeSupported('audio/wav'));
      console.log('audio/webm:', MediaRecorder.isTypeSupported('audio/webm'));
      console.log('audio/mp4:', MediaRecorder.isTypeSupported('audio/mp4'));
      console.log('audio/webm;codecs=opus:', MediaRecorder.isTypeSupported('audio/webm;codecs=opus'));
      
      // Set up audio level monitoring
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
          setAudioLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();

      // Use supported audio format
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }
      
      console.log('Using MIME type:', mimeType);
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current.mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Audio blob created:', {
          size: audioBlob.size,
          type: audioBlob.type,
          mimeType: mimeType,
          chunks: audioChunksRef.current.length
        });
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          console.log('Base64 audio length:', base64Audio.length);
          
          // Determine format for API
          let format = 'webm';
          if (mimeType.includes('mp4')) {
            format = 'mp4';
          } else if (mimeType.includes('wav')) {
            format = 'wav';
          }

          try {
            console.log('Sending transcription request with audio data length:', base64Audio.length);
            const response = await fetch('http://localhost:5000/api/transcribe-audio', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                audio: base64Audio,
                format: format
              }),
            });            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${result.error || 'Transcription failed'}`);
            }

            if (result.success && result.transcript) {
              onTranscription(result.transcript);
            } else {
              setError(result.error || 'No speech detected. Please try again.');
            }
          } catch (err) {
            console.error('Detailed transcription error:', err);
            setError(`Failed to transcribe audio: ${err.message}`);
          }
        };
        reader.readAsDataURL(audioBlob);

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setAudioLevel(0);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={toggleRecording}
        disabled={isLoading}
        className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Audio level indicator */}
      {isRecording && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse">
          <div 
            className="w-full h-full rounded-full bg-red-400 transition-transform duration-100"
            style={{ transform: `scale(${1 + audioLevel})` }}
          />
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700 whitespace-nowrap z-10">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceInputButton;
