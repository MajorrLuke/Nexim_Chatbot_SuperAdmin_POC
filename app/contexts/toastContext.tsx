'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';
import * as Toast from '@radix-ui/react-toast';

interface ToastContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  showToast: (title: string, description: string, type?: 'success' | 'error' | 'default') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [toastData, setToastData] = useState({ title: '', description: '', type: 'default' as 'success' | 'error' | 'default' });

  const showToast = (title: string, description: string, type: 'success' | 'error' | 'default' = 'default') => {
    setToastData({ title, description, type });
    setOpen(true);
  };

  const getToastStyles = () => {
    switch (toastData.title) {
      case 'error': return { bg: 'bg-red-500 border border-white-200', text: 'text-white' };
      case 'success': return { bg: 'bg-green-500 border border-white-200', text: 'text-white' };
      default: return { bg: 'dark:bg-black bg-white border dark:border-gray-200 border-black', text: 'dark:text-white text-black' };
    }
  };

  return (
    <ToastContext.Provider value={{ open, setOpen, showToast }}>
      {children}
      <Toast.Provider swipeDirection="right">
        <Toast.Root 
          className={`${getToastStyles().bg} rounded-md z-[9999] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut`} 
          open={open} 
          onOpenChange={setOpen}
        >
          <Toast.Title className={`[grid-area:_title] mb-[5px] font-medium ${getToastStyles().text} text-[15px]`}>
            {toastData.title}
          </Toast.Title>
          <Toast.Description className={`[grid-area:_description] m-0 ${getToastStyles().text} text-[13px] leading-[1.3]`}>
            {toastData.description}
          </Toast.Description>
          <Toast.Action className="[grid-area:_action]" asChild altText="Close toast">
            <button className={`inline-flex items-center justify-center rounded font-medium text-xs px-[10px] leading-[25px] h-[25px] bg-green2 ${getToastStyles().text} shadow-[inset_0_0_0_1px] shadow-green7 hover:shadow-[inset_0_0_0_1px] hover:shadow-green8 focus:shadow-[0_0_0_2px] focus:shadow-green8`}>
              Close
            </button>
          </Toast.Action>
        </Toast.Root>
        <Toast.Viewport className="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};