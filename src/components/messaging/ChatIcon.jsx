import React, { useState, useEffect } from 'react';
import ChatPanel from './ChatPanel';
import './Messaging.css';
import { TbMessageChatbot } from "react-icons/tb";
// Données de démonstration pour les conversations
const initialConversations = [
  {
    id: 1,
    type: 'group',
    name: 'Projet Refonte Site Web',
    avatar: '🌐',
    lastMessage: 'Réunion demain à 14h pour discuter des maquettes',
    lastMessageTime: '10:15',
    unread: 2,
  },
  {
    id: 2,
    type: 'user',
    name: 'Alice Martin',
    avatar: '👩',
    lastMessage: 'Peux-tu m\'envoyer le rapport mensuel ?',
    lastMessageTime: 'Hier',
    unread: 1,
  },
  {
    id: 3,
    type: 'group',
    name: 'Équipe Design',
    avatar: '🎨',
    lastMessage: 'Les nouvelles icônes sont prêtes pour validation',
    lastMessageTime: 'Hier',
    unread: 0,
  },
  {
    id: 4,
    type: 'user',
    name: 'Marc Dubois',
    avatar: '👨',
    lastMessage: 'Merci pour ton aide sur le ticket #1234',
    lastMessageTime: 'Lun',
    unread: 0,
  },
  {
    id: 5,
    type: 'user',
    name: 'Sophie Bernard',
    avatar: '👩',
    lastMessage: 'L\'analyse des performances est terminée',
    lastMessageTime: '28 Avr',
    unread: 0,
  }
];

// Données de démonstration pour les messages
const initialMessages = {
  1: [
    { id: 1, sender: 'Marc Dubois', avatar: '👨', message: 'Bonjour à tous ! La réunion est confirmée pour demain à 14h.', time: 'Hier, 16:32', isCurrentUser: false },
    { id: 2, sender: 'Alice Martin', avatar: '👩', message: 'Super, est-ce qu\'on a un ordre du jour ?', time: 'Hier, 16:45', isCurrentUser: false },
    { id: 3, sender: 'Thomas Dupont', avatar: '👨', message: 'Je vous ai envoyé un email avec l\'ordre du jour et les points à discuter', time: 'Hier, 17:00', isCurrentUser: true },
    { id: 4, sender: 'Sophie Bernard', avatar: '👩', message: 'Parfait, j\'ai préparé les maquettes à présenter', time: 'Aujourd\'hui, 09:23', isCurrentUser: false },
    { id: 5, sender: 'Marc Dubois', avatar: '👨', message: 'N\'oubliez pas que la salle de réunion a changé, c\'est maintenant au 3ème étage', time: 'Aujourd\'hui, 10:15', isCurrentUser: false },
  ],
  2: [
    { id: 1, sender: 'Alice Martin', avatar: '👩', message: 'Bonjour Thomas, as-tu finalisé le rapport mensuel ?', time: 'Hier, 14:22', isCurrentUser: false },
    { id: 2, sender: 'Thomas Dupont', avatar: '👨', message: 'Bonjour Alice, oui il est presque terminé', time: 'Hier, 14:30', isCurrentUser: true },
    { id: 3, sender: 'Alice Martin', avatar: '👩', message: 'Parfait, la direction l\'attend pour demain', time: 'Hier, 14:32', isCurrentUser: false },
    { id: 4, sender: 'Thomas Dupont', avatar: '👨', message: 'Il sera prêt à temps, je te l\'envoie ce soir', time: 'Hier, 14:35', isCurrentUser: true },
    { id: 5, sender: 'Alice Martin', avatar: '👩', message: 'Peux-tu m\'envoyer le rapport mensuel ?', time: 'Aujourd\'hui, 09:15', isCurrentUser: false },
  ],
  3: [
    { id: 1, sender: 'Sophie Bernard', avatar: '👩', message: 'J\'ai terminé les nouvelles icônes pour le dashboard', time: 'Lun, 11:22', isCurrentUser: false },
    { id: 2, sender: 'Marc Dubois', avatar: '👨', message: 'Elles sont superbes ! J\'aime beaucoup le style minimaliste', time: 'Lun, 11:45', isCurrentUser: false },
    { id: 3, sender: 'Thomas Dupont', avatar: '👨', message: 'On peut les intégrer dès cette semaine ?', time: 'Lun, 12:01', isCurrentUser: true },
    { id: 4, sender: 'Sophie Bernard', avatar: '👩', message: 'Oui, je vous envoie les fichiers SVG tout de suite', time: 'Lun, 14:30', isCurrentUser: false },
    { id: 5, sender: 'Sophie Bernard', avatar: '👩', message: 'Les nouvelles icônes sont prêtes pour validation', time: 'Hier, 16:20', isCurrentUser: false },
  ],
  4: [
    { id: 1, sender: 'Thomas Dupont', avatar: '👨', message: 'Salut Marc, j\'ai vu que tu travailles sur le bug #1234', time: 'Lun, 10:22', isCurrentUser: true },
    { id: 2, sender: 'Marc Dubois', avatar: '👨', message: 'Oui, c\'est un problème avec le chargement des données', time: 'Lun, 10:30', isCurrentUser: false },
    { id: 3, sender: 'Thomas Dupont', avatar: '👨', message: 'Je pense que c\'est lié au cache, j\'ai une solution', time: 'Lun, 10:33', isCurrentUser: true },
    { id: 4, sender: 'Marc Dubois', avatar: '👨', message: 'Ah génial ! Tu peux me montrer ?', time: 'Lun, 10:34', isCurrentUser: false },
    { id: 5, sender: 'Marc Dubois', avatar: '👨', message: 'Merci pour ton aide sur le ticket #1234', time: 'Lun, 16:45', isCurrentUser: false },
  ],
  5: [
    { id: 1, sender: 'Sophie Bernard', avatar: '👩', message: 'J\'ai commencé l\'analyse des performances', time: '28 Avr, 09:15', isCurrentUser: false },
    { id: 2, sender: 'Thomas Dupont', avatar: '👨', message: 'Super, tu as besoin d\'aide pour certains aspects ?', time: '28 Avr, 09:20', isCurrentUser: true },
    { id: 3, sender: 'Sophie Bernard', avatar: '👩', message: 'Je m\'en sors bien, mais je te recontacterai si besoin', time: '28 Avr, 09:25', isCurrentUser: false },
    { id: 4, sender: 'Thomas Dupont', avatar: '👨', message: 'D\'accord, tiens-moi au courant', time: '28 Avr, 09:26', isCurrentUser: true },
    { id: 5, sender: 'Sophie Bernard', avatar: '👩', message: 'L\'analyse des performances est terminée', time: '28 Avr, 15:30', isCurrentUser: false },
  ],
};

// Liste de contacts disponibles pour créer une nouvelle conversation
const availableContacts = [
  { id: 101, name: 'Emilie Renaud', avatar: '👩', type: 'user' },
  { id: 102, name: 'Alexandre Chen', avatar: '👨', type: 'user' },
  { id: 103, name: 'Pierre Dubois', avatar: '👨', type: 'user' },
  { id: 104, name: 'Julie Lefebvre', avatar: '👩', type: 'user' },
  { id: 105, name: 'Équipe Marketing', avatar: '📊', type: 'group' },
  { id: 106, name: 'Support Technique', avatar: '🛠️', type: 'group' },
  { id: 107, name: 'Équipe Développement', avatar: '💻', type: 'group' },
  { id: 108, name: 'Isabelle Martin', avatar: '👩', type: 'user' },
  { id: 109, name: 'Thomas Laurent', avatar: '👨', type: 'user' },
  { id: 110, name: 'Marie Fontaine', avatar: '👩', type: 'user' },
  { id: 111, name: 'Lucas Bernard', avatar: '👨', type: 'user' },
  { id: 112, name: 'Emma Rousseau', avatar: '👩', type: 'user' },
  { id: 113, name: 'Hugo Leroy', avatar: '👨', type: 'user' },
  { id: 114, name: 'Chloé Moreau', avatar: '👩', type: 'user' },
  { id: 115, name: 'Raphael Girard', avatar: '👨', type: 'user' },
  { id: 116, name: 'Camille Petit', avatar: '👩', type: 'user' },
  { id: 117, name: 'Projet Nouveau Site', avatar: '🌐', type: 'group' },
  { id: 118, name: 'Équipe Finance', avatar: '💰', type: 'group' },
  { id: 119, name: 'Ressources Humaines', avatar: '👤', type: 'group' },
];

const ChatIcon = ({ currentUser }) => {
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  
  // Calculer le nombre de messages non lus
  useEffect(() => {
    const count = conversations.reduce((total, conv) => total + conv.unread, 0);
    setUnreadCount(count);
  }, [conversations]);

  const toggleChatPanel = () => {
    setShowChatPanel(!showChatPanel);
  };
  
  const handleCloseChatPanel = () => {
    setShowChatPanel(false);
  };
  
  const handleUpdateConversations = (newConversations) => {
    setConversations(newConversations);
  };
  
  const handleUpdateMessages = (newMessages) => {
    setMessages(newMessages);
  };

  return (
    <div className="chat-icon-container">
      <button className="chat-icon-button" onClick={toggleChatPanel} aria-label="Messagerie">
        <span className="chat-icon"><TbMessageChatbot /></span>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>
      
      {showChatPanel && (
        <ChatPanel 
          currentUser={currentUser} 
          onClose={handleCloseChatPanel}
          conversations={conversations}
          messages={messages}
          availableContacts={availableContacts}
          onUpdateConversations={handleUpdateConversations}
          onUpdateMessages={handleUpdateMessages}
        />
      )}
    </div>
  );
};

export default ChatIcon;
