import { useEffect, useState } from 'react';

export default function Modal({ isOpen, onClose, children, modalPos }) {
  const [visible, setVisible] = useState(false);

useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      setTimeout(() => setVisible(false), 300);
    }
  }, [isOpen]);

  if (!isOpen && !visible) return null;

  return (
    <div
      className="fixed z-50 bg-white shadow-lg rounded-lg transition-all duration-500"
      style={{
        top: modalPos?.top ?? '50%',
        left: modalPos?.left ?? '50%',
        width: modalPos?.width ?? '300px',
        height: modalPos?.height ?? 'auto',
        transform: isOpen ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.5)',
        transition: 'transform 0.5s ease, opacity 0.5s ease',
        opacity: isOpen ? 1 : 0,
      }}
    >
      <div className="p-4">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400">✕</button>
        {children}
      </div>
    </div>
  );
}
