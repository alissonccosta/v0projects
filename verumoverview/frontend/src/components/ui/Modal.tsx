import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-dark-background rounded shadow p-4 max-w-lg w-full">
        {children}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="border border-secondary text-secondary px-4 py-1 rounded hover:bg-purple-50">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
