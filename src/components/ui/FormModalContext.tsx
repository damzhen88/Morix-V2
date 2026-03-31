'use client';

import React, { createContext, useContext, useState } from 'react';

type FormKey = 'product' | 'client' | 'sale' | 'purchase' | 'expense';

interface FormModalContextValue {
  activeForm: FormKey | null;
  openForm: (key: FormKey) => void;
  closeForm: () => void;
}

const FormModalContext = createContext<FormModalContextValue>({
  activeForm: null,
  openForm: () => {},
  closeForm: () => {},
});

export function useFormModal() {
  return useContext(FormModalContext);
}

export function FormModalProvider({ children }: { children: React.ReactNode }) {
  const [activeForm, setActiveForm] = useState<FormKey | null>(null);

  const openForm = (key: FormKey) => {
    console.log('Opening form:', key);
    setActiveForm(key);
  };
  const closeForm = () => {
    console.log('Closing form');
    setActiveForm(null);
  };

  return (
    <FormModalContext.Provider value={{ activeForm, openForm, closeForm }}>
      {children}
    </FormModalContext.Provider>
  );
}
