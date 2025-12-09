import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Phone, 
  Search, 
  MoreVertical, 
  User, 
  Bot, 
  Check, 
  CheckCheck,
  Paperclip,
  Mic,
  Smile,
  MessageSquare
} from 'lucide-react';
import config from '../../../config/environment';
import { authService } from '../../../services/authService';

// Helper to normalize phone numbers for comparison
// Removes non-numeric characters to handle +57 vs 57 cases
const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');

// Custom hook for WhatsApp integration
function useWhatsAppChat() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef(null);
  
  // Ref for current chat to access in SSE callback without closure issues
  const currentChatRef = useRef(null);

  // Update ref when state changes
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // Helper to get API URL
  const getUrl = (path) => {
    const baseUrl = process.env.REACT_APP_WHATSAPP_API_URL || config.getApiUrl('/api/whatsapp');
    return `${baseUrl}${path}`;
  };

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(getUrl('/conversations/list?limit=50'));
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []); 

  const handleSSEEvent = useCallback((data) => {
    switch (data.type) {
      case 'connected':
        setIsConnected(true);
        break;
      case 'new_message':
        // Check against ref to avoid stale closure
        const activeChat = currentChatRef.current;
        
        // Use robust comparison with normalization
        const isCurrentChat = activeChat && 
            (normalizePhone(activeChat.phoneNumber) === normalizePhone(data.phoneNumber));
        
        if (isCurrentChat) {
            setMessages(prevMessages => {
                // Avoid duplicates if optimistic update already added it (by ID)
                if (prevMessages.some(m => m.id === data.messageId)) {
                    return prevMessages;
                }
                return [...prevMessages, {
                    id: data.messageId || Date.now().toString(),
                    type: data.type,
                    content: data.content,
                    timestamp: data.timestamp,
                    status: 'received'
                }];
            });
        }

        // Update conversation list
        setConversations(prev => {
          const normalizedDataPhone = normalizePhone(data.phoneNumber);
          const exists = prev.some(c => normalizePhone(c.phoneNumber) === normalizedDataPhone);
          
          if (exists) {
            return prev.map(c => 
              normalizePhone(c.phoneNumber) === normalizedDataPhone
                ? { ...c, lastMessage: data.content, lastMessageAt: data.timestamp, messageCount: (c.messageCount || 0) + 1 }
                : c
            ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
          } else {
             // New conversation not in list
             return prev;
          }
        });
        break;
        
      case 'conversation_update':
        setConversations(prev => {
            const normalizedDataPhone = normalizePhone(data.phoneNumber);
            return prev.map(c => 
                normalizePhone(c.phoneNumber) === normalizedDataPhone
                ? { ...c, ...data } // Merge updates
                : c
            ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        });
        break;
        
      case 'new_conversation':
        setConversations(prev => {
            const normalizedDataPhone = normalizePhone(data.phoneNumber);
            if (prev.some(c => normalizePhone(c.phoneNumber) === normalizedDataPhone)) return prev;
            return [data, ...prev];
        });
        break;
      default:
        break;
    }
  }, []);

  // Connect SSE
  const connectSSE = useCallback(() => {
    const url = getUrl('/events');
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE Connected');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSSEEvent(data);
      } catch (e) {
        console.error('Error parsing SSE event:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setIsConnected(false);
      eventSource.close();
      
      // Reconnect strategy
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
             // Simple reconnect retry logic could go here, but usually controlled by useEffect
        }
      }, 5000);
    };
  }, [handleSSEEvent]);

  // Initial load and SSE connection
  useEffect(() => {
    loadConversations();
    connectSSE();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [loadConversations, connectSSE]);

  const openChat = async (phoneNumber) => {
    try {
      // Optimistically set current chat if we have basic info
      const basicInfo = conversations.find(c => normalizePhone(c.phoneNumber) === normalizePhone(phoneNumber));
      if (basicInfo) {
          setCurrentChat(basicInfo); 
          setMessages([]); 
      }

      const response = await fetch(getUrl(`/conversations/${phoneNumber}`));
      const data = await response.json();
      
      if (data.success) {
        setCurrentChat(data.data);
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const sendMessage = async (phoneNumber, messageText) => {
    // Optimistic update
    const tempId = 'temp_' + Date.now();
    const optimisticMessage = {
        id: tempId,
        type: 'sent',
        content: messageText,
        timestamp: new Date().toISOString(),
        status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMessage]);

    // Update last message in conversation list optimistically
    setConversations(prev => prev.map(c => 
        normalizePhone(c.phoneNumber) === normalizePhone(phoneNumber)
        ? { ...c, lastMessage: messageText, lastMessageAt: new Date().toISOString() }
        : c
    ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)));

    try {
      const response = await fetch(getUrl('/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          body: messageText
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
          return true;
      } else {
          // Remove optimistic message on failure
          setMessages(prev => prev.filter(m => m.id !== tempId));
          return false;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      return false;
    }
  };

  const assignAgent = async (phoneNumber, agentId) => {
    try {
      const response = await fetch(getUrl(`/conversations/${phoneNumber}/agent`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId
        })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error assigning agent:', error);
      return false;
    }
  };

  return {
    conversations,
    currentChat,
    messages,
    isConnected,
    openChat,
    sendMessage,
    assignAgent,
    loadConversations,
    loading
  };
}

// Helper components
const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
      isOwn 
        ? 'bg-blue-600 text-white rounded-br-none' 
        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600'
    }`}>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      <div className={`text-[10px] mt-1 flex items-center justify-end ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
        <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {isOwn && (
          <span className="ml-1">
            <CheckCheck className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  </div>
);

const ChatListItem = ({ conversation, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-800 ${
      isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600 dark:border-l-blue-500' : 'border-l-4 border-l-transparent'
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 font-semibold">
          {conversation.clientName ? conversation.clientName.charAt(0).toUpperCase() : <User size={20} />}
        </div>
        {/* Online status indicator placeholder */}
        {/* <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span> */}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {conversation.clientName || conversation.phoneNumber}
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
            {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString() : ''}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {conversation.lastMessage || 'No hay mensajes'}
        </p>
      </div>
    </div>
  </div>
);

export const Chats = () => {
  const {
    conversations,
    currentChat,
    messages,
    isConnected,
    openChat,
    sendMessage,
    assignAgent,
    loading
  } = useWhatsAppChat();

  const [inputText, setInputText] = useState('');
  const [isAgentActive, setIsAgentActive] = useState(false); // Agent toggle state
  const [searchTerm, setSearchTerm] = useState('');
  const [whatsappAgents, setWhatsappAgents] = useState([]);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load available WhatsApp agents
  useEffect(() => {
    const fetchAgents = async () => {
        try {
            const token = authService.getToken();
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const baseUrl = process.env.REACT_APP_WHATSAPP_API_URL || config.getApiUrl('/api/whatsapp');
            const response = await fetch(`${baseUrl}/agents`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setWhatsappAgents(data.data || []);
            } else {
                console.error('Error loading agents:', data.message);
            }
        } catch (error) {
            console.error('Error loading agents:', error);
        }
    };
    fetchAgents();
  }, []);

  // Update local state when chat changes
  useEffect(() => {
    if (currentChat) {
        setIsAgentActive(!!currentChat.agentId); // Assume backend returns agentId if assigned
    }
  }, [currentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentChat) return;

    const msgToSend = inputText;
    setInputText(''); 
    
    await sendMessage(currentChat.phoneNumber, msgToSend);
  };

  const handleCall = () => {
    if (currentChat) {
      console.log(`Calling ${currentChat.phoneNumber}...`);
      alert(`Iniciando llamada a ${currentChat.clientName || currentChat.phoneNumber}`);
    }
  };

  const toggleAgent = async () => {
      if (isAgentActive) {
          // If active, deactivate (unassign)
          const success = await assignAgent(currentChat.phoneNumber, null); // Assuming null unassigns
          if (success) setIsAgentActive(false);
      } else {
          // If inactive, show selector to choose agent
          setShowAgentSelector(!showAgentSelector);
      }
  };

  const handleAgentSelect = async (agentId) => {
      const success = await assignAgent(currentChat.phoneNumber, agentId);
      if (success) {
          setIsAgentActive(true);
          setShowAgentSelector(false);
      }
  };

  const filteredConversations = conversations.filter(c => 
    c.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Conectado' : 'Desconectado'} />
            </div>
            <div className="relative">
                <input
                type="text"
                placeholder="Buscar chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Cargando chats...</div>
          ) : (
            filteredConversations.map(conv => (
              <ChatListItem
                key={conv.id || conv.phoneNumber}
                conversation={conv}
                isActive={currentChat?.phoneNumber === conv.phoneNumber}
                onClick={() => openChat(conv.phoneNumber)}
              />
            ))
          )}
          {!loading && filteredConversations.length === 0 && (
             <div className="p-4 text-center text-gray-500">No se encontraron conversaciones</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {currentChat ? (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 relative">
          {/* Chat Header */}
          <div className="h-16 px-6 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                {currentChat.clientName ? currentChat.clientName.charAt(0).toUpperCase() : <User />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {currentChat.clientName || currentChat.phoneNumber}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentChat.phoneNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
               {/* Agent Toggle */}
               <div className="relative">
                   <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5">
                        <span className={`text-sm font-medium ${isAgentActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            Agente {isAgentActive ? 'Activo' : 'Inactivo'}
                        </span>
                        <button 
                            onClick={toggleAgent}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isAgentActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                isAgentActive ? 'translate-x-4.5' : 'translate-x-1'
                            }`} style={{ transform: isAgentActive ? 'translateX(1.1rem)' : 'translateX(0.1rem)'}} />
                        </button>
                        {isAgentActive ? <Bot size={16} className="text-blue-600" /> : <User size={16} className="text-gray-500" />}
                   </div>
                   
                   {/* Agent Selector Dropdown */}
                   {showAgentSelector && (
                       <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                           <div className="p-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-gray-700">
                               Seleccionar Agente
                           </div>
                           <div className="max-h-48 overflow-y-auto">
                               {whatsappAgents.length > 0 ? (
                                   whatsappAgents.map(agent => (
                                       <button
                                           key={agent.id}
                                           onClick={() => handleAgentSelect(agent.id)}
                                           className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between"
                                       >
                                           <span className="font-medium text-gray-900 dark:text-white">{agent.name}</span>
                                           {currentChat.agentId === agent.id && <Check size={14} className="text-blue-600" />}
                                       </button>
                                   ))
                               ) : (
                                   <div className="p-4 text-center text-gray-500 text-sm">No hay agentes disponibles</div>
                               )}
                           </div>
                       </div>
                   )}
               </div>

              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

              <button 
                onClick={handleCall}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                title="Llamar"
              >
                <Phone size={20} />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: 'url("/whatsapp-bg.png")', backgroundRepeat: 'repeat', backgroundBlendMode: 'overlay' }}>
            <div className="flex justify-center my-4">
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs py-1 px-3 rounded-full">
                    {new Date(currentChat.createdAt || Date.now()).toLocaleDateString()}
                </span>
            </div>
            
            {messages.map((msg, idx) => (
              <MessageBubble 
                key={msg.id || idx} 
                message={msg} 
                isOwn={msg.type === 'sent'} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full">
                    <Smile size={24} />
                </button>
                <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full">
                    <Paperclip size={24} />
                </button>
                
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {inputText.trim() ? (
                <button
                    type="submit"
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                >
                    <Send size={20} />
                </button>
              ) : (
                <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full">
                    <Mic size={24} />
                </button>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-semibold mb-2">WhatsApp Web</h3>
          <p>Selecciona una conversación para comenzar a chatear</p>
        </div>
      )}
    </div>
  );
};
