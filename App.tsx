
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SettingsTab from './components/SettingsTab';
import ChatbotView from './components/ChatbotView';
import ConversationSidebar from './components/ConversationSidebar';
import { GoogleGenAI, Chat } from '@google/genai';
import type { ModelType } from './components/ChatbotView';

export type MessagePart = { text: string } | { inlineData: { mimeType: string; data: string } };
export type Message = { id: string; role: 'user' | 'model'; parts: MessagePart[]; };
export type Conversation = { id: string; title: string; chat?: Chat; messages: Message[]; };

const App: React.FC = () => {
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini');
  const [isLoaded, setIsLoaded] = useState(false);

  const ai = useMemo(() => googleApiKey ? new GoogleGenAI({ apiKey: googleApiKey }) : null, [googleApiKey]);

  // Effect 1: Load all persistent state from localStorage on initial mount
  useEffect(() => {
    const savedGoogleKey = localStorage.getItem('googleApiKey');
    if (savedGoogleKey) setGoogleApiKey(savedGoogleKey);
    
    const savedOpenAiKey = localStorage.getItem('chatGptApiKey');
    if (savedOpenAiKey) setOpenAiApiKey(savedOpenAiKey);

    const savedActiveId = localStorage.getItem('activeConversationId');
    if (savedActiveId) setActiveConversationId(savedActiveId);

    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel) setSelectedModel(savedModel as ModelType);

    try {
      const savedConvs = localStorage.getItem('chatbotConversations');
      setConversations(savedConvs ? JSON.parse(savedConvs) : {});
    } catch (error) {
      console.error("Failed to load conversations from localStorage", error);
      setConversations({});
    }
    
    setIsLoaded(true); // Signal that initial load is complete
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect 2: Reconstruct chat sessions for Gemini when the AI is ready and data has been loaded
  useEffect(() => {
    if (!ai || !isLoaded) return;

    setConversations(prevConvs => {
      // FIX: Explicitly type the destructured 'conv' parameter to ensure it's treated as a 'Conversation' object.
      // This resolves errors where properties like 'messages' and 'chat' were not recognized.
      const convsToUpdate = Object.entries(prevConvs)
          .filter(([, conv]: [string, Conversation]) => conv.messages && !conv.chat);

      if (convsToUpdate.length === 0) {
          return prevConvs; // No changes needed
      }

      const updatedConvs = { ...prevConvs };
      convsToUpdate.forEach(([convId, conv]) => {
          updatedConvs[convId] = {
              ...conv,
              chat: ai.chats.create({ 
                  model: 'gemini-2.5-flash',
                  history: conv.messages
                    .filter((msg: Message) => (msg.role === 'user' || msg.role === 'model') && msg.parts.length > 0) 
                    .map((msg: Message) => ({
                        role: msg.role,
                        parts: msg.parts.map(part => 'text' in part ? { text: part.text } : part)
                    }))
              })
          };
      });
      return updatedConvs;
    });
  }, [ai, isLoaded]);

  // Effect 3: Save conversations whenever they change, but only after initial load is complete
  useEffect(() => {
    if (!isLoaded) return;
    try {
      // FIX: Explicitly type the destructured 'value' parameter as 'Conversation' in the reduce callback.
      // This resolves the error when destructuring '{ chat, ...rest }' from 'value'.
      const conversationsToSave = Object.entries(conversations).reduce((acc, [key, value]: [string, Conversation]) => {
          const { chat, ...rest } = value;
          acc[key] = rest;
          return acc;
      }, {} as Record<string, Omit<Conversation, 'chat'>>);

      // FIX: Corrected typo from `conversationsTosave` to `conversationsToSave`.
      localStorage.setItem('chatbotConversations', JSON.stringify(conversationsToSave));
    } catch (error) {
        console.error("Failed to save conversations to localStorage", error);
    }
  }, [conversations, isLoaded]);

  // Effect 4: Save the active conversation ID, but only after initial load
  useEffect(() => {
    if (!isLoaded) return;
    if (activeConversationId) {
      localStorage.setItem('activeConversationId', activeConversationId);
    } else {
      localStorage.removeItem('activeConversationId');
    }
  }, [activeConversationId, isLoaded]);

  // Effect 5: Save the selected model, but only after initial load
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('selectedModel', selectedModel);
  }, [selectedModel, isLoaded]);


  const handleGoogleApiKeyChange = (newKey: string) => {
    // If no keys exist yet, setting this one makes it the default model.
    if (!googleApiKey && !openAiApiKey && newKey) {
      setSelectedModel('gemini');
    }
    setGoogleApiKey(newKey);
    localStorage.setItem('googleApiKey', newKey);
    if (newKey) setShowApiKeyPrompt(false);
  };
  
  const handleOpenAiApiKeyChange = (newKey: string) => {
    // If no keys exist yet, setting this one makes it the default model.
    if (!googleApiKey && !openAiApiKey && newKey) {
      setSelectedModel('openai');
    }
    setOpenAiApiKey(newKey);
    localStorage.setItem('chatGptApiKey', newKey);
    if (newKey) setShowApiKeyPrompt(false);
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const handleNewChat = () => {
    // Let user choose model first, but for now default to Gemini key check
    if (!googleApiKey && !openAiApiKey) {
      setShowApiKeyPrompt(true);
      return;
    }
    const newId = `conv-${Date.now()}`;
    const newConversation: Conversation = {
      id: newId,
      title: 'Cuộc trò chuyện mới',
      messages: [],
      chat: selectedModel === 'gemini' && ai ? ai.chats.create({ model: 'gemini-2.5-flash' }) : undefined
    };
    setConversations(prev => ({ ...prev, [newId]: newConversation }));
    setActiveConversationId(newId);
  };

  const handleSaveConversationTitle = (id: string, title: string) => {
    if (title.trim()) {
      updateConversation(id, { title: title.trim() });
    }
  };
  
  const handleChatFocus = () => {
    if (!googleApiKey && !openAiApiKey) {
        setShowApiKeyPrompt(true);
    }
  };

  const handleSendMessage = async (userMessage: Message, model: ModelType) => {
    if ((model === 'gemini' && !googleApiKey) || (model === 'openai' && !openAiApiKey)) {
        setShowApiKeyPrompt(true);
        return;
    }
    
    let localActiveConversationId = activeConversationId;
    let localCurrentConversation: Conversation | null = localActiveConversationId ? conversations[localActiveConversationId] : null;

    if (!localActiveConversationId) {
        const newId = `conv-${Date.now()}`;
        const firstMessageText = userMessage.parts.find(p => 'text' in p) as { text: string } | undefined;
        const newTitle = firstMessageText?.text.substring(0, 40).trim() || 'Cuộc trò chuyện mới';
        
        localCurrentConversation = {
          id: newId,
          title: newTitle,
          messages: [],
          chat: model === 'gemini' && ai ? ai.chats.create({ model: 'gemini-2.5-flash' }) : undefined,
        };
        setConversations(prev => ({ ...prev, [newId]: localCurrentConversation! }));
        setActiveConversationId(newId);
        localActiveConversationId = newId;
    }

    if (!localActiveConversationId || !localCurrentConversation) return;
    setShowApiKeyPrompt(false);

    const updatedMessages = [...localCurrentConversation.messages, userMessage];
    updateConversation(localActiveConversationId, { messages: updatedMessages });
    const modelMessageId = `msg-${Date.now()}-model`;
    updateConversation(localActiveConversationId, { messages: [...updatedMessages, { id: modelMessageId, role: 'model', parts: [{text: ""}]}] });

    try {
      if (model === 'gemini') {
        if (!ai) return;
        const chat = localCurrentConversation.chat || ai.chats.create({ model: 'gemini-2.5-flash', history: localCurrentConversation.messages.map(m => ({role: m.role, parts: m.parts})) });
        if (!localCurrentConversation.chat) updateConversation(localActiveConversationId, { chat });

        const result = await chat.sendMessageStream({ message: userMessage.parts });
        let accumulatedText = "";
        
        for await (const chunk of result) {
            accumulatedText += chunk.text;
            setConversations(prev => {
                const conv = prev[localActiveConversationId!];
                if (!conv) return prev;
                const lastMsgIndex = conv.messages.length - 1;
                const newMessages = [...conv.messages];
                if (lastMsgIndex >= 0 && newMessages[lastMsgIndex]?.role === 'model') {
                    newMessages[lastMsgIndex] = { ...newMessages[lastMsgIndex], parts: [{ text: accumulatedText }] };
                    return { ...prev, [localActiveConversationId!]: { ...conv, messages: newMessages }};
                }
                return prev;
            });
        }
      } else { // OpenAI logic
        const openAiMessages = updatedMessages
          .filter(m =>
            (m.role === 'user' || m.role === 'model') &&
            m.parts.some(p => ('text' in p && p.text.trim() !== '') || 'inlineData' in p)
          )
          .map(m => {
            const hasImage = m.parts.some(p => 'inlineData' in p);

            if (!hasImage) {
              const textContent = m.parts
                .map(part => ('text' in part ? part.text : ''))
                .join('\n');
              return {
                role: m.role === 'model' ? 'assistant' : 'user',
                content: textContent,
              };
            } else {
              const contentParts = m.parts.map(part => {
                if ('text' in part && part.text) {
                  return { type: 'text', text: part.text };
                }
                if ('inlineData' in part) {
                  return {
                    type: 'image_url',
                    image_url: {
                      url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                    },
                  };
                }
                return null;
              }).filter(Boolean);

              return {
                role: m.role === 'model' ? 'assistant' : 'user',
                content: contentParts,
              };
            }
          });
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAiApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: openAiMessages,
                stream: true,
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

            for (const line of lines) {
                const jsonStr = line.replace('data: ', '');
                if (jsonStr === '[DONE]') continue;
                try {
                    const parsed = JSON.parse(jsonStr);
                    const delta = parsed.choices[0]?.delta?.content;
                    if (delta) {
                        accumulatedText += delta;
                        setConversations(prev => {
                            const conv = prev[localActiveConversationId!];
                            if (!conv) return prev;
                            const lastMsgIndex = conv.messages.length - 1;
                            const newMessages = [...conv.messages];
                            if (lastMsgIndex >= 0 && newMessages[lastMsgIndex]?.role === 'model') {
                                newMessages[lastMsgIndex] = { ...newMessages[lastMsgIndex], parts: [{ text: accumulatedText }] };
                                return { ...prev, [localActiveConversationId!]: { ...conv, messages: newMessages }};
                            }
                            return prev;
                        });
                    }
                } catch (e) {
                    console.error('Error parsing stream chunk:', e);
                }
            }
        }
      }
    } catch (error) {
      console.error(error);
      let errorMessageText = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
      
      // Check for OpenAI quota-specific error message
      if (model === 'openai' && /quota|billing/i.test(errorMessageText)) {
          errorMessageText = "Lỗi: Bạn đã vượt quá hạn ngạch sử dụng OpenAI API.\n\nVui lòng kiểm tra gói cước và thông tin thanh toán của bạn tại trang tổng quan OpenAI. Nguyên nhân có thể là do thẻ thanh toán hết hạn hoặc bạn cần nạp thêm tín dụng (credits) để tiếp tục sử dụng.";
      } else {
          errorMessageText = `Lỗi: ${errorMessageText}`;
      }

      const errorMsg: Message = { id: `msg-${Date.now()}-error`, role: 'model', parts: [{ text: errorMessageText }] };

      setConversations(prev => {
        const conv = prev[localActiveConversationId!];
        if (!conv) return prev;
        // Replace the placeholder message with the error
        const newMessages = [...conv.messages];
        const lastMsgIndex = newMessages.length - 1;
         if (lastMsgIndex >= 0 && newMessages[lastMsgIndex].id === modelMessageId) {
            newMessages[lastMsgIndex] = errorMsg;
         } else {
            newMessages.push(errorMsg);
         }
        return { ...prev, [localActiveConversationId!]: { ...conv, messages: newMessages } };
      });
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 text-gray-300 font-sans h-full rounded-lg border border-slate-700/50 overflow-hidden">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="w-[14.28%] flex-shrink-0 bg-slate-800/50 p-2 border-r border-slate-700/50">
          <ConversationSidebar 
            conversations={conversations}
            activeConversationId={activeConversationId}
            onNewChat={handleNewChat}
            onSelectConversation={setActiveConversationId}
            onSaveTitle={handleSaveConversationTitle}
          />
        </div>

        <div className="flex-1 flex flex-col bg-slate-800">
          <ChatbotView
            googleApiKey={googleApiKey}
            openAiApiKey={openAiApiKey}
            activeConversation={conversations[activeConversationId || '']}
            onSendMessage={handleSendMessage}
            showApiKeyPrompt={showApiKeyPrompt}
            onGoogleApiKeyChange={handleGoogleApiKeyChange}
            onOpenAiApiKeyChange={handleOpenAiApiKeyChange}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            onChatFocus={handleChatFocus}
          />
        </div>

        <div className="w-[14.28%] flex-shrink-0 bg-slate-800/50 p-2 border-l border-slate-700/50">
          <SettingsTab />
        </div>
      </main>
    </div>
  );
};

export default App;
