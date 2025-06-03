// components/ui/dialog.js
'use client';

import { useState } from 'react';

export function Dialog({ children }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      {children}
    </div>
  );
}

export function DialogTrigger({ children, onClick }) {
  return (
    <button onClick={onClick} className="p-2 bg-blue-500 text-white rounded">{children}</button>
  );
}

export function DialogContent({ children }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      {children}
    </div>
  );
}

export function DialogHeader({ title }) {
  return <h2 className="text-xl font-bold mb-4">{title}</h2>;
}
