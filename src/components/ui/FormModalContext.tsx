'use client';

import React, { createContext, useContext, useState } from 'react';

type FormKey = 'product' | 'client' | 'sale' | 'purchase';

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

  const openForm = (key: FormKey) => setActiveForm(key);
  const closeForm = () => setActiveForm(null);

  return (
    <FormModalContext.Provider value={{ activeForm, openForm, closeForm }}>
      {children}
    </FormModalContext.Provider>
  );
}
