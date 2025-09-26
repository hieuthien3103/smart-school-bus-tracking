import { X } from 'lucide-react';

interface ModalProps {
  showModal: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ showModal, onClose, title, children }: ModalProps) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Đóng modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;