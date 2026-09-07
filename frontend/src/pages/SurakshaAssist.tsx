import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Upload,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Shield
} from 'lucide-react';
import { ChatResponse, SourceCitation } from '../types';
import { api } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: SourceCitation[];
  confidence?: string;
  isGrounded?: boolean;
}

export const SurakshaAssist: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello Commander. I am **SURAKSHA ASSIST**, your verified disaster management decision support assistant. I provide operational guidance strictly derived from indexed National Disaster Management Authority (NDMA) Standard Operating Procedures and evacuation doctrines.",
      confidence: 'High',
      isGrounded: true
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('Operational SOP');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const presetQuestions = [
    "What should authorities do when a habitation becomes critical?",
    "How should evacuation priorities be decided for vulnerable groups?",
    "What factors should be considered when selecting a relief shelter?",
    "What are the road water depth safety limits for evacuation convoys?"
  ];

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText
    };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(queryText);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.answer,
        sources: res.sources,
        confidence: res.confidence_level,
        isGrounded: res.is_knowledge_base_supported
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "Error communicating with the RAG Knowledge Engine. Please ensure the backend server is active.",
        confidence: 'Unsupported',
        isGrounded: false
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    if (uploadTitle) formData.append('title', uploadTitle);
    formData.append('category', uploadCategory);

    setUploadStatus('Uploading & chunking document...');
    try {
      const res = await api.uploadDocument(formData);
      setUploadStatus(`Success! Ingested into knowledge base with ${res.chunks_created} indexed chunks.`);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStatus('');
        setUploadFile(null);
        setUploadTitle('');
      }, 1500);
    } catch (err) {
      setUploadStatus('Upload failed. Please upload a plain text (.txt) or markdown (.md) document.');
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-5xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-white">SURAKSHA ASSIST</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                RAG Decision Copilot
              </span>
            </div>
            <p className="text-xs text-slate-400">Strictly grounded in NDMA protocols and verified disaster standard operating procedures</p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition"
        >
          <Upload className="h-3.5 w-3.5 text-purple-400" />
          <span>Ingest Custom SOP</span>
        </button>
      </div>

      {/* Preset Prompt Chips */}
      <div className="flex flex-wrap gap-1.5">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] bg-slate-900/80 hover:bg-purple-950/40 text-slate-300 hover:text-purple-300 border border-slate-800 hover:border-purple-500/40 px-3 py-1 rounded-full transition flex items-center space-x-1"
          >
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-950/70 backdrop-blur-md shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
              msg.sender === 'user'
                ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
            }`}>
              {/* Header for Bot */}
              {msg.sender === 'assistant' && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] font-mono">
                  <div className="flex items-center space-x-1.5 text-purple-400 font-bold">
                    <Shield className="h-3.5 w-3.5" />
                    <span>NDMA VERIFIED GROUNDING</span>
                  </div>
                  {msg.confidence && (
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                      msg.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {msg.confidence} Relevance
                    </span>
                  )}
                </div>
              )}

              {/* Message Content formatted with line breaks */}
              <div className="whitespace-pre-line font-sans text-xs sm:text-[13px]">
                {msg.text}
              </div>

              {/* Verified Sources Accordion */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Retrieved Knowledge Base Sources ({msg.sources.length})</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {msg.sources.map((src, sIdx) => {
                      const isExp = expandedSourceId === `${msg.id}-${sIdx}`;
                      return (
                        <div
                          key={sIdx}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1"
                        >
                          <div
                            onClick={() => setExpandedSourceId(isExp ? null : `${msg.id}-${sIdx}`)}
                            className="flex items-center justify-between cursor-pointer text-[11px]"
                          >
                            <span className="font-bold text-cyan-300 truncate mr-2">
                              📄 {src.document_title}
                            </span>
                            <div className="flex items-center space-x-1 shrink-0 font-mono text-[10px]">
                              <span className="text-emerald-400">{src.relevance_score}% match</span>
                              {isExp ? <ChevronUp className="h-3 w-3 text-slate-400" /> : <ChevronDown className="h-3 w-3 text-slate-400" />}
                            </div>
                          </div>

                          {isExp && (
                            <p className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 italic mt-1 font-mono">
                              "{src.snippet}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-xs text-purple-400 font-mono p-3 bg-slate-900 border border-slate-800 rounded-xl w-fit">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping"></span>
            <span>Searching verified NDMA knowledge base chunks...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700/80 shadow-2xl focus-within:border-cyan-500"
        >
          <input
            type="text"
            placeholder="Ask SURAKSHA ASSIST about disaster SOPs, triage protocols, or carrying capacity..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white p-2 rounded-lg transition shadow-md shadow-cyan-500/20"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-1">
          SURAKSHA ASSIST does not hallucinate unverified policies. All answers cite official disaster manuals.
        </p>
      </div>

      {/* Upload SOP Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Ingest Official Disaster Guideline
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">DOCUMENT TITLE</label>
                <input
                  type="text"
                  placeholder="e.g., District Flood Response SOP 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">CATEGORY</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                >
                  <option value="Operational SOP">Operational SOP</option>
                  <option value="Vulnerability Triage Guideline">Vulnerability Triage Guideline</option>
                  <option value="Camp Management & Carrying Capacity">Camp Management & Carrying Capacity</option>
                  <option value="Geological & Hillside SOP">Geological & Hillside SOP</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">SELECT FILE (.TXT OR .MD)</label>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg p-2 file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-2 file:py-1 file:mr-2 file:text-xs"
                />
              </div>

              {uploadStatus && (
                <div className="p-2.5 rounded bg-slate-950 border border-purple-500/40 text-[11px] text-purple-300 font-mono">
                  {uploadStatus}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  Upload & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
