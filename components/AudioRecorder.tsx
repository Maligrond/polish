import React, { useState, useRef, useEffect, useCallback } from 'react';
import { formatTime } from '../utils/audioUtils';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stopVisualizer();
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
      startVisualizer(stream);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Не удалось получить доступ к микрофону. Пожалуйста, проверьте разрешения.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
      
      // Stop all tracks to release mic
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const startTimer = () => {
    setDuration(0);
    timerIntervalRef.current = window.setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  // Visualizer Logic
  const startVisualizer = (stream: MediaStream) => {
    if (!canvasRef.current) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    const analyzer = audioContext.createAnalyser();
    analyzerRef.current = analyzer;
    analyzer.fftSize = 256;
    
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyzer);
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;
    
    drawVisualizer();
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyzerRef.current || !dataArrayRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyzer = analyzerRef.current;
    const dataArray = dataArrayRef.current;

    if (!ctx) return;

    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
    analyzer.getByteFrequencyData(dataArray);

    ctx.fillStyle = '#f8fafc'; // Match background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      barHeight = dataArray[i] / 2;
      
      // Gradient fill
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#ef4444'); // Red
      gradient.addColorStop(1, '#fca5a5'); // Light Red

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopVisualizer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-xl mx-auto">
      <div className="mb-6 relative w-full h-32 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100">
        <canvas ref={canvasRef} width="500" height="128" className="w-full h-full" />
        {!isRecording && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            Аудиовизуализатор
          </div>
        )}
      </div>

      <div className="text-4xl font-mono font-bold text-slate-700 mb-8 tabular-nums">
        {formatTime(duration)}
      </div>

      {!isRecording ? (
        <button
          onClick={startRecording}
          className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/30 focus:outline-none focus:ring-4 focus:ring-red-500/20"
          aria-label="Start Recording"
        >
          <div className="w-8 h-8 rounded-full bg-white transition-transform group-hover:scale-110"></div>
          <span className="absolute -bottom-8 text-sm font-medium text-slate-500 w-32 text-center -ml-1">Начать запись</span>
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 hover:bg-slate-900 transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-slate-500/20"
          aria-label="Stop Recording"
        >
          <div className="w-8 h-8 rounded-md bg-white transition-transform group-hover:scale-90"></div>
          <span className="absolute -bottom-8 text-sm font-medium text-slate-500 animate-pulse">Запись...</span>
        </button>
      )}
    </div>
  );
};