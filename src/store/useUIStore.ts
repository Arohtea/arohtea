import { create } from 'zustand'

interface UIState {
    cursorType: 'default' | 'hover' | 'text' | 'hidden';
    setCursorType: (type: 'default' | 'hover' | 'text' | 'hidden') => void;
    isSearchOpen: boolean;
    setSearchOpen: (isOpen: boolean) => void;
    lenisInstance: any | null;
    setLenis: (lenis: any) => void;
}

export const useUIStore = create<UIState>((set) => ({
    cursorType: 'default',
    setCursorType: (type) => set({ cursorType: type }),
    isSearchOpen: false,
    setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
    lenisInstance: null,
    setLenis: (lenis) => set({ lenisInstance: lenis }),
}))
