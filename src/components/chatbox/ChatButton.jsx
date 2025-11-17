import React, { useState } from 'react';
import { LuBotMessageSquare } from 'react-icons/lu';
import ChatBox from './ChatBox';
import './ChatButton.css';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chat-button-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="header-content">
              <LuBotMessageSquare size={24} className="header-icon" />
              <h3>Assistant Taskaura</h3>
            </div>
            <button onClick={toggleChat} className="close-button" aria-label="Fermer la fenêtre de chat">
              <span>×</span>
            </button>
          </div>
          <div className="chat-content">
            <ChatBox />
          </div>
        </div>
      )}
      <button 
        className="chat-toggle" 
        onClick={toggleChat}
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        <LuBotMessageSquare size={50}/>
        {!isOpen && <span className="chat-badge"></span>}
      </button>
    </div>
  );
};

export default ChatButton;
