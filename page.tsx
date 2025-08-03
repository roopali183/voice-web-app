'use client';
import { useState, useRef } from 'react';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  const startRecording = async () => {
    setTranscript('');
    setChatResponse('');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      audioBlobRef.current = audioBlob;
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async () => {
    if (!audioBlobRef.current) {
      setTranscript('No audio recorded');
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioBlobRef.current);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data: { text?: string; error?: string } = await response.json();
      if (response.ok) {
        setTranscript(data.text || 'No text returned');
      } else {
        setTranscript(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setTranscript('Error sending audio to server');
    }
  };

  const sendToChat = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: transcript }),
      });

      const data = await res.json();
      setChatResponse(data.response || data.error);

      //  Text-to-Speech
      if ('speechSynthesis' in window && data.response) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
      setChatResponse('Failed to get response');
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Voice-to-Text AI App</h1>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        <button
          onClick={transcribeAudio}
          disabled={isRecording || !audioBlobRef.current}
          className={`px-4 py-2 rounded ${
            isRecording || !audioBlobRef.current
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
        >
           Transcribe
        </button>
      </div>

      {transcript && (
        <div className="mt-4">
          <h2 className="font-semibold">Transcription:</h2>
          <p className="bg-gray-100 p-2 mt-2 rounded min-h-[100px]">
            {transcript || '---'}
          </p>
        </div>
      )}

      {transcript && (
        <div className="mt-4">
          <button
            onClick={sendToChat}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
          >
             Send to Chatbot
          </button>
          <p className="bg-gray-200 mt-2 p-2 rounded min-h-[100px]">
             Chatbot: {chatResponse || '---'}
          </p>
        </div>
      )}
    </main>
  );
}