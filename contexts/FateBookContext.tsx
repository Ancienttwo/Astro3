"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of your fate book and context
interface FateBook {
  id: string;
  name: string;
  // Add other properties of a fate book here
}

interface FateBookContextType {
  fateBooks: FateBook[];
  addFateBook: (book: Omit<FateBook, 'id'>) => void;
  isFormVisible: boolean;
  showForm: () => void;
  hideForm: () => void;
}

// Create the context with a default value
const FateBookContext = createContext<FateBookContextType | undefined>(undefined);

// Create a provider component
export const FateBookProvider = ({ children }: { children: ReactNode }) => {
  const [fateBooks, setFateBooks] = useState<FateBook[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const addFateBook = (book: Omit<FateBook, 'id'>) => {
    // 使用更稳定的ID生成方法
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const newBook = { ...book, id: `${timestamp}-${random}` };
    setFateBooks(prev => [...prev, newBook]);
    setIsFormVisible(false); // Hide form after adding
  };

  const showForm = () => {
    // Only show form if no fate books exist, as per the request
    if (fateBooks.length === 0) {
        setIsFormVisible(true);
    }
  };

  const hideForm = () => setIsFormVisible(false);

  return (
    <FateBookContext.Provider value={{ fateBooks, addFateBook, isFormVisible, showForm, hideForm }}>
      {children}
    </FateBookContext.Provider>
  );
};

// Create a custom hook for easy context consumption
export const useFateBook = () => {
  const context = useContext(FateBookContext);
  if (context === undefined) {
    throw new Error('useFateBook must be used within a FateBookProvider');
  }
  return context;
}; 