/**
 * Viva Exam Room — Voice-based interview with AI examiner and webcam proctoring
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProctorEye from './ProctorEye';

interface Message {
  role: 'user' | 'interviewer';
  content: string;
  timestamp: string;
}

interface Violation {
  type: string;
  message: string;
  timestamp: string;
}

interface VivaExamRoomProps {
  vivaSessionId: string;
  moduleTitle: string;
  firstQuestion: string;
  lessonId: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function VivaExamRoom({ vivaSessionId, moduleTitle, firstQuestion, lessonId }: VivaExamRoomProps) {
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Message[]>([
    { role: 'interviewer', content: firstQuestion, timestamp: new Date().toISOString() }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [cumulativeScore, setCumulativeScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [finalFeedback, setFinalFeedback] = useState<string | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [textInput, setTextInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;
    if (!hasRecognition || !hasSynthesis) setSpeechSupported(false);
    synthRef.current = window.speechSynthesis;

    // Speak first question
    setTimeout(() => speak(firstQuestion), 500);
  }, [firstQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Speak text using Web Speech API
  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v =>
      v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Microsoft'))
    ) || voices.find(v => v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  // Voice recognition
  const startListening = () => {
    stopSpeaking();
    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserAnswer(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Handle text submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    handleUserAnswer(textInput.trim());
    setTextInput('');
  };

  // Send answer to backend
  const handleUserAnswer = async (text: string) => {
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setConversation(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/viva/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: vivaSessionId,
          user_text: text,
          module_topic: moduleTitle,
        }),
      });

      if (!response.ok) throw new Error('Failed to process answer');
      const data = await response.json();

      const interviewerContent = data.is_complete
        ? `${data.reply}\n\n${data.final_feedback || ''}`
        : `${data.reply}\n\n${data.next_question}`;

      setConversation(prev => [...prev, {
        role: 'interviewer',
        content: interviewerContent,
        timestamp: new Date().toISOString(),
      }]);

      setCurrentScore(data.score);
      setCumulativeScore(data.cumulative_score);
      setQuestionCount(data.question_count);
      setIsComplete(data.is_complete);
      if (data.is_complete) setFinalFeedback(data.final_feedback);

      setTimeout(() => speak(interviewerContent), 300);
    } catch (error) {
      console.error('Error sending answer:', error);
      setConversation(prev => prev.slice(0, -1));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle proctoring violations
  const handleViolation = (type: string, message: string) => {
    setViolations(prev => [...prev, { type, message, timestamp: new Date().toISOString() }]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Result screen
  if (isComplete) {
    const passed = cumulativeScore >= 60;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className="text-5xl">{passed ? '🎉' : '📚'}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? 'Congratulations!' : 'Keep Learning'}
            </h2>
            <p className="text-gray-600">
              {passed ? 'You passed the viva examination!' : 'Review the material and try again.'}
            </p>
          </div>

          <div className="text-center mb-6">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(cumulativeScore)}`}>
              {cumulativeScore}
            </div>
            <p className="text-sm text-gray-500">Final Score</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {passed ? 'PASSED' : 'FAILED'}
            </span>
          </div>

          {finalFeedback && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Feedback</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{finalFeedback}</p>
            </div>
          )}

          {violations.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-orange-900 mb-2">Proctoring Violations ({violations.length})</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                {violations.slice(0, 5).map((v, i) => (
                  <li key={i}>• {v.message}</li>
                ))}
                {violations.length > 5 && <li>...and {violations.length - 5} more</li>}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/curriculum/${lessonId}`)}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Curriculum
            </button>
            {!passed && (
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Retake Exam
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active exam UI
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{moduleTitle}</h1>
            <p className="text-xs text-gray-500">Viva Voce Examination • Question {questionCount}/5</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(cumulativeScore)}`}>{cumulativeScore}</div>
            <p className="text-xs text-gray-500">Avg Score</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${(questionCount / 5) * 100}%` }} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left side — Chat */}
        <div className="flex-1 flex flex-col">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-4 bg-white border-t border-gray-200">
            {/* Voice status */}
            <div className="text-center mb-3">
              {isSpeaking && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Interviewer speaking...</span>
                  <button onClick={stopSpeaking} className="text-xs text-gray-500 underline">Skip</button>
                </div>
              )}
              {isListening && (
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Listening... Speak now!</span>
                </div>
              )}
            </div>

            {/* Voice + Text input */}
            <div className="flex items-center gap-3">
              {/* Mic button */}
              {speechSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing || isSpeaking}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isListening ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )}
                  </svg>
                </button>
              )}

              {/* Text input fallback */}
              <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your answer..."
                  disabled={isProcessing || isSpeaking}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing || isSpeaking}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Send
                </button>
              </form>
            </div>

            {currentScore > 0 && (
              <p className="text-xs text-center mt-2 text-gray-500">
                Last answer: <span className={getScoreColor(currentScore)}>{currentScore}/100</span>
              </p>
            )}
          </div>
        </div>

        {/* Right side — Proctor + Violations */}
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Webcam Proctor</h3>
            <ProctorEye onViolation={handleViolation} isActive={true} />
          </div>

          {/* Violations log */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Violations {violations.length > 0 && `(${violations.length})`}
            </h3>
            {violations.length === 0 ? (
              <p className="text-xs text-gray-400">No violations detected</p>
            ) : (
              <div className="space-y-2">
                {violations.slice(-10).reverse().map((v, i) => (
                  <div key={i} className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-xs font-medium text-red-700">{v.type}</p>
                    <p className="text-xs text-red-600">{v.message}</p>
                    <p className="text-xs text-red-400 mt-1">
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
