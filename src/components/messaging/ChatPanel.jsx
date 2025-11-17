import React, { useState, useRef, useEffect } from 'react';
import './Messaging.css';

const ChatPanel = ({ 
  currentUser, 
  onClose, 
  conversations, 
  messages, 
  availableContacts,
  onUpdateConversations,
  onUpdateMessages
}) => {
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [view, setView] = useState('conversations'); // 'conversations', 'chat', 'new'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'groups', 'direct'
  const [filteredConversations, setFilteredConversations] = useState(conversations);
  const [contactSearch, setContactSearch] = useState('');
  const [conversationSearch, setConversationSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesStartRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Filtrer les conversations en fonction du filtre actif et de la recherche
  useEffect(() => {
    let filtered = [...conversations];
    
    // Appliquer le filtre par type
    if (activeFilter === 'unread') {
      filtered = filtered.filter(conv => conv.unread > 0);
    } else if (activeFilter === 'groups') {
      filtered = filtered.filter(conv => conv.type === 'group');
    } else if (activeFilter === 'direct') {
      filtered = filtered.filter(conv => conv.type === 'user');
    }
    
    // Appliquer le filtre de recherche
    if (conversationSearch) {
      const searchLower = conversationSearch.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.name.toLowerCase().includes(searchLower) || 
        conv.lastMessage.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredConversations(filtered);
  }, [conversations, activeFilter, conversationSearch]);
  
  // Faire défiler automatiquement vers le bas lorsque de nouveaux messages sont ajoutés ou quand le chat est ouvert
  useEffect(() => {
    if (activeChat && view === 'chat') {
      // Utiliser une méthode native de défilement au lieu de scrollIntoView pour de meilleures performances
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  }, [messages, activeChat, view]);
  
  // Défiler automatiquement vers le bas quand on ouvre une conversation
  useEffect(() => {
    if (activeChat && view === 'chat') {
      // Utiliser un délai plus court
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [activeChat, view]);
  
  // Fonctions pour défiler vers le haut et vers le bas avec méthodes natives pour de meilleures performances
  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  };
  
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };
  
  // Gérer la sélection de fichiers
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  // Fonction pour déterminer le type de fichier à partir de son extension
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
      return 'image';
    }
    // Documents
    else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return 'document';
    }
    // Texte
    else if (['txt', 'md', 'rtf', 'csv'].includes(extension)) {
      return 'text';
    }
    // Archives
    else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return 'archive';
    }
    // Audio
    else if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(extension)) {
      return 'audio';
    }
    // Vidéo
    else if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(extension)) {
      return 'video';
    }
    // Par défaut
    else {
      return 'other';
    }
  };
  
  // Fonction pour générer un aperçu basé sur le type de fichier
  const getFilePreview = (fileName) => {
    const fileType = getFileType(fileName);
    const extension = fileName.split('.').pop().toLowerCase();
    
    // Renvoie un objet avec les informations nécessaires pour l'affichage
    return {
      type: fileType,
      extension: extension,
      icon: getFileIcon(fileType),
      color: getFileColor(fileType)
    };
  };
  
  // Fonction pour obtenir une icône basée sur le type de fichier
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return '🖼️'; // 🖼️ = 🖼️ (framed picture)
      case 'document': return '📄'; // 📄 = 📄 (page)
      case 'text': return '📃'; // 📃 = 📃 (page with curl) 
      case 'archive': return '🗃️'; // 🗃️ = 🗃️ (card file box)
      case 'audio': return '🎧'; // 🎧 = 🎧 (headphone)
      case 'video': return '🎬'; // 🎬 = 🎬 (clapper board)
      default: return '📎'; // 📎 = 📎 (paperclip)
    }
  };
  
  // Fonction pour obtenir une couleur basée sur le type de fichier
  const getFileColor = (fileType) => {
    switch (fileType) {
      case 'image': return '#4CAF50'; // Vert
      case 'document': return '#2196F3'; // Bleu
      case 'text': return '#9C27B0'; // Violet
      case 'archive': return '#FF9800'; // Orange
      case 'audio': return '#E91E63'; // Rose
      case 'video': return '#F44336'; // Rouge
      default: return '#607D8B'; // Bleu-gris
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileName = file.name;
      const filePreview = getFilePreview(fileName);
      
      // Créer un aperçu pour certains types de fichiers (images)
      let fileUrl = null;
      if (filePreview.type === 'image') {
        fileUrl = URL.createObjectURL(file);
      }
      
      // Créer un message contenant le fichier joint avec des informations d'aperçu
      const fileMessageObj = {
        id: messages[activeChat] ? messages[activeChat].length + 1 : 1,
        sender: `${currentUser.firstName} ${currentUser.lastName}`,
        avatar: '👨',
        message: `${filePreview.icon} Fichier: ${fileName}`,
        time: 'À l\'instant',
        isCurrentUser: true,
        isAttachment: true,
        fileName: fileName,
        fileType: filePreview.type,
        fileExtension: filePreview.extension,
        fileIcon: filePreview.icon,
        fileColor: filePreview.color,
        fileUrl: fileUrl,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`
      };
      
      // Ajouter le message à la conversation actuelle
      const updatedMessages = {
        ...messages,
        [activeChat]: [...(messages[activeChat] || []), fileMessageObj],
      };
      
      onUpdateMessages(updatedMessages);
      
      // Mettre à jour la dernière conversation
      const updatedConversations = conversations.map(conv => {
        if (conv.id === activeChat) {
          return {
            ...conv,
            lastMessage: `${filePreview.icon} Fichier: ${fileName}`,
            lastMessageTime: 'À l\'instant',
            unread: 0,
          };
        }
        return conv;
      });
      
      onUpdateConversations(updatedConversations);
      
      // Réinitialiser l'input file pour permettre la sélection du même fichier
      e.target.value = '';
      
      // Défilement automatique vers le dernier message
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  // Gérer les mises à jour des conversations et messages
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    if (selectedContact && !messages[selectedContact.id]) {
      // C'est un nouveau contact, créer la conversation
      createNewConversation(selectedContact, newMessage);
      return;
    }
    
    const newMessageObj = {
      id: messages[activeChat] ? messages[activeChat].length + 1 : 1,
      sender: `${currentUser.firstName} ${currentUser.lastName}`,
      avatar: '👨',
      message: newMessage,
      time: 'À l\'instant',
      isCurrentUser: true,
    };
    
    // Ajouter le message à la conversation actuelle
    const updatedMessages = {
      ...messages,
      [activeChat]: [...(messages[activeChat] || []), newMessageObj],
    };
    
    onUpdateMessages(updatedMessages);
    
    // Mettre à jour la dernière conversation
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeChat) {
        return {
          ...conv,
          lastMessage: newMessage,
          lastMessageTime: 'À l\'instant',
          unread: 0,
        };
      }
      return conv;
    });
    
    onUpdateConversations(updatedConversations);
    setNewMessage('');
  };
  
  const createNewConversation = (contact, initialMessage) => {
    // Créer un nouvel ID pour la conversation
    const newConvId = contact.id;
    
    // Créer une nouvelle conversation
    const newConversation = {
      id: newConvId,
      type: contact.type,
      name: contact.name,
      avatar: contact.avatar,
      lastMessage: initialMessage,
      lastMessageTime: 'À l\'instant',
      unread: 0,
    };
    
    // Ajouter le premier message
    const firstMessage = {
      id: 1,
      sender: `${currentUser.firstName} ${currentUser.lastName}`,
      avatar: '👨',
      message: initialMessage,
      time: 'À l\'instant',
      isCurrentUser: true,
    };
    
    // Mettre à jour l'état
    const updatedMessages = {
      ...messages,
      [newConvId]: [firstMessage],
    };
    
    onUpdateMessages(updatedMessages);
    onUpdateConversations([newConversation, ...conversations]);
    
    setActiveChat(newConvId);
    setView('chat');
    setSelectedContact(null);
    setNewMessage('');
  };

  const openChat = (chatId) => {
    setActiveChat(chatId);
    setView('chat');
    
    // Marquer comme lu
    const updatedConversations = conversations.map(conv => {
      if (conv.id === chatId) {
        return {
          ...conv,
          unread: 0,
        };
      }
      return conv;
    });
    
    onUpdateConversations(updatedConversations);
    
    // Défilement automatique géré par les useEffect
  };

  const backToConversations = () => {
    setActiveChat(null);
    setView('conversations');
    setSelectedContact(null);
  };
  
  const openNewMessageView = () => {
    setView('new');
    setSelectedContact(null);
    setContactSearch('');
  };
  
  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setActiveChat(contact.id);
    
    // Vérifier si une conversation existe déjà avec ce contact
    const existingConversation = conversations.find(conv => conv.id === contact.id);
    
    if (existingConversation) {
      setView('chat');
    } else {
      // Nouvelle conversation, rester dans la vue "new" mais avec le contact sélectionné
      setNewMessage('');
    }
  };
  
  const filteredContacts = availableContacts ? availableContacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearch.toLowerCase())
  ) : [];
  


  const renderNewMessageView = () => (
    <div className="chat-new-message-view">
      <div className="chat-panel-header">
        <h3>{selectedContact ? `Message à ${selectedContact.name}` : 'Nouveau message'}</h3>
        <button className="chat-close-button" onClick={onClose}>
          &times;
        </button>
      </div>
      
      {!selectedContact ? (
        <>
          <div className="chat-search">
            <input 
              type="text" 
              placeholder="Rechercher un contact..." 
              className="chat-search-input"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              autoFocus
            />
            {contactSearch && (
              <button 
                className="search-clear-button" 
                onClick={() => setContactSearch('')}
                title="Effacer la recherche"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="chat-contacts-container" ref={messagesContainerRef}>
            <div className="contacts-header">
              <h4 className="contacts-section-title">Contacts fréquents</h4>
              <button 
                className="simple-scroll-button" 
                onClick={() => messagesContainerRef.current?.scrollBy({ top: 300, behavior: 'smooth' })}
              >
                Voir plus ↓
              </button>
            </div>
            {filteredContacts
              .filter(contact => contact.type === 'user')
              .slice(0, 6)
              .map(contact => (
              <div 
                key={contact.id} 
                className="chat-conversation-item"
                onClick={() => handleContactSelect(contact)}
              >
                <div className="chat-avatar">{contact.avatar}</div>
                <div className="chat-conversation-content">
                  <div className="chat-name">{contact.name}</div>
                  <div className="chat-last-message">
                    {contact.type === 'group' ? 'Groupe' : 'Contact'}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="contacts-header">
              <h4 className="contacts-section-title">Groupes</h4>
              <button 
                className="simple-scroll-button" 
                onClick={() => messagesContainerRef.current?.scrollBy({ top: 200, behavior: 'smooth' })}
              >
                Voir plus ↓
              </button>
            </div>
            {filteredContacts
              .filter(contact => contact.type === 'group')
              .map(contact => (
              <div 
                key={contact.id} 
                className="chat-conversation-item"
                onClick={() => handleContactSelect(contact)}
              >
                <div className="chat-avatar">{contact.avatar}</div>
                <div className="chat-conversation-content">
                  <div className="chat-name">{contact.name}</div>
                  <div className="chat-last-message">
                    Groupe
                  </div>
                </div>
              </div>
            ))}
            
            <div className="contacts-header">
              <h4 className="contacts-section-title">Tous les contacts</h4>
              <button 
                className="simple-scroll-button" 
                onClick={() => messagesContainerRef.current?.scrollBy({ top: 300, behavior: 'smooth' })}
              >
                Voir plus ↓
              </button>
            </div>
            {filteredContacts
              .filter(contact => contact.type === 'user')
              .slice(6)
              .map(contact => (
              <div 
                key={contact.id} 
                className="chat-conversation-item"
                onClick={() => handleContactSelect(contact)}
              >
                <div className="chat-avatar">{contact.avatar}</div>
                <div className="chat-conversation-content">
                  <div className="chat-name">{contact.name}</div>
                  <div className="chat-last-message">
                    Contact
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="selected-contact-info">
            <div className="chat-avatar">{selectedContact.avatar}</div>
            <div className="chat-name">{selectedContact.name}</div>
          </div>
          
          <div className="chat-input-container">
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Écrivez votre premier message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              autoFocus
            />
            <button 
              className="chat-send-button"
              onClick={handleSendMessage}
              disabled={newMessage.trim() === ''}
            >
              <span>📤</span>
            </button>
          </div>
        </>
      )}
      
      <div className="chat-new-message-footer">
        <button className="chat-back-button" onClick={backToConversations}>
          Retour
        </button>
      </div>
    </div>
  );

  const renderConversationsList = () => (
    <div className="chat-conversations-list">
      <div className="chat-panel-header">
        <h3>Messages</h3>
        <button className="chat-close-button" onClick={onClose}>
          &times;
        </button>
      </div>
      
      <div className="chat-search">
        <input 
          type="text" 
          placeholder="Rechercher une conversation..." 
          className="chat-search-input"
          value={conversationSearch}
          onChange={(e) => setConversationSearch(e.target.value)}
        />
        {conversationSearch && (
          <button 
            className="search-clear-button" 
            onClick={() => setConversationSearch('')}
            title="Effacer la recherche"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="chat-filters">
        <button 
          className={`chat-filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Tous
        </button>
        <button 
          className={`chat-filter-button ${activeFilter === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveFilter('unread')}
        >
          Non lus
        </button>
        <button 
          className={`chat-filter-button ${activeFilter === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveFilter('groups')}
        >
          Groupes
        </button>

      </div>
      
      <div className="chat-conversations-container">
        {filteredConversations.map(conversation => (
          <div 
            key={conversation.id} 
            className={`chat-conversation-item ${conversation.unread > 0 ? 'unread' : ''}`}
            onClick={() => openChat(conversation.id)}
          >
            <div className="chat-avatar">{conversation.avatar}</div>
            <div className="chat-conversation-content">
              <div className="chat-conversation-header">
                <span className="chat-name">{conversation.name}</span>
                <span className="chat-time">{conversation.lastMessageTime}</span>
              </div>
              <div className="chat-last-message">{conversation.lastMessage}</div>
            </div>
            {conversation.unread > 0 && (
              <div className="chat-unread-count">{conversation.unread}</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="chat-new-message">
        <button className="chat-new-message-button" onClick={openNewMessageView}>
          <span>+</span> Nouveau message
        </button>
      </div>
    </div>
  );

  const renderChatView = () => {
    const currentChat = conversations.find(conv => conv.id === activeChat);
    const chatMessages = messages[activeChat] || [];
    
    return (
      <div className="chat-view">
        <div className="chat-view-header">
          <button className="chat-back-button" onClick={backToConversations}>
            &larr;
          </button>
          <div className="chat-avatar">{currentChat.avatar}</div>
          <div className="chat-name">{currentChat.name}</div>
          <div className="chat-actions">
            <button className="chat-close-button" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>
        
        <div className="chat-messages-container" ref={messagesContainerRef}>
          
          {chatMessages.map(msg => (
            <div 
              key={msg.id} 
              className={`chat-message ${msg.isCurrentUser ? 'outgoing' : 'incoming'}`}
            >
              {!msg.isCurrentUser && (
                <div className="chat-message-avatar">{msg.avatar}</div>
              )}
              <div className="chat-message-content">
                {!msg.isCurrentUser && (
                  <div className="chat-message-sender">{msg.sender}</div>
                )}
                <div className={`chat-message-bubble ${msg.isAttachment ? 'attachment-bubble' : ''}`}>
                  {msg.isAttachment ? (
                    <div className="attachment-content">
                      <div className="attachment-preview" style={{ borderColor: msg.fileColor }}>
                        {msg.fileUrl && msg.fileType === 'image' ? (
                          <img src={msg.fileUrl} alt={msg.fileName} className="attachment-image-preview" />
                        ) : (
                          <div className="attachment-icon-container" style={{ backgroundColor: msg.fileColor + '30' }}>
                            <span className="attachment-icon-large" style={{ color: msg.fileColor }}>{msg.fileIcon}</span>
                            <span className="attachment-extension">.{msg.fileExtension}</span>
                          </div>
                        )}
                        <div className="attachment-details">
                          <span className="attachment-name">{msg.fileName}</span>
                          <span className="attachment-size">{msg.fileSize}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    msg.message
                  )}
                  <span className="chat-message-time">{msg.time}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-container">
          <button 
            className="chat-action-button"
            title="Joindre un fichier"
            onClick={handleFileSelect}
          >
            <span className="attachment-icon">📄</span>
          </button>
          <input 
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Écrivez votre message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="chat-send-button"
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ''}
          >
            <span>📤</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-panel">
      {view === 'conversations' 
        ? renderConversationsList() 
        : view === 'new' 
          ? renderNewMessageView() 
          : renderChatView()
      }
      

    </div>
  );
};

export default ChatPanel;
