import { useState } from 'react';
import './NotesPanel.css';

function NotesPanel() {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Réunion équipe', content: 'Présentation projet dashboard', date: '2025-05-15', priority: 'high' },
    { id: 2, title: 'Bug fix', content: 'Corriger affichage graphiques', date: '2025-05-16', priority: 'medium' },
  ]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', priority: 'medium' });

  const handleAddNote = () => {
    if (newNote.title && newNote.content) {
      const note = {
        id: Date.now(),
        ...newNote,
        date: new Date().toISOString().split('T')[0]
      };
      setNotes([note, ...notes]);
      setNewNote({ title: '', content: '', priority: 'medium' });
      setIsAddingNote(false);
    }
  };

  const handleEditNote = (note) => {
    setNotes(notes.map(n => n.id === note.id ? { ...note, date: new Date().toISOString().split('T')[0] } : n));
    setEditingNote(null);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="notes-panel">
      <div className="notes-header">
        <h2>📝 Notes</h2>
        <button 
          className="add-note-btn"
          onClick={() => setIsAddingNote(true)}
        >
          + Nouvelle note
        </button>
      </div>

      {isAddingNote && (
        <div className="note-form">
          <input
            type="text"
            placeholder="Titre"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          />
          <textarea
            placeholder="Contenu"
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          />
          <div className="note-form-actions">
            <select
              value={newNote.priority}
              onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
            >
              <option value="low">🔵 Basse</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="high">🔴 Haute</option>
            </select>
            <div>
              <button className="cancel-btn" onClick={() => setIsAddingNote(false)}>Annuler</button>
              <button className="save-btn" onClick={handleAddNote}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      <div className="notes-list">
        {notes.map(note => (
          <div key={note.id} className={`note-card priority-${note.priority}`}>
            {editingNote?.id === note.id ? (
              <div className="note-form">
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                />
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                />
                <div className="note-form-actions">
                  <select
                    value={editingNote.priority}
                    onChange={(e) => setEditingNote({ ...editingNote, priority: e.target.value })}
                  >
                    <option value="low">🔵 Basse</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🔴 Haute</option>
                  </select>
                  <div>
                    <button className="cancel-btn" onClick={() => setEditingNote(null)}>Annuler</button>
                    <button className="save-btn" onClick={() => handleEditNote(editingNote)}>Sauvegarder</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="note-header">
                  <h3>{note.title}</h3>
                  <div className="note-actions">
                    <button className="edit-btn" onClick={() => setEditingNote(note)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDeleteNote(note.id)}>🗑️</button>
                  </div>
                </div>
                <p className="note-content">{note.content}</p>
                <div className="note-footer">
                  <span className="note-date">{note.date}</span>
                  <span className={`priority-badge priority-${note.priority}`}>
                    {note.priority === 'high' ? '🔴 Haute' : note.priority === 'medium' ? '🟡 Moyenne' : '🔵 Basse'}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotesPanel;
