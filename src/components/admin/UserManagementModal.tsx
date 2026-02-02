import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Crown, Shield, Ban, Check, Trash2, 
  User, AlertTriangle, Loader2, Power
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'addAdmin' | 'addPremium' | 'removeAdmin' | 'removePremium' | 'stopUser' | 'deleteUser' | null;
}

export default function UserManagementModal({
  isOpen,
  onClose,
  action,
}: UserManagementModalProps) {
  const { 
    user, getAllUsers, addAdmin, removeAdmin, 
    addPremium, removePremium, stopUser, activateUser, deleteUser 
  } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const allUsers = getAllUsers().filter(u => u.id !== user?.id);
  
  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = allUsers.find(u => u.id === selectedUserId);

  const getActionConfig = () => {
    switch (action) {
      case 'addAdmin':
        return { 
          title: 'Add Admin', 
          icon: Shield, 
          color: 'text-red-500',
          bgColor: 'bg-red-500/20',
          description: 'Grant admin privileges to a user',
          confirmText: 'ADMIN',
          buttonText: 'Grant Admin',
        };
      case 'addPremium':
        return { 
          title: 'Add Premium', 
          icon: Crown, 
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/20',
          description: 'Grant premium status to a user',
          confirmText: 'PREMIUM',
          buttonText: 'Grant Premium',
        };
      case 'removeAdmin':
        return { 
          title: 'Remove Admin', 
          icon: Shield, 
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/20',
          description: 'Revoke admin privileges from a user',
          confirmText: 'REMOVE',
          buttonText: 'Remove Admin',
        };
      case 'removePremium':
        return { 
          title: 'Remove Premium', 
          icon: Crown, 
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/20',
          description: 'Revoke premium status from a user',
          confirmText: 'REMOVE',
          buttonText: 'Remove Premium',
        };
      case 'stopUser':
        return { 
          title: 'Stop User', 
          icon: Power, 
          color: 'text-red-500',
          bgColor: 'bg-red-500/20',
          description: 'Disable all special permissions (user stays in system)',
          confirmText: 'STOP',
          buttonText: 'Stop User',
        };
      case 'deleteUser':
        return { 
          title: 'Delete User', 
          icon: Trash2, 
          color: 'text-destructive',
          bgColor: 'bg-destructive/20',
          description: 'Permanently remove user from system',
          confirmText: 'DELETE',
          buttonText: 'Delete User',
        };
      default:
        return null;
    }
  };

  const config = getActionConfig();
  if (!config) return null;

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedUserId || confirmText !== config.confirmText) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing
    
    switch (action) {
      case 'addAdmin':
        addAdmin(selectedUserId);
        toast.success(`${selectedUser?.username} is now an Admin`);
        break;
      case 'addPremium':
        addPremium(selectedUserId);
        toast.success(`${selectedUser?.username} is now Premium`);
        break;
      case 'removeAdmin':
        removeAdmin(selectedUserId);
        toast.success(`Admin removed from ${selectedUser?.username}`);
        break;
      case 'removePremium':
        removePremium(selectedUserId);
        toast.success(`Premium removed from ${selectedUser?.username}`);
        break;
      case 'stopUser':
        stopUser(selectedUserId);
        toast.success(`${selectedUser?.username} has been stopped`);
        break;
      case 'deleteUser':
        deleteUser(selectedUserId);
        toast.success(`${selectedUser?.username} has been deleted`);
        break;
    }
    
    setIsProcessing(false);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUserId(null);
    setConfirmText('');
    setStep('select');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                  <config.icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{config.title}</h2>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'select' ? (
                <>
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary outline-none"
                    />
                  </div>

                  {/* User List */}
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredUsers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No users found</p>
                    ) : (
                      filteredUsers.map(u => (
                        <motion.button
                          key={u.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectUser(u.id)}
                          className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary text-left flex items-center gap-4"
                        >
                          <img src={u.avatar} alt="" className="w-10 h-10 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{u.username}</p>
                            <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                          </div>
                          <div className="flex gap-2">
                            {u.role === 'admin' && (
                              <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">Admin</span>
                            )}
                            {u.isPremium && (
                              <span className="premium-badge text-xs py-0.5">Premium</span>
                            )}
                            {u.status === 'stopped' && (
                              <span className="px-2 py-0.5 text-xs rounded bg-gray-500/20 text-gray-400">Stopped</span>
                            )}
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Confirmation */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
                      <AlertTriangle className={`w-8 h-8 ${config.color}`} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">
                      Confirm {config.title}
                    </h3>
                    <p className="text-muted-foreground">
                      Are you sure you want to {action?.replace(/([A-Z])/g, ' $1').toLowerCase()} for:
                    </p>
                    <div className="mt-4 p-4 rounded-xl bg-secondary/50 flex items-center gap-4">
                      <img src={selectedUser?.avatar} alt="" className="w-12 h-12 rounded-full" />
                      <div className="text-left">
                        <p className="font-bold">{selectedUser?.username}</p>
                        <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Input */}
                  <div className="mb-6">
                    <label className="block text-sm text-muted-foreground mb-2">
                      Type <span className="font-bold text-foreground">{config.confirmText}</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={e => setConfirmText(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl bg-secondary outline-none text-center font-mono tracking-widest"
                      placeholder={config.confirmText}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('select')}
                      className="flex-1 py-3 rounded-xl bg-secondary hover:bg-secondary/80 font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={confirmText !== config.confirmText || isProcessing}
                      className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                        confirmText === config.confirmText
                          ? `${config.bgColor} ${config.color} hover:opacity-80`
                          : 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <config.icon className="w-5 h-5" />
                          {config.buttonText}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
