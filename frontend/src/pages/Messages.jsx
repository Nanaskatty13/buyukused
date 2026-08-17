import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messages } from '../services/messages';
import { API_URL, getImageUrl } from '../services/api';

const Messages = () => {
  const { user, token } = useAuth();
  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [uploading, setUploading] = useState(false);
  const pollInterval = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !token) return;
      try {
        setLoading(true);
        const data = await messages.getForUser(user._id, token);
        const list = Array.isArray(data) ? data : data?.messages || data?.data || [];
        setMessagesList(list);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [user, token]);

  const openConversation = (otherUserId) => {
    const conversationMessages = messagesList.filter(msg => {
      const s = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
      const r = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
      return (s === otherUserId || r === otherUserId) && (s === user._id || r === user._id);
    });
    setSelectedConversation({ userId: otherUserId, messages: conversationMessages });

    // Mark unread as read
    const unread = conversationMessages.filter(msg => {
      const r = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
      return r === user._id && !msg.read;
    });
    unread.forEach(async msg => {
      try {
        await messages.markRead(msg._id, token);
        setMessagesList(prev => prev.map(m => (m._id === msg._id ? { ...m, read: true } : m)));
        setSelectedConversation(prev => ({
          ...prev,
          messages: prev.messages.map(m => (m._id === msg._id ? { ...m, read: true } : m)),
        }));
      } catch (err) { console.error(err); }
    });

    // Start polling
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = setInterval(async () => {
      if (!selectedConversation) return;
      try {
        const res = await fetch(`${API_URL}/api/messages/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const newMsgs = data.messages.filter(msg => {
            const s = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
            const r = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
            return (s === otherUserId || r === otherUserId) && (s === user._id || r === user._id);
          });
          setMessagesList(prev => {
            const existing = new Set(prev.map(m => m._id));
            const added = newMsgs.filter(m => !existing.has(m._id));
            return [...prev, ...added];
          });
          setSelectedConversation(prev => {
            if (!prev) return prev;
            const existing = new Set(prev.messages.map(m => m._id));
            const added = newMsgs.filter(m => !existing.has(m._id));
            return { ...prev, messages: [...prev.messages, ...added] };
          });
        }
      } catch (err) { console.error('Polling error:', err); }
    }, 5000);
  };

  const closeConversation = () => {
    setSelectedConversation(null);
    if (pollInterval.current) clearInterval(pollInterval.current);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedConversation || !token) return;
    setSendingReply(true);
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: selectedConversation.userId,
          message: replyMessage.trim(),
          productId: null,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to send reply');
      }
      const data = await res.json();
      const newMessage = data.message || data.data || data;
      if (!newMessage?._id) throw new Error('Invalid response');
      setMessagesList(prev => [newMessage, ...prev]);
      setSelectedConversation(prev => ({
        ...prev,
        messages: [newMessage, ...prev.messages],
      }));
      setReplyMessage('');
    } catch (err) {
      alert(err.message || 'Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleFileAttachment = async (file) => {
    if (!selectedConversation || !token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      const fileUrl = uploadData.url || uploadData.secure_url;
      if (!fileUrl) throw new Error('No URL returned');

      let label = '📎 File';
      if (file.type.startsWith('image/')) label = '📷 Image';
      else if (file.type.startsWith('video/')) label = '🎥 Video';
      else if (file.type === 'text/vcard' || file.name?.endsWith('.vcf')) label = '📇 Contact';
      const messageText = `${label}: ${fileUrl}`;

      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: selectedConversation.userId,
          message: messageText,
          productId: null,
        }),
      });
      if (!res.ok) throw new Error('Failed to send file message');
      const data = await res.json();
      const newMessage = data.message || data.data || data;
      if (!newMessage?._id) throw new Error('Invalid response');
      setMessagesList(prev => [newMessage, ...prev]);
      setSelectedConversation(prev => ({
        ...prev,
        messages: [newMessage, ...prev.messages],
      }));
    } catch (err) {
      alert(err.message || 'Failed to send file.');
    } finally {
      setUploading(false);
    }
  };

  const getConversations = () => {
    if (!user) return [];
    const partners = new Set();
    messagesList.forEach(msg => {
      const s = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
      const r = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
      if (s === user._id && r) partners.add(r);
      if (r === user._id && s) partners.add(s);
    });
    return Array.from(partners).map(partnerId => {
      const conv = messagesList.filter(msg => {
        const s = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
        const r = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
        return (s === partnerId || r === partnerId) && (s === user._id || r === user._id);
      });
      const sorted = [...conv].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const last = sorted[0] || null;
      const unread = conv.filter(msg => {
        const r = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
        return r === user._id && !msg.read;
      }).length;
      let partner = null;
      for (const msg of sorted) {
        const s = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
        const r = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;
        if (s === partnerId) { partner = msg.sender; break; }
        if (r === partnerId) { partner = msg.receiver; break; }
      }
      return { userId: partnerId, partner, last, unread };
    }).sort((a, b) => new Date(b.last?.createdAt || 0) - new Date(a.last?.createdAt || 0));
  };

  if (!user) {
    return <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>Please login to view your messages.</div>;
  }

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>Messages</h1>
      {loading ? (
        <p>Loading conversations...</p>
      ) : messagesList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
          No messages yet.
        </div>
      ) : selectedConversation ? (
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>
              {(() => {
                const first = selectedConversation.messages[0];
                if (!first) return 'User';
                const s = typeof first.sender === 'string' ? first.sender : first.sender?._id;
                const partner = s === selectedConversation.userId ? first.sender : first.receiver;
                return partner?.name || 'User';
              })()}
            </strong>
            <button onClick={closeConversation} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...selectedConversation.messages].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)).map(msg => {
              const s = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
              const isMine = s === user._id;
              return (
                <div key={msg._id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%', background: isMine ? 'var(--primary)' : 'var(--gray-100)', color: isMine ? 'white' : 'var(--gray-800)', padding: '8px 14px', borderRadius: '12px', fontSize: '14px' }}>
                  {msg.message}
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--gray-200)', padding: '12px' }}>
            <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={replyMessage} onChange={e => setReplyMessage(e.target.value)} placeholder="Type a reply..." style={{ flex: 1, padding: '8px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }} />
                <button type="submit" disabled={sendingReply || uploading} style={{ padding: '8px 20px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: (sendingReply || uploading) ? 'not-allowed' : 'pointer', opacity: (sendingReply || uploading) ? 0.7 : 1 }}>{sendingReply ? 'Sending...' : 'Reply'}</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <label style={{ cursor: 'pointer', background: '#f1f5f9', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fas fa-image"></i> Image
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) handleFileAttachment(e.target.files[0]); e.target.value = ''; }} />
                </label>
                <label style={{ cursor: 'pointer', background: '#f1f5f9', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fas fa-video"></i> Video
                  <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) handleFileAttachment(e.target.files[0]); e.target.value = ''; }} />
                </label>
                <label style={{ cursor: 'pointer', background: '#f1f5f9', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fas fa-address-card"></i> Contact
                  <input type="file" accept=".vcf,.vcard" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) handleFileAttachment(e.target.files[0]); e.target.value = ''; }} />
                </label>
                {uploading && <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Uploading...</span>}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {getConversations().map(conv => (
            <div key={conv.userId} onClick={() => openConversation(conv.userId)} style={{ background: 'white', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {conv.partner?.name || 'User'}
                  {conv.unread > 0 && <span style={{ background: '#e74c3c', color: 'white', fontSize: '10px', padding: '1px 8px', borderRadius: 'var(--radius-full)', marginLeft: '8px' }}>{conv.unread}</span>}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{conv.last?.message || 'No messages'}</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{conv.last?.createdAt ? new Date(conv.last.createdAt).toLocaleDateString() : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;