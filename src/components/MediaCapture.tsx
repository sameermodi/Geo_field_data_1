import React, { useRef, useState, useEffect } from 'react';
import { Camera, Video, Mic, X, Check, Pause, Play } from 'lucide-react';

interface MediaCaptureProps {
  type: 'photo' | 'video' | 'audio';
  onCapture: (data: string) => void;
  onCancel: () => void;
}

export default function MediaCapture({ type, onCapture, onCancel }: MediaCaptureProps) {
  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isBackCamera, setIsBackCamera] = useState(true);

  const startMediaStream = async () => {
    try {
      const constraints = {
        video: type !== 'audio' ? {
          facingMode: isBackCamera ? 'environment' : 'user'
        } : false,
        audio: type === 'audio' || type === 'video'
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (mediaRef.current && type !== 'audio') {
        mediaRef.current.srcObject = mediaStream;
      }

      if (type === 'audio') {
        setupAudioVisualization(mediaStream);
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const setupAudioVisualization = (mediaStream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(mediaStream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
    
    if (canvasRef.current) {
      drawAudioVisualization();
    }
  };

  const drawAudioVisualization = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(20, 20, 30)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(${barHeight + 100}, 65, 255)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  useEffect(() => {
    startMediaStream();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isBackCamera]);

  const startRecording = () => {
    if (!stream) return;

    const mimeType = type === 'video' ? 'video/webm' : 'audio/webm';
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      setRecordedChunks(chunks);
    };

    mediaRecorder.start();
    setIsRecording(true);
    
    // Start duration counter
    const startTime = Date.now();
    const durationInterval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    mediaRecorderRef.current.onstop = () => {
      clearInterval(durationInterval);
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      setRecordedChunks(chunks);
    };
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDuration(0);
    }
  };

  const handleCapture = () => {
    if (type === 'photo' && mediaRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = mediaRef.current.videoWidth;
      canvas.height = mediaRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(mediaRef.current, 0, 0);
      const data = canvas.toDataURL('image/jpeg');
      setPreview(data);
    } else if ((type === 'video' || type === 'audio') && !isRecording) {
      startRecording();
    } else if (isRecording) {
      stopRecording();
    }
  };

  const confirmCapture = () => {
    if (preview) {
      if (type === 'photo') {
        onCapture(preview);
      } else {
        // Convert recorded chunks to base64
        const blob = new Blob(recordedChunks, { 
          type: type === 'video' ? 'video/webm' : 'audio/webm' 
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onCapture(base64data);
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsBackCamera(!isBackCamera);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative max-w-2xl w-full mx-4">
        {type !== 'audio' && (
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            {!preview ? (
              <>
                <video
                  ref={mediaRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {type === 'photo' && (
                  <button
                    onClick={toggleCamera}
                    className="absolute top-4 right-4 bg-gray-800 p-2 rounded-full"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </>
            ) : (
              type === 'video' ? (
                <video
                  src={preview}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              )
            )}
          </div>
        )}

        {type === 'audio' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <canvas
              ref={canvasRef}
              width={320}
              height={100}
              className="w-full mb-4"
            />
            {isRecording && (
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-xl">{duration}s</span>
              </div>
            )}
            {preview && (
              <audio controls className="w-full mt-4">
                <source src={preview} type="audio/webm" />
              </audio>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-center space-x-4">
          {!preview && (
            <button
              onClick={handleCapture}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
            >
              {type === 'photo' && <Camera className="w-5 h-5" />}
              {type === 'video' && (isRecording ? <Pause /> : <Video />)}
              {type === 'audio' && (isRecording ? <Pause /> : <Mic />)}
              <span>
                {isRecording ? 'Stop Recording' : `Capture ${type}`}
              </span>
            </button>
          )}

          {preview && (
            <>
              <button
                onClick={confirmCapture}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>Confirm</span>
              </button>
              <button
                onClick={() => setPreview(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Retake</span>
              </button>
            </>
          )}

          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}