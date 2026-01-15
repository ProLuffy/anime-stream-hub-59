import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, MessageCircle, Trash2, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useComments, Comment } from '@/hooks/useComments';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  animeId: string;
  episodeId?: string;
}

function CommentCard({ 
  comment, 
  onLike, 
  onDelete, 
  onReply,
  currentUserId 
}: { 
  comment: Comment; 
  onLike: () => void; 
  onDelete: () => void;
  onReply: (content: string) => void;
  currentUserId?: string;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const hasLiked = currentUserId && comment.likes.includes(currentUserId);

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 rounded-xl bg-secondary/30"
    >
      <div className="flex gap-3">
        <img
          src={comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`}
          alt={comment.username}
          className="w-10 h-10 rounded-full bg-secondary"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.username}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-foreground/90 break-words">{comment.content}</p>
          
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={onLike}
              className={`flex items-center gap-1 text-xs transition-colors ${
                hasLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className="w-3.5 h-3.5" fill={hasLiked ? 'currentColor' : 'none'} />
              {comment.likes.length > 0 && comment.likes.length}
            </button>
            
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Reply
            </button>
            
            {currentUserId === comment.userId && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reply input */}
          <AnimatePresence>
            {showReplyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-background/50 border border-border focus:outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-3 pl-4 border-l border-border space-y-3">
              {comment.replies.map(reply => (
                <div key={reply.id} className="flex gap-2">
                  <img
                    src={reply.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.username}`}
                    alt={reply.username}
                    className="w-7 h-7 rounded-full bg-secondary"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">{reply.username}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="text-xs text-foreground/90">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CommentSection({ animeId, episodeId }: CommentSectionProps) {
  const { user, isLoggedIn } = useAuth();
  const { comments, isLoading, addComment, deleteComment, likeComment, addReply } = useComments(animeId, episodeId);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Comments ({comments.length})
      </h3>

      {/* Comment input */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
            alt="Your avatar"
            className="w-10 h-10 rounded-full bg-secondary"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:border-primary transition-colors"
            />
            <motion.button
              type="submit"
              disabled={!newComment.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-secondary/30 text-center">
          <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">Login to join the conversation</p>
          <Link to="/login" className="btn-ghost text-sm">
            Login
          </Link>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {comments.map(comment => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onLike={() => likeComment(comment.id)}
                onDelete={() => deleteComment(comment.id)}
                onReply={(content) => addReply(comment.id, content)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}
