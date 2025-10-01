'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const NOTES_STORAGE_KEY = 'dazai-notes';
const NOTES_UPDATED_EVENT = 'dazai-notes-updated';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadNotes = useCallback(() => {
    try {
      const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error('Failed to load notes from localStorage', error);
    }
  }, []);

  useEffect(() => {
    loadNotes();
    setIsLoaded(true);

    const handleStorageChange = () => {
      loadNotes();
    };

    window.addEventListener(NOTES_UPDATED_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener(NOTES_UPDATED_EVENT, handleStorageChange);
    };
  }, [loadNotes]);

  const saveNotesAndNotify = useCallback((newNotes: Note[]) => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(newNotes));
      setNotes(newNotes);
      window.dispatchEvent(new CustomEvent(NOTES_UPDATED_EVENT));
    } catch (error) {
      console.error('Failed to save notes to localStorage', error);
    }
  }, []);

  const addNote = useCallback((title: string, content: string) => {
    const currentNotes = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || '[]');
    const newNote: Note = {
      id: new Date().toISOString(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    saveNotesAndNotify([newNote, ...currentNotes]);
  }, [saveNotesAndNotify]);

  const updateNote = useCallback((id: string, title: string, content: string) => {
    const currentNotes = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || '[]');
    const updatedNotes = currentNotes.map((n: Note) =>
      n.id === id ? { ...n, title, content, createdAt: new Date().toISOString() } : n
    );
    saveNotesAndNotify(updatedNotes);
  }, [saveNotesAndNotify]);

  const deleteNote = useCallback((id: string) => {
    const currentNotes = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || '[]');
    const updatedNotes = currentNotes.filter((note: Note) => note.id !== id);
    saveNotesAndNotify(updatedNotes);
  }, [saveNotesAndNotify]);

  return { notes, addNote, updateNote, deleteNote, isLoaded };
}
