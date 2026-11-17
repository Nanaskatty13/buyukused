// frontend/src/pages/Messages.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messages } from '../services/messages';
import { API_URL } from '../services/api';

// ══════════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════════
const getId = (val) => (typeof val === 'string' ? val : val?._id || '');
const getSenderId = (m) => getId(m.sender);
const getReceiverId = (m) => getId(m.receiver);
const getMessageText = (m) => m.message || m.content || m.text || '';
const isRead = (m) => Boolean(m.read || m.isRead || m.readAt);

const dedupeById = (arr) => {
  if (!Array.isArray(arr)) return [];
  const map = new Map();
  for (const m of arr) {
    if (!m) continue;
    const id = m._id || m.id;
    if (!id) {
      map.set(`__noid__${Math.random()}`, m);
      continue;
    }
    if (!map.has(id)) {
      map.set(id, m);
    } else if (!isRead(map.get(id)) && isRead(m)) {
      map.set(id, m);
    }
  }
  return Array.from(map.values());
};

const getAttachmentType = (text) => {
  if (!text) return null;
  if (/^📷 Image:/.test(text)) return 'image';
  if (/^🎥 Video:/.test(text)) return 'video';
  if (/^📇 Contact:/.test(text)) return 'contact';
  if (/^📎 File:/.test(text)) return 'file';
  return null;
};
const extractAttachmentUrl = (text) => {
  const m = text?.match(/^(?:📷 Image|🎥 Video|📎 File|📇 Contact):\s*(.+)/);
  return m ? m[1].trim() : null;
};

const sameDay = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a), db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

const formatDateDivider = (str) => {
  if (!str) return '';
  const d = new Date(str);
  const now = new Date();
  const yst = new Date(now); yst.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return 'Today';
  if (sameDay(d, yst)) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const formatTime = (str) => {
  if (!str) return '';
  return new Date(str).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const formatLastSeen = (str) => {
  if (!str) return '';
  const d = new Date(str);
  const now = new Date();
  const diffMin = Math.floor((now - d) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

const computeOnlineStatus = (partner) => {
  if (!partner) return false;
  if (partner.lastActive) {
    const diff = Date.now() - new Date(partner.lastActive).getTime();
    return diff < 2 * 60 * 1000;
  }
  if (partner.online === true) return true;
  return false;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
};

const EMOJIS = [
  '😀','😂','🥰','😍','😎','🤔','😅','😭','😡','👍','👎','🙏','👏','💪',
  '🔥','❤️','💔','✨','🎉','🎂','☕','🍕','⚽','🚗','📱','💻','👀','🙌','✌️','👋',
];

// ══════════════════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════════════════
const Avatar = ({ name, size = 40, src, isOnline = null }) => (
  <div style={{ position: 'relative', flexShrink: 0 }}>
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(37,211,102,0.9) 0%, rgba(18,140,126,0.85) 100%)',
        backdropFilter: 'blur(10px) saturate(180%)',
        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.35)',
        color: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(37,211,102,0.25)',
      }}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        getInitials(name)
      )}
    </div>
    {isOnline !== null && (
      <span
        aria-label={isOnline ? 'Online' : 'Offline'}
        title={isOnline ? 'Online' : 'Offline'}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: Math.max(10, size * 0.28),
          height: Math.max(10, size * 0.28),
          borderRadius: '50%',
          background: isOnline ? '#25d366' : '#8696a0',
          border: '2px solid rgba(255,255,255,0.95)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
          transition: 'background 0.25s',
        }}
      />
    )}
  </div>
);

const Ticks = ({ read }) => (
  <i
    className="fas fa-check-double"
    style={{
      color: read ? '#53bdeb' : '#8696a0',
      fontSize: 11, marginLeft: 4,
      display: 'inline-block', verticalAlign: 'middle',
    }}
  />
);

const TypingIndicator = () => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      color: '#25d366',
      fontWeight: 600,
      fontStyle: 'italic',
    }}
  >
    <span style={{ display: 'inline-flex', gap: 2, marginRight: 2 }}>
      <span className="wa-typing-dot" />
      <span className="wa-typing-dot" style={{ animationDelay: '0.15s' }} />
      <span className="wa-typing-dot" style={{ animationDelay: '0.3s' }} />
    </span>
    typing…
  </span>
);

const MessageBubble = ({ msg, isMine, isConsecutive, showTail, onImageClick }) => {
  const text = getMessageText(msg);
  const type = getAttachmentType(text);
  const url = extractAttachmentUrl(text);

  return (
    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
      <div
        className="wa-bubble"
        style={{
          padding: '6px 8px 4px 10px',
          fontSize: 14,
          lineHeight: 1.35,
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)',
          background: isMine
            ? 'linear-gradient(135deg, rgba(220,248,198,0.95) 0%, rgba(207,241,180,0.92) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,249,252,0.92) 100%)',
          backdropFilter: 'blur(8px) saturate(180%)',
          WebkitBackdropFilter: 'blur(8px) saturate(180%)',
          color: '#111b21',
          marginTop: isConsecutive ? 2 : 8,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderBottomLeftRadius: isMine ? 8 : showTail ? 2 : 8,
          borderBottomRightRadius: isMine ? (showTail ? 2 : 8) : 8,
          border: '1px solid rgba(255,255,255,0.5)',
          overflow: 'hidden',
        }}
      >
        {type === 'image' && url && (
          <img
            src={url}
            alt="attachment"
            loading="lazy"
            onClick={() => onImageClick(url)}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            style={{ maxWidth: '100%', maxHeight: 320, height: 'auto', borderRadius: 6, display: 'block', cursor: 'pointer', marginBottom: 4 }}
          />
        )}
        {type === 'video' && url && (
          <video src={url} controls style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 6, display: 'block', marginBottom: 4 }} />
        )}
        {type === 'contact' && url && (
          <a href={url} download style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111b21', textDecoration: 'none', padding: '4px 0', marginBottom: 4 }}>
            <i className="fas fa-address-card" style={{ fontSize: 24, color: '#25d366' }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Contact card</span>
          </a>
        )}
        {type === 'file' && url && (
          <a href={url} target="_blank" rel="noopener noreferrer" download style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111b21', textDecoration: 'none', padding: '4px 0', marginBottom: 4 }}>
            <i className="fas fa-file" style={{ fontSize: 22, color: '#25d366' }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Attachment</span>
          </a>
        )}
        {!type && <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 10.5, color: '#667781', marginTop: 2, marginLeft: 12 }}>
          <span>{formatTime(msg.createdAt)}</span>
          {isMine && <Ticks read={isRead(msg)} />}
        </div>
      </div>
    </div>
  );
};

const DateDivider = ({ date }) => (
  <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}>
    <span
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)',
        backdropFilter: 'blur(10px) saturate(180%)',
        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.75)',
        padding: '5px 12px',
        borderRadius: 8,
        fontSize: 11.5,
        fontWeight: 600,
        color: '#667781',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 0.5px rgba(11,20,26,0.13)',
      }}
    >
      {formatDateDivider(date)}
    </span>
  </div>
);

// ══════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════
const MessagesPage = () => {
  const { user, token } = useAuth();

  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachMenuPos, setAttachMenuPos] = useState(null);
  const [emojiPickerPos, setEmojiPickerPos] = useState(null);

  const [partnerTyping, setPartnerTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);
  const attachBtnRef = useRef(null);
  const emojiBtnRef = useRef(null);
  const attachMenuRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const selectedConvRef = useRef(null);
  const lastTypingSentRef = useRef(0);
  const typingStopTimerRef = useRef(null);
  const typingClearTimerRef = useRef(null);

  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  // ─── Auto-grow the typing box ────────────────────────────────
  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    resizeInput();
  }, [replyMessage, selectedConversation?.partnerId]);

  // ─── Cleanup typing timers on unmount ────────────────────────
  useEffect(() => {
    return () => {
      if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
      if (typingClearTimerRef.current) clearTimeout(typingClearTimerRef.current);
    };
  }, []);

  // ─── Initial fetch ───────────────────────────────────────────
  useEffect(() => {
    if (!user || !token) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await messages.getForUser(user._id, token);
        const list = Array.isArray(data) ? data : data?.messages || data?.data || [];
        if (!cancelled) setMessagesList(dedupeById(list));
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, token]);

  // ─── Single poller for inbox + open thread + typing state ────
  useEffect(() => {
    if (!user || !token) return;
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/messages/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && Array.isArray(data.messages)) {
          setMessagesList(dedupeById(data.messages));
        }

        if (selectedConvRef.current) {
          const currentPartnerId = selectedConvRef.current.partnerId;
          const typing = data.typing;

          if (typing && typing.partnerId === currentPartnerId) {
            if (typing.isTyping) {
              setPartnerTyping(true);
              if (typingClearTimerRef.current) clearTimeout(typingClearTimerRef.current);
              typingClearTimerRef.current = setTimeout(() => setPartnerTyping(false), 5000);
            } else {
              setPartnerTyping(false);
              if (typingClearTimerRef.current) {
                clearTimeout(typingClearTimerRef.current);
                typingClearTimerRef.current = null;
              }
            }
          }
        }
      } catch { /* silent */ }
    };
    pollRef.current = setInterval(poll, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user, token]);

  // ─── Conversations (derived) ─────────────────────────────────
  const conversations = useMemo(() => {
    if (!user) return [];
    const byPartner = new Map();
    messagesList.forEach((msg) => {
      const s = getSenderId(msg);
      const r = getReceiverId(msg);
      let partnerId = null, partnerObj = null;
      if (s === user._id) { partnerId = r; partnerObj = typeof msg.receiver === 'object' ? msg.receiver : null; }
      else if (r === user._id) { partnerId = s; partnerObj = typeof msg.sender === 'object' ? msg.sender : null; }
      if (!partnerId) return;
      if (!byPartner.has(partnerId)) byPartner.set(partnerId, { partnerId, partnerObj: null, msgs: [] });
      const c = byPartner.get(partnerId);
      c.msgs.push(msg);
      if (partnerObj && !c.partnerObj) c.partnerObj = partnerObj;
    });
    return Array.from(byPartner.values())
      .map((c) => {
        const sorted = [...c.msgs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const last = sorted[0];
        const unread = c.msgs.filter((m) => getReceiverId(m) === user._id && !isRead(m)).length;
        return { partnerId: c.partnerId, partner: c.partnerObj, last, unread };
      })
      .sort((a, b) => new Date(b.last?.createdAt || 0) - new Date(a.last?.createdAt || 0));
  }, [messagesList, user]);

  // ─── Reactive partner ────────────────────────────────────────
  const activePartner = useMemo(() => {
    if (!selectedConversation) return null;
    const conv = conversations.find((c) => c.partnerId === selectedConversation.partnerId);
    return conv?.partner || selectedConversation.partner || null;
  }, [conversations, selectedConversation]);

  const partnerOnline = computeOnlineStatus(activePartner);

  // ─── Messages of selected thread (derived, deduped) ──────────
  const conversationMessages = useMemo(() => {
    if (!selectedConversation || !user) return [];
    const otherId = selectedConversation.partnerId;
    return dedupeById(messagesList)
      .filter((msg) => {
        const s = getSenderId(msg);
        const r = getReceiverId(msg);
        return (s === otherId || r === otherId) && (s === user._id || r === user._id);
      })
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [messagesList, selectedConversation, user]);

  // ─── Auto-scroll ─────────────────────────────────────────────
  useEffect(() => {
    if (selectedConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [selectedConversation?.partnerId]);

  useEffect(() => {
    if (selectedConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages.length]);

  // ─── Outside click closes popups ─────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        showAttachMenu &&
        attachMenuRef.current && !attachMenuRef.current.contains(e.target) &&
        attachBtnRef.current && !attachBtnRef.current.contains(e.target)
      ) setShowAttachMenu(false);
      if (
        showEmojiPicker &&
        emojiPickerRef.current && !emojiPickerRef.current.contains(e.target) &&
        emojiBtnRef.current && !emojiBtnRef.current.contains(e.target)
      ) setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAttachMenu, showEmojiPicker]);

  // ─── Mark-as-read for open thread ────────────────────────────
  useEffect(() => {
    if (!selectedConversation || !user || !token) return;
    const unread = conversationMessages.filter((m) => getReceiverId(m) === user._id && !isRead(m));
    if (unread.length === 0) return;
    (async () => {
      for (const msg of unread) {
        try {
          await messages.markRead(msg._id, token);
          setMessagesList((prev) => prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m)));
        } catch (err) { console.error('markRead failed:', err); }
      }
    })();
  }, [selectedConversation?.partnerId, conversationMessages.length, user, token]);

  // ─── Popup open helpers ──────────────────────────────────────
  const toggleAttachMenu = () => {
    if (showAttachMenu) { setShowAttachMenu(false); return; }
    if (attachBtnRef.current) {
      const rect = attachBtnRef.current.getBoundingClientRect();
      setAttachMenuPos({
        bottom: window.innerHeight - rect.top + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    setShowEmojiPicker(false);
    setShowAttachMenu(true);
  };
  const toggleEmojiPicker = () => {
    if (showEmojiPicker) { setShowEmojiPicker(false); return; }
    if (emojiBtnRef.current) {
      const rect = emojiBtnRef.current.getBoundingClientRect();
      setEmojiPickerPos({
        bottom: window.innerHeight - rect.top + 8,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 340)),
      });
    }
    setShowAttachMenu(false);
    setShowEmojiPicker(true);
  };

  // ─── Typing notification helper ──────────────────────────────
  const sendTypingPing = async (isTyping, partnerIdOverride = null) => {
    const partnerId = partnerIdOverride || selectedConversation?.partnerId;
    if (!partnerId || !token) return;
    try {
      await fetch(`${API_URL}/api/messages/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiver: partnerId, isTyping }),
      });
    } catch { /* silent — endpoint optional */ }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setReplyMessage(val);

    if (!selectedConversation) return;

    if (!val.trim()) {
      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
      if (lastTypingSentRef.current > 0) {
        sendTypingPing(false);
        lastTypingSentRef.current = 0;
      }
      return;
    }

    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      sendTypingPing(true);
      lastTypingSentRef.current = now;
    }

    if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
    typingStopTimerRef.current = setTimeout(() => {
      sendTypingPing(false);
      lastTypingSentRef.current = 0;
      typingStopTimerRef.current = null;
    }, 3000);
  };

  // ─── Send helpers ────────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || !selectedConversation || !token) return false;
    setSendingReply(true);
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          receiver: selectedConversation.partnerId,
          message: text.trim(),
          productId: null,
        }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      const newMsg = data.message || data.data || data;
      if (!newMsg?._id) throw new Error('Invalid response');
      if (!newMsg.createdAt) newMsg.createdAt = new Date().toISOString();

      setMessagesList((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
      return true;
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to send message.');
      return false;
    } finally {
      setSendingReply(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    const text = replyMessage;
    if (!text.trim()) return;
    const ok = await sendMessage(text);
    if (ok) {
      setReplyMessage('');
      inputRef.current?.focus();
      if (inputRef.current) inputRef.current.style.height = 'auto';

      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
      if (lastTypingSentRef.current > 0) {
        sendTypingPing(false);
        lastTypingSentRef.current = 0;
      }
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const isTouch =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(pointer: coarse)').matches;
      if (!isTouch) {
        e.preventDefault();
        handleSendReply(e);
      }
    }
  };

  const handleFileAttachment = async (file) => {
    if (!file || !selectedConversation || !token) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('File too large. Maximum 25MB.');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const up = await uploadRes.json();
      const url = up.url || up.secure_url;
      if (!url) throw new Error('No URL returned');

      let label = '📎 File';
      if (file.type.startsWith('image/')) label = '📷 Image';
      else if (file.type.startsWith('video/')) label = '🎥 Video';
      else if (file.type === 'text/vcard' || file.name?.endsWith('.vcf')) label = '📇 Contact';

      await sendMessage(`${label}: ${url}`);
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.message || 'Failed to send file.');
    } finally {
      setUploading(false);
    }
  };

  const openConversation = (conv) => {
    setPartnerTyping(false);
    if (typingClearTimerRef.current) {
      clearTimeout(typingClearTimerRef.current);
      typingClearTimerRef.current = null;
    }
    setSelectedConversation({ partnerId: conv.partnerId, partner: conv.partner });
    setShowAttachMenu(false);
    setShowEmojiPicker(false);
  };

  const closeConversation = () => {
    const closingPartnerId = selectedConversation?.partnerId;
    if (lastTypingSentRef.current > 0 && closingPartnerId) {
      sendTypingPing(false, closingPartnerId);
      lastTypingSentRef.current = 0;
    }
    if (typingStopTimerRef.current) {
      clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
    if (typingClearTimerRef.current) {
      clearTimeout(typingClearTimerRef.current);
      typingClearTimerRef.current = null;
    }
    setPartnerTyping(false);
    setSelectedConversation(null);
    setShowAttachMenu(false);
    setShowEmojiPicker(false);
  };

  // ─── Not logged in ───────────────────────────────────────────
  if (!user) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        Please login to view your messages.
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════════
           LIQUID iOS27 — PAGE + OUTER WRAPPER
           ═══════════════════════════════════════════════════ */
        @keyframes liquid-msg-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33%      { transform: translate3d(-30px, 24px, 0) scale(1.06); }
          66%      { transform: translate3d(24px, -20px, 0) scale(0.97); }
        }

        .container.wa-page {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          padding: 16px 12px;
          max-width: 100%;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            #eef4ff 0%,
            #f5f0ff 40%,
            #eaf7ff 70%,
            #f2f8ff 100%
          );
        }

        .container.wa-page::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(circle at 8% 15%, rgba(0,102,204,0.22) 0%, rgba(0,102,204,0.08) 25%, transparent 55%),
            radial-gradient(circle at 92% 60%, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 25%, transparent 55%),
            radial-gradient(circle at 50% 115%, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.06) 25%, transparent 55%),
            radial-gradient(circle at 30% 80%, rgba(59,130,246,0.12) 0%, transparent 50%);
          animation: liquid-msg-float 24s ease-in-out infinite;
          will-change: transform;
        }

        /* ─── Main container — liquid glass ─────────────── */
        .wa-container {
          height: calc(100vh - 130px);
          min-height: 500px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.72) 0%,
            rgba(238,246,255,0.42) 50%,
            rgba(255,255,255,0.62) 100%
          );
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow:
            0 14px 44px rgba(31,38,135,0.15),
            inset 0 1px 0 rgba(255,255,255,0.95),
            inset 0 -1px 0 rgba(255,255,255,0.25);
        }

        /* ─── Header (chat + inbox) — liquid glass ─────── */
        .wa-header {
          flex-shrink: 0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.7) 0%,
            rgba(238,246,255,0.4) 100%
          );
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.55);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
        }

        /* ─── Messages area — soft WhatsApp paper bg ────── */
        .wa-messages {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
          padding: 16px 6% 12px;
          background-color: rgba(239,234,226,0.55);
          background-image:
            radial-gradient(circle at 20px 20px, rgba(0,0,0,0.025) 1px, transparent 1.5px),
            radial-gradient(circle at 60px 60px, rgba(0,0,0,0.02) 1px, transparent 1.5px);
          background-size: 40px 40px, 40px 40px;
          overscroll-behavior: contain;
        }
        .wa-messages::-webkit-scrollbar { width: 6px; }
        .wa-messages::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 3px;
        }

        /* ─── Conversation item — liquid glass card ─────── */
        .wa-conv-item {
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .wa-conv-item:hover {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.65) 0%,
            rgba(238,246,255,0.4) 100%
          ) !important;
          transform: translateY(-1px);
        }
        .wa-conv-item:active {
          transform: translateY(0) scale(0.995);
        }

        /* ─── Icon buttons — liquid glass circles ───────── */
        .wa-icon-btn {
          position: relative;
          border: 1px solid rgba(255,255,255,0.65);
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #374151;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.68) 0%,
            rgba(255,255,255,0.32) 100%
          );
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 2px 10px rgba(31,38,135,0.08);
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
          flex-shrink: 0;
        }
        .wa-icon-btn:hover:not(:disabled) {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.85) 0%,
            rgba(239,246,255,0.5) 100%
          );
          border-color: rgba(255,255,255,0.95);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,1),
            0 4px 14px rgba(31,38,135,0.14);
          transform: translateY(-1px);
        }
        .wa-icon-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.95);
        }
        .wa-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ─── Emoji picker button — liquid glass ────────── */
        .wa-emoji {
          font-size: 22px;
          border: 1px solid transparent;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .wa-emoji:hover {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.7) 0%,
            rgba(255,255,255,0.35) 100%
          );
          border-color: rgba(255,255,255,0.75);
        }

        /* ─── Input — liquid glass ──────────────────────── */
        .wa-input {
          flex: 1;
          min-width: 0;
          border: 1px solid rgba(255,255,255,0.75);
          outline: none;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.72) 0%,
            rgba(255,255,255,0.38) 100%
          );
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          padding: 10px 14px;
          border-radius: 20px;
          font-size: 14.5px;
          color: #111b21;
          font-family: inherit;
          line-height: 20px;
          resize: none;
          min-height: 40px;
          max-height: 120px;
          overflow-y: auto;
          box-sizing: border-box;
          -webkit-appearance: none;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 2px 10px rgba(31,38,135,0.06);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .wa-input:focus {
          border-color: rgba(37,211,102,0.6);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,1),
            0 0 0 3px rgba(37,211,102,0.14),
            0 4px 14px rgba(31,38,135,0.10);
        }
        .wa-input::placeholder { color: #8696a0; }
        .wa-input::-webkit-scrollbar { width: 6px; }
        .wa-input::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 3px;
        }

        /* ─── Popups — liquid glass ─────────────────────── */
        .wa-popup {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.82) 0%,
            rgba(238,246,255,0.55) 100%
          );
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 14px;
          box-shadow:
            0 14px 44px rgba(31,38,135,0.20),
            inset 0 1px 0 rgba(255,255,255,0.95),
            inset 0 -1px 0 rgba(255,255,255,0.25);
          z-index: 9999;
          position: fixed;
        }

        /* ─── Menu items — liquid glass rows ────────────── */
        .wa-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          color: #111b21;
          transition: background 0.15s ease, border-color 0.15s ease;
          border: 1px solid transparent;
        }
        .wa-menu-item:hover {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.75) 0%,
            rgba(238,246,255,0.5) 100%
          );
          border-color: rgba(255,255,255,0.85);
        }
        .wa-menu-item i { width: 20px; text-align: center; }

        /* ─── Composer — liquid glass ──────────────────── */
        .wa-composer {
          flex-shrink: 0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.6) 0%,
            rgba(238,246,255,0.35) 100%
          );
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border-top: 1px solid rgba(255,255,255,0.6);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
          padding: 10px 12px;
          display: flex;
          align-items: flex-end;
          gap: 6px;
        }

        .wa-bubble {
          max-width: 75%;
        }

        .wa-emoji-picker {
          display: grid;
          grid-template-columns: repeat(8, 36px);
          gap: 2px;
        }

        /* ─── Send button — liquid green glass ──────────── */
        .wa-send-btn {
          background: linear-gradient(
            135deg,
            rgba(37,211,102,0.94) 0%,
            rgba(18,140,126,0.88) 100%
          ) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.4) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 4px 14px rgba(37,211,102,0.35) !important;
        }
        .wa-send-btn:hover:not(:disabled) {
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.45),
            0 8px 24px rgba(37,211,102,0.45) !important;
        }

        /* ─── Chat header profile link ──────────────────── */
        .wa-header-link {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .wa-header-link:hover {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.5) 0%,
            rgba(238,246,255,0.35) 100%
          ) !important;
        }
        .wa-header-link:active {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.7) 0%,
            rgba(238,246,255,0.5) 100%
          ) !important;
        }
        .wa-header-link:focus-visible {
          outline: 2px solid rgba(37,211,102,0.75);
          outline-offset: 2px;
        }

        /* ─── Typing indicator dots ─────────────────────── */
        .wa-typing-dot {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #25d366;
          animation: wa-typing-bounce 1.2s infinite ease-in-out;
        }
        @keyframes wa-typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%           { transform: translateY(-4px); opacity: 1; }
        }

        /* ═══════════════════════════════════════════════════
           LARGE DESKTOP (≥ 1400px)
           ═══════════════════════════════════════════════════ */
        @media (min-width: 1400px) {
          .wa-container { max-width: 1300px; height: calc(100vh - 150px); }
          .wa-messages { padding: 20px 8% 16px; }
          .wa-bubble { max-width: 70%; }
          .wa-input { max-height: 140px; }
        }

        /* ═══════════════════════════════════════════════════
           TABLET (769px – 1024px)
           ═══════════════════════════════════════════════════ */
        @media (max-width: 1024px) and (min-width: 769px) {
          .container.wa-page { padding: 12px 10px; }
          .wa-container { height: calc(100vh - 110px); max-width: 100%; border-radius: 16px; }
          .wa-messages { padding: 14px 4% 10px; }
          .wa-icon-btn { width: 42px; height: 42px; }
          .wa-bubble { max-width: 78%; }
          .wa-input { max-height: 110px; }
        }

        /* ═══════════════════════════════════════════════════
           SMALL TABLET / IPAD MINI PORTRAIT (≤ 768px)
           ═══════════════════════════════════════════════════ */
        @media (max-width: 768px) and (min-width: 601px) {
          .container.wa-page { padding: 10px 8px; }
          .wa-container { height: calc(100vh - 100px); border-radius: 16px; }
          .wa-messages { padding: 12px 12px 8px; }
          .wa-composer { padding: 8px 10px; gap: 4px; }
          .wa-bubble { max-width: 80%; }
          .wa-icon-btn { width: 42px; height: 42px; }
          .wa-input { max-height: 110px; }
        }

        /* ═══════════════════════════════════════════════════
           PHONE (≤ 600px)
           ═══════════════════════════════════════════════════ */
        @media (max-width: 600px) {
          .container.wa-page { padding: 0; max-width: 100%; border-radius: 0; }
          .wa-container {
            height: calc(100vh - 100px);
            height: calc(100dvh - 100px - env(safe-area-inset-bottom, 0px));
            min-height: 0; max-width: 100%; margin: 0;
            border-radius: 0; border: none; box-shadow: none;
            backdrop-filter: blur(10px) saturate(180%);
            -webkit-backdrop-filter: blur(10px) saturate(180%);
          }
          .wa-messages { padding: 10px 8px 6px; }
          .wa-composer { padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px)); gap: 4px; }
          .wa-icon-btn { width: 38px; height: 38px; font-size: 17px; }
          .wa-bubble { max-width: 85%; }
          .wa-input { font-size: 16px; padding: 8px 14px; line-height: 22px; min-height: 38px; max-height: 100px; }

          .wa-emoji-picker {
            left: 50% !important; right: auto !important;
            bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important;
            transform: translateX(-50%);
            width: 340px; max-width: calc(100vw - 16px) !important;
            grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)) !important;
            padding: 10px !important;
            max-height: 260px; overflow-y: auto;
          }
          .wa-emoji-picker .wa-emoji { width: 40px; height: 40px; font-size: 24px; }

          .wa-attach-menu {
            left: 50% !important; right: auto !important;
            bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important;
            transform: translateX(-50%);
            min-width: 220px; padding: 8px !important;
          }
          .wa-menu-item { padding: 12px 18px; font-size: 15px; }
        }

        /* ═══════════════════════════════════════════════════
           TINY PHONE (≤ 380px)
           ═══════════════════════════════════════════════════ */
        @media (max-width: 380px) {
          .wa-messages { padding: 8px 6px 4px; }
          .wa-composer { padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px)); gap: 3px; }
          .wa-icon-btn { width: 34px; height: 34px; font-size: 15px; }
          .wa-input { padding: 8px 12px; line-height: 20px; min-height: 36px; max-height: 90px; }
          .wa-bubble { max-width: 88%; }
          .wa-emoji-picker { width: calc(100vw - 12px) !important; }
        }

        /* ═══════════════════════════════════════════════════
           REDUCED MOTION
           ═══════════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .container.wa-page::before { animation: none !important; }
          .wa-icon-btn,
          .wa-input,
          .wa-menu-item,
          .wa-conv-item,
          .wa-emoji,
          .wa-header-link,
          .wa-send-btn {
            transition: none !important;
          }
          .wa-icon-btn:hover:not(:disabled),
          .wa-conv-item:hover,
          .wa-header-link:hover {
            transform: none !important;
          }
        }
      `}</style>

      <div className="container wa-page">
        <div className="wa-container">
          {selectedConversation ? (
            <>
              {/* ─── Chat Header ─── */}
              <div
                className="wa-header"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 14px',
                }}
              >
                <button
                  className="wa-icon-btn"
                  onClick={closeConversation}
                  aria-label="Back to chats"
                  title="Back to chats"
                >
                  <i className="fas fa-arrow-left" />
                </button>

                {/* Profile link — avatar + name + status all tappable */}
                <Link
                  to={`/seller/${selectedConversation.partnerId}`}
                  className="wa-header-link"
                  aria-label={`View ${activePartner?.name || 'user'}'s profile`}
                  title={`View ${activePartner?.name || 'user'}'s profile`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flex: 1,
                    minWidth: 0,
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '6px 10px',
                    margin: '0 -4px',
                    borderRadius: 12,
                    transition: 'background 0.15s',
                  }}
                >
                  <Avatar
                    name={activePartner?.name || 'User'}
                    size={40}
                    src={activePartner?.profileImage || activePartner?.avatar}
                    isOnline={partnerOnline}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600, fontSize: 15.5, color: '#111b21',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      {activePartner?.name || 'User'}
                    </div>
                    <div style={{ fontSize: 12, color: '#667781', minHeight: 16 }}>
                      {partnerTyping ? (
                        <TypingIndicator />
                      ) : partnerOnline ? (
                        <span style={{ color: '#25d366', fontWeight: 600 }}>online</span>
                      ) : activePartner?.lastActive ? (
                        <span>last seen {formatLastSeen(activePartner.lastActive)}</span>
                      ) : (
                        <span>tap for contact info</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>

              {/* ─── Messages ─── */}
              <div className="wa-messages">
                {conversationMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#667781', fontSize: 13 }}>
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  conversationMessages.map((msg, idx) => {
                    const prev = conversationMessages[idx - 1];
                    const next = conversationMessages[idx + 1];
                    const isMine = getSenderId(msg) === user._id;
                    const showDate = !prev || !sameDay(prev.createdAt, msg.createdAt);
                    const isConsecutive = prev && !showDate && getSenderId(prev) === getSenderId(msg);
                    const isLastInGroup =
                      !next ||
                      !sameDay(next.createdAt, msg.createdAt) ||
                      getSenderId(next) !== getSenderId(msg);
                    return (
                      <React.Fragment key={msg._id || `idx-${idx}`}>
                        {showDate && <DateDivider date={msg.createdAt} />}
                        <MessageBubble
                          msg={msg}
                          isMine={isMine}
                          isConsecutive={!!isConsecutive}
                          showTail={isLastInGroup}
                          onImageClick={setViewingImage}
                        />
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ─── Composer ─── */}
              <div className="wa-composer">
                <button
                  ref={emojiBtnRef}
                  type="button"
                  className="wa-icon-btn"
                  onClick={toggleEmojiPicker}
                  aria-label="Emoji"
                >
                  <i className="far fa-smile" />
                </button>
                <button
                  ref={attachBtnRef}
                  type="button"
                  className="wa-icon-btn"
                  onClick={toggleAttachMenu}
                  aria-label="Attach"
                  disabled={uploading}
                >
                  <i className="fas fa-paperclip" />
                </button>

                <form
                  onSubmit={handleSendReply}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'flex-end',
                    gap: 6, minWidth: 0,
                  }}
                >
                  <textarea
                    ref={inputRef}
                    rows={1}
                    className="wa-input"
                    value={replyMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder={uploading ? 'Uploading…' : 'Type a message'}
                    disabled={uploading}
                    enterKeyHint="send"
                  />
                  <button
                    type="submit"
                    className="wa-icon-btn wa-send-btn"
                    style={{
                      width: 42, height: 42,
                      opacity: sendingReply || uploading || !replyMessage.trim() ? 0.5 : 1,
                    }}
                    disabled={sendingReply || uploading || !replyMessage.trim()}
                    aria-label="Send"
                  >
                    <i className="fas fa-paper-plane" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* ─── Inbox Header ─── */}
              <div className="wa-header" style={{ padding: '14px 18px' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111b21' }}>
                  Chats
                </h2>
              </div>

              {/* ─── Conversation List ─── */}
              <div style={{ flex: 1, overflowY: 'auto', background: 'transparent', minHeight: 0, overscrollBehavior: 'contain' }}>
                {loading ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#667781' }}>
                    Loading chats…
                  </div>
                ) : conversations.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: '#667781' }}>
                    <i className="far fa-comment-dots" style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
                    No conversations yet.
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const convOnline = computeOnlineStatus(conv.partner);
                    return (
                      <div
                        key={conv.partnerId}
                        className="wa-conv-item"
                        onClick={() => openConversation(conv)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px', cursor: 'pointer',
                          borderBottom: '1px solid rgba(255,255,255,0.5)',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 100%)',
                        }}
                      >
                        <Avatar
                          name={conv.partner?.name || 'User'}
                          size={48}
                          src={conv.partner?.profileImage || conv.partner?.avatar}
                          isOnline={convOnline}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                            <span
                              style={{
                                fontWeight: 600, fontSize: 15, color: '#111b21',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}
                            >
                              {conv.partner?.name || 'User'}
                            </span>
                            <span
                              style={{
                                fontSize: 11.5, flexShrink: 0, marginLeft: 8,
                                color: conv.unread > 0 ? '#25d366' : '#667781',
                                fontWeight: conv.unread > 0 ? 600 : 400,
                              }}
                            >
                              {conv.last?.createdAt ? formatTime(conv.last.createdAt) : ''}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span
                              style={{
                                fontSize: 13, color: '#667781',
                                whiteSpace: 'nowrap', overflow: 'hidden',
                                textOverflow: 'ellipsis', flex: 1,
                              }}
                            >
                              {conv.last ? getMessageText(conv.last) : 'No messages'}
                            </span>
                            {conv.unread > 0 && (
                              <span
                                style={{
                                  background: 'linear-gradient(135deg, rgba(37,211,102,0.94) 0%, rgba(18,140,126,0.88) 100%)',
                                  color: '#fff',
                                  fontSize: 11, fontWeight: 700,
                                  minWidth: 20, height: 20, padding: '0 6px',
                                  borderRadius: 10, display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  marginLeft: 8, flexShrink: 0,
                                  border: '1px solid rgba(255,255,255,0.35)',
                                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(37,211,102,0.3)',
                                }}
                              >
                                {conv.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* ─── Attach menu popup ─── */}
        {showAttachMenu && attachMenuPos && (
          <div
            ref={attachMenuRef}
            className="wa-popup wa-attach-menu"
            style={{ bottom: attachMenuPos.bottom, right: attachMenuPos.right, padding: 6 }}
          >
            <label className="wa-menu-item">
              <i className="fas fa-image" style={{ color: '#007bfc' }} />
              Image
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileAttachment(e.target.files[0]);
                  e.target.value = '';
                  setShowAttachMenu(false);
                }}
              />
            </label>
            <label className="wa-menu-item">
              <i className="fas fa-video" style={{ color: '#ff2e74' }} />
              Video
              <input
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileAttachment(e.target.files[0]);
                  e.target.value = '';
                  setShowAttachMenu(false);
                }}
              />
            </label>
            <label className="wa-menu-item">
              <i className="fas fa-address-card" style={{ color: '#7f66ff' }} />
              Contact
              <input
                type="file"
                accept=".vcf,.vcard"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileAttachment(e.target.files[0]);
                  e.target.value = '';
                  setShowAttachMenu(false);
                }}
              />
            </label>
            <label className="wa-menu-item">
              <i className="fas fa-file" style={{ color: '#7f66ff' }} />
              Document
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileAttachment(e.target.files[0]);
                  e.target.value = '';
                  setShowAttachMenu(false);
                }}
              />
            </label>
          </div>
        )}

        {/* ─── Emoji picker popup ─── */}
        {showEmojiPicker && emojiPickerPos && (
          <div
            ref={emojiPickerRef}
            className="wa-popup wa-emoji-picker"
            style={{ bottom: emojiPickerPos.bottom, left: emojiPickerPos.left, padding: 8, gap: 2, maxWidth: 320 }}
          >
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className="wa-emoji"
                onClick={() => {
                  setReplyMessage((prev) => prev + e);
                  inputRef.current?.focus();
                }}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {/* ─── Image lightbox ─── */}
        {viewingImage && (
          <div
            onClick={() => setViewingImage(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10001, cursor: 'pointer', padding: 20,
            }}
          >
            <button
              onClick={() => setViewingImage(null)}
              style={{
                position: 'fixed',
                top: 'max(20px, env(safe-area-inset-top, 20px))',
                right: 'max(20px, env(safe-area-inset-right, 20px))',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)',
                backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.6)',
                width: 44, height: 44, borderRadius: '50%',
                fontSize: 22, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', zIndex: 10002,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 14px rgba(0,0,0,0.3)',
              }}
            >
              ✕
            </button>
            <img
              src={viewingImage}
              alt="Full screen"
              style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default MessagesPage;