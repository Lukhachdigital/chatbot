import React, { useState, useEffect, useRef } from 'react';
import Button from './shared/Button';
import Input from './shared/Input';
import type { Conversation, Message, MessagePart } from '../App';

export type ModelType = 'gemini' | 'openai';

interface ChatbotViewProps {
  googleApiKey: string;
  openAiApiKey: string;
  activeConversation: Conversation | null;
  onSendMessage: (userMessage: Message, model: ModelType) => Promise<void>;
  showApiKeyPrompt: boolean;
  onGoogleApiKeyChange: (key: string) => void;
  onOpenAiApiKeyChange: (key: string) => void;
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
}

const InlineApiKeyPrompt: React.FC<{
    googleApiKey: string;
    openAiApiKey: string;
    onGoogleApiKeyChange: (key: string) => void;
    onOpenAiApiKeyChange: (key: string) => void;
}> = ({ googleApiKey, openAiApiKey, onGoogleApiKeyChange, onOpenAiApiKeyChange }) => {
    const [tempGoogleKey, setTempGoogleKey] = useState(googleApiKey);
    const [tempOpenAiKey, setTempOpenAiKey] = useState(openAiApiKey);

    return (
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-4">
                 <p className="text-center font-semibold text-yellow-400">
                    Vui lòng nhập API key để bắt đầu cuộc trò chuyện.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Google API Key Input */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-semibold">Google AI:</label>
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                                Lấy API Key
                            </a>
                        </div>
                        <Input
                            type="password"
                            placeholder="Enter Google AI API key"
                            value={tempGoogleKey}
                            onChange={(e) => setTempGoogleKey(e.target.value)}
                        />
                        <Button onClick={() => onGoogleApiKeyChange(tempGoogleKey)} className="w-full">Save Google Key</Button>
                    </div>
                     {/* OpenAI API Key Input */}
                    <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <label className="block text-sm font-semibold">OpenAI:</label>
                            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                                Lấy API Key
                            </a>
                         </div>
                        <Input
                            type="password"
                            placeholder="Enter OpenAI API key"
                            value={tempOpenAiKey}
                            onChange={(e) => setTempOpenAiKey(e.target.value)}
                        />
                        <Button onClick={() => onOpenAiApiKeyChange(tempOpenAiKey)} className="w-full">Save OpenAI Key</Button>
                    </div>
                 </div>
            </div>
        </div>
    );
};


const ModelSelector: React.FC<{ selected: ModelType, onSelect: (model: ModelType) => void, disabled: boolean }> = ({ selected, onSelect, disabled }) => {
    const baseStyle = "px-4 py-1.5 text-sm font-semibold rounded-md transition-colors";
    const activeStyle = "bg-blue-600 text-white";
    const inactiveStyle = "bg-slate-700 hover:bg-slate-600 text-gray-300";

    return (
        <div className="flex items-center space-x-2 bg-slate-900/70 p-1 rounded-lg">
            <button onClick={() => onSelect('gemini')} className={`${baseStyle} ${selected === 'gemini' ? activeStyle : inactiveStyle}`} disabled={disabled}>
                Gemini
            </button>
            <button onClick={() => onSelect('openai')} className={`${baseStyle} ${selected === 'openai' ? activeStyle : inactiveStyle}`} disabled={disabled}>
                ChatGPT
            </button>
        </div>
    );
};

const ChatbotView: React.FC<ChatbotViewProps> = ({ 
    googleApiKey,
    openAiApiKey,
    activeConversation,
    onSendMessage,
    showApiKeyPrompt,
    onGoogleApiKeyChange,
    onOpenAiApiKeyChange,
    selectedModel,
    onSelectModel,
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string, type: string, data: string, preview: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  const otherFilesInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(scrollToBottom, [activeConversation?.messages]);
  
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'microphone' as PermissionName }).then((permissionStatus) => {
            setMicrophonePermission(permissionStatus.state);
            permissionStatus.onchange = () => {
                setMicrophonePermission(permissionStatus.state);
            };
        });
    }

    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      const recognition = speechRecognitionRef.current;
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentInput(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            alert("Quyền truy cập micrô đã bị từ chối. Để sử dụng tính năng nhập liệu bằng giọng nói, vui lòng cho phép quyền truy cập micrô cho trang web này trong cài đặt trình duyệt của bạn.");
        } else {
            alert(`Đã xảy ra lỗi trong quá trình nhận dạng giọng nói: ${event.error}`);
        }
      };

      recognition.onend = () => setIsListening(false);
    } else {
        console.warn("Speech Recognition API not supported in this browser.");
    }
  }, []);

  const handleLocalSendMessage = async () => {
    if (!currentInput.trim() && !attachedFile) return;
    
    setIsSending(true);
    const userMessageParts: MessagePart[] = [];
    if (attachedFile) {
        userMessageParts.push({ inlineData: { mimeType: attachedFile.type, data: attachedFile.data } });
    }
    if (currentInput.trim()) {
        userMessageParts.push({ text: currentInput.trim() });
    }
    
    const userMessage: Message = { id: `msg-${Date.now()}`, role: 'user', parts: userMessageParts };
    
    setCurrentInput('');
    setAttachedFile(null);
    
    await onSendMessage(userMessage, selectedModel);

    setIsSending(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setAttachedFile({ name: file.name, type: file.type, data: base64String, preview: URL.createObjectURL(file) });
      };
      reader.readAsDataURL(file);
    }
    if(e.target) e.target.value = '';
  };

  const handleVoiceInput = () => {
    if (!speechRecognitionRef.current) {
        alert("Tính năng nhận dạng giọng nói không được trình duyệt của bạn hỗ trợ.");
        return;
    }

    if (microphonePermission === 'denied') {
        alert("Quyền truy cập micrô đã bị chặn. Để sử dụng tính năng nhập liệu bằng giọng nói, vui lòng cho phép quyền truy cập micrô cho trang web này trong cài đặt trình duyệt của bạn.");
        return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
    } else {
      setIsListening(true);
      speechRecognitionRef.current.start();
    }
  };
  
  const welcomeMessage = (
       <div className="flex-1 flex items-center justify-center text-center text-gray-400 p-4">
            <p>Nhập tin nhắn bên dưới để bắt đầu một cuộc trò chuyện mới.</p>
        </div>
  );

  return (
    <div className="flex flex-col h-full">
        {showApiKeyPrompt && (
            <InlineApiKeyPrompt 
                googleApiKey={googleApiKey}
                openAiApiKey={openAiApiKey}
                onGoogleApiKeyChange={onGoogleApiKeyChange}
                onOpenAiApiKeyChange={onOpenAiApiKeyChange}
            />
        )}
        
        {activeConversation && <div className="flex justify-center items-center p-2 border-b border-slate-700">
            <ModelSelector selected={selectedModel} onSelect={onSelectModel} disabled={isSending} />
        </div>}
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {!activeConversation && welcomeMessage}
            {activeConversation?.messages.map(msg => (
                <div key={msg.id} className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.role === 'model' && <img src="https://lamyoutubeai.com/Image/logotool.png" alt="AI logo" className="w-8 h-8 rounded-full flex-shrink-0 object-cover border-2 border-blue-500" />}
                   <div className={`p-3 rounded-lg max-w-3xl text-lg leading-relaxed ${msg.role === 'user' ? 'bg-blue-800 text-white' : 'bg-slate-700'}`}>
                        {msg.parts.map((part, index) => {
                            if ('text' in part) {
                                return <p key={index} className="whitespace-pre-wrap">{part.text || '...'}</p>
                            }
                            if ('inlineData' in part && part.inlineData.mimeType.startsWith('image/')) {
                                return <img key={index} src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} alt="Uploaded content" className="max-w-xs rounded-lg mt-2"/>
                            }
                            return null;
                        })}
                   </div>
                   {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center font-semibold text-sm text-white border-2 border-blue-500">Tôi</div>}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-700/50 bg-slate-800">
            {attachedFile && (
                <div className="mb-2 bg-slate-700 p-2 rounded-lg flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <img src={attachedFile.preview} alt="file preview" className="w-10 h-10 object-cover rounded flex-shrink-0"/>
                        <span className="text-sm truncate">{attachedFile.name}</span>
                    </div>
                    <button onClick={() => setAttachedFile(null)} className="p-1 rounded-full hover:bg-slate-600 text-white flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
            <div className="flex items-center space-x-2 bg-slate-900 rounded-lg p-1">
                <input type="file" ref={otherFilesInputRef} onChange={handleFileChange} accept="application/pdf,text/*" hidden/>
                <input type="file" ref={imageInputRef} onChange={handleFileChange} accept="image/*" hidden/>
                
                <button onClick={() => otherFilesInputRef.current?.click()} className="p-2 rounded-full hover:bg-slate-700" aria-label="Attach file">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
                <button onClick={() => imageInputRef.current?.click()} className="p-2 rounded-full hover:bg-slate-700" aria-label="Attach image">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
                <button onClick={handleVoiceInput} className={`p-2 rounded-full hover:bg-slate-700 ${isListening ? 'text-red-500 animate-pulse' : ''}`} aria-label="Use voice">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM11 4a1 1 0 0 1 2 0v8a1 1 0 0 1-2 0V4z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2h2v2a5 5 0 0 0 10 0v-2h2z"/></svg>
                </button>
                <textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleLocalSendMessage(); } }}
                    placeholder="Nhập tin nhắn của bạn..."
                    className="flex-1 bg-transparent focus:outline-none resize-none text-lg p-2"
                    rows={1}
                    disabled={isSending}
                />
                <Button onClick={handleLocalSendMessage} disabled={isSending || (!currentInput.trim() && !attachedFile)} className="p-2 rounded-full h-10 w-10 flex items-center justify-center">
                    {isSending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    )}
                </Button>
            </div>
        </div>
    </div>
  );
};

export default ChatbotView;