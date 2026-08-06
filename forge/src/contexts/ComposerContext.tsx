import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { loadComposerState, saveComposerState, COMPOSER_MAX_ITEMS, type ComposerItem } from '../utils/composer';

interface ComposerContextValue {
  items: ComposerItem[];
  isInStack: (name: string) => boolean;
  canAdd: boolean;
  addItem: (name: string) => void;
  removeItem: (name: string) => void;
  toggleOptional: (name: string) => void;
  setNote: (name: string, note: string) => void;
  moveItem: (name: string, direction: -1 | 1) => void;
  clearAll: () => void;
  /** Latest human-readable outcome of a composer action (add/remove/clear/
   *  copy/save), meant to be rendered into a single polite live region.
   *  Lives here rather than in ComposerDrawer's local state so that actions
   *  triggered from "Add to stack" buttons on other pages are announced
   *  even while the drawer itself is closed. */
  announcement: string;
  announce: (message: string) => void;
}

const ComposerContext = createContext<ComposerContextValue | null>(null);

export function ComposerProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ComposerItem[]>(() => loadComposerState());
  const [announcement, setAnnouncement] = useState('');

  const isInStack = useCallback((name: string) => items.some(i => i.name === name), [items]);
  const canAdd = items.length < COMPOSER_MAX_ITEMS;
  const announce = useCallback((message: string) => setAnnouncement(message), []);

  const addItem = useCallback((name: string) => {
    setItems(prev => {
      if (prev.some(i => i.name === name) || prev.length >= COMPOSER_MAX_ITEMS) return prev;
      const next = [...prev, { name, optional: false, note: '' }];
      saveComposerState(next);
      return next;
    });
    setAnnouncement(`${name} added to stack.`);
  }, []);

  const removeItem = useCallback((name: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.name !== name);
      saveComposerState(next);
      return next;
    });
    setAnnouncement(`${name} removed from stack.`);
  }, []);

  const toggleOptional = useCallback((name: string) => {
    setItems(prev => {
      const next = prev.map(i => (i.name === name ? { ...i, optional: !i.optional } : i));
      saveComposerState(next);
      return next;
    });
  }, []);

  const setNote = useCallback((name: string, note: string) => {
    setItems(prev => {
      const next = prev.map(i => (i.name === name ? { ...i, note } : i));
      saveComposerState(next);
      return next;
    });
  }, []);

  const moveItem = useCallback((name: string, direction: -1 | 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.name === name);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      saveComposerState(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    saveComposerState([]);
    setAnnouncement('Stack cleared.');
  }, []);

  const value = useMemo<ComposerContextValue>(() => ({
    items, isInStack, canAdd, addItem, removeItem, toggleOptional, setNote, moveItem, clearAll,
    announcement, announce,
  }), [items, isInStack, canAdd, addItem, removeItem, toggleOptional, setNote, moveItem, clearAll, announcement, announce]);

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useComposer(): ComposerContextValue {
  const ctx = useContext(ComposerContext);
  if (!ctx) throw new Error('useComposer must be used within a ComposerProvider');
  return ctx;
}
