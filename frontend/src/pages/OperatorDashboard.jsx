import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/client';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineUser,
  HiPaperAirplane,
  HiOutlineClock,
} from 'react-icons/hi2';

function formatTime(iso) {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  return isToday
    ? d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function OperatorDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/support/conversations');
      setConversations(data);
    } catch {
      toast.error('Не удалось загрузить чаты');
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const openConversation = async (userId) => {
    setSelectedUserId(userId);
    setMessages([]);
    try {
      const { data } = await api.get(`/support/conversations/${userId}`);
      setMessages(data);
      // mark as read locally
      setConversations((prev) =>
        prev.map((c) => (c.user_id === userId ? { ...c, unread_count: 0 } : c))
      );
    } catch {
      toast.error('Не удалось загрузить сообщения');
    }
  };

  // Poll active conversation
  useEffect(() => {
    if (!selectedUserId) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/support/conversations/${selectedUserId}`);
        setMessages(data);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || sending || !selectedUserId) return;
    setSending(true);
    try {
      const { data } = await api.post(`/support/conversations/${selectedUserId}`, {
        content: trimmed,
      });
      setMessages((prev) => [...prev, data]);
      setReplyText('');
    } catch {
      toast.error('Не удалось отправить ответ');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ') e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const selectedConv = conversations.find((c) => c.user_id === selectedUserId);

  return (
    <PageTransition className="space-y-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl sm:text-4xl font-extrabold text-gray-900"
        >
          Поддержка
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mt-1"
        >
          Обращения пользователей
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4" style={{ minHeight: '560px' }}>
        {/* Conversation list */}
        <GlassCard className="p-0 overflow-hidden flex flex-col" delay={0.1}>
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <HiOutlineChatBubbleLeftRight className="w-4 h-4 text-emerald-500" />
              Диалоги
              {conversations.filter((c) => c.unread_count > 0).length > 0 && (
                <span className="ml-auto bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {conversations.filter((c) => c.unread_count > 0).length}
                </span>
              )}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {conversations.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-gray-400">Пока нет обращений</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <motion.button
                  key={conv.user_id}
                  whileHover={{ backgroundColor: 'rgba(16,185,129,0.04)' }}
                  onClick={() => openConversation(conv.user_id)}
                  className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                    selectedUserId === conv.user_id ? 'bg-emerald-50 border-l-2 border-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <HiOutlineUser className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800 truncate">{conv.user_name}</p>
                        {conv.unread_count > 0 && (
                          <span className="bg-emerald-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <HiOutlineClock className="w-3 h-3" />
                        {formatTime(conv.last_at)}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </GlassCard>

        {/* Chat panel */}
        <GlassCard className="lg:col-span-2 p-0 overflow-hidden flex flex-col" delay={0.15}>
          <AnimatePresence mode="wait">
            {!selectedUserId ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center text-center p-8"
              >
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                    <HiOutlineChatBubbleLeftRight className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-gray-400 text-sm">Выберите диалог слева</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={selectedUserId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                {/* Chat header */}
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <HiOutlineUser className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{selectedConv?.user_name}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 bg-gray-50/40" style={{ minHeight: '340px' }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_from_operator ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                          msg.is_from_operator
                            ? 'bg-emerald-500 text-white rounded-tr-sm'
                            : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
                        }`}
                      >
                        <p className="leading-snug break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.is_from_operator ? 'text-emerald-100' : 'text-gray-400'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Reply input */}
                <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-end gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ответить..."
                    rows={1}
                    className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors bg-gray-50"
                    style={{ maxHeight: '80px', overflowY: 'auto' }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleReply}
                    disabled={!replyText.trim() || sending}
                    className="w-9 h-9 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <HiPaperAirplane className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
