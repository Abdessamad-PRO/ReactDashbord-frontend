import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

export default function ChatBox() {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);
 
  const sendMessage = async () => { 
    if (message.trim() === '') return;
  
    const userMessage = { role: 'user', content: message };
    setChat(prev => [...prev, userMessage]);
    setMessage(''); // Vider le champ immédiatement après l'ajout du message
    setLoading(true);
  
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });
  
      const data = await res.json();
      const botMessage = { role: 'bot', content: data.reply };
      setChat(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erreur:', error);
      setChat(prev => [...prev, { role: 'bot', content: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.' }]);
    }
  
    setLoading(false);
  };
  

  return (
    <div className="chat-container">
      <div className="messages">
        {chat.length === 0 ? (
          <div className="welcome-message">
            Bonjour ! Comment puis-je vous aider aujourd'hui ?
          </div>
        ) : (
          chat.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Écrivez votre message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !message.trim()}>
          Envoyer
        </button>
      </div>
    </div>
  );
}
