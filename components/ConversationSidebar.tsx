
import React, { useState } from 'react';
import Button from './shared/Button';
import type { Conversation } from '../App';

interface ConversationSidebarProps {
  conversations: Record<string, Conversation>;
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onSaveTitle: (id: string, title: string) => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({ 
  conversations, 
  activeConversationId, 
  onNewChat, 
  onSelectConversation, 
  onSaveTitle 
}) => {
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartEditing = (id: string, title: string) => {
    setEditingConvId(id);
    setEditingTitle(title);
  };

  const handleSave = (id: string) => {
    onSaveTitle(id, editingTitle);
    setEditingConvId(null);
    setEditingTitle('');
  };

  return (
    <div className="h-full flex flex-col">
      <Button variant="secondary" onClick={onNewChat} className="w-full mb-2">
        + Trò chuyện mới
      </Button>
      <div className="flex-grow overflow-y-auto pr-1">
        {Object.values(conversations)
          // FIX: Explicitly type 'a' and 'b' as 'Conversation' to allow accessing `id` for sorting.
          .sort((a: Conversation, b: Conversation) => parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1]))
          // FIX: Explicitly type 'conv' as 'Conversation' to allow accessing its properties in the map function.
          .map((conv: Conversation) => (
            <div 
              key={conv.id} 
              onClick={() => onSelectConversation(conv.id)}
              className={`p-2.5 my-1 text-sm rounded-md cursor-pointer flex items-center justify-between ${activeConversationId === conv.id ? 'bg-blue-600/50' : 'hover:bg-slate-700/50'}`}
            >
              {editingConvId === conv.id ? (
                <input 
                  type="text" 
                  value={editingTitle} 
                  onChange={(e) => setEditingTitle(e.target.value)} 
                  onBlur={() => handleSave(conv.id)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSave(conv.id)} 
                  autoFocus 
                  className="bg-slate-800 border border-slate-600 rounded w-full text-sm p-1"
                />
              ) : (
                <span className="truncate flex-grow">{conv.title}</span>
              )}
              {editingConvId !== conv.id && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEditing(conv.id, conv.title); }} 
                  className="ml-2 p-1 rounded-full hover:bg-slate-600 flex-shrink-0"
                  aria-label="Edit title"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ConversationSidebar;
