import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Comment {
  id: string;
  animeId: string;
  episodeId?: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  likes: string[];
  replies: Comment[];
  createdAt: number;
}

const COMMENTS_STORAGE_KEY = 'anicrew-comments';

export function useComments(animeId: string, episodeId?: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load comments from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (stored) {
      try {
        const allComments: Comment[] = JSON.parse(stored);
        const filtered = allComments.filter(c => 
          c.animeId === animeId && 
          (episodeId ? c.episodeId === episodeId : !c.episodeId)
        );
        setComments(filtered.sort((a, b) => b.createdAt - a.createdAt));
      } catch (e) {
        console.error('Failed to parse comments', e);
      }
    }
    setIsLoading(false);
  }, [animeId, episodeId]);

  const saveComments = useCallback((updatedComments: Comment[]) => {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    let allComments: Comment[] = stored ? JSON.parse(stored) : [];
    
    // Remove old comments for this anime/episode
    allComments = allComments.filter(c => 
      !(c.animeId === animeId && 
        (episodeId ? c.episodeId === episodeId : !c.episodeId))
    );
    
    // Add updated comments
    allComments = [...allComments, ...updatedComments];
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
  }, [animeId, episodeId]);

  const addComment = useCallback((content: string) => {
    if (!user || !content.trim()) return null;

    const newComment: Comment = {
      id: crypto.randomUUID(),
      animeId,
      episodeId,
      userId: user.id,
      username: user.username,
      avatar: user.avatar || '',
      content: content.trim(),
      likes: [],
      replies: [],
      createdAt: Date.now(),
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    saveComments(updated);
    
    return newComment;
  }, [user, animeId, episodeId, comments, saveComments]);

  const deleteComment = useCallback((commentId: string) => {
    if (!user) return;
    
    const updated = comments.filter(c => 
      !(c.id === commentId && c.userId === user.id)
    );
    setComments(updated);
    saveComments(updated);
  }, [user, comments, saveComments]);

  const likeComment = useCallback((commentId: string) => {
    if (!user) return;

    const updated = comments.map(c => {
      if (c.id === commentId) {
        const hasLiked = c.likes.includes(user.id);
        return {
          ...c,
          likes: hasLiked 
            ? c.likes.filter(id => id !== user.id)
            : [...c.likes, user.id]
        };
      }
      return c;
    });
    
    setComments(updated);
    saveComments(updated);
  }, [user, comments, saveComments]);

  const addReply = useCallback((commentId: string, content: string) => {
    if (!user || !content.trim()) return null;

    const reply: Comment = {
      id: crypto.randomUUID(),
      animeId,
      episodeId,
      userId: user.id,
      username: user.username,
      avatar: user.avatar || '',
      content: content.trim(),
      likes: [],
      replies: [],
      createdAt: Date.now(),
    };

    const updated = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, replies: [...c.replies, reply] };
      }
      return c;
    });
    
    setComments(updated);
    saveComments(updated);
    
    return reply;
  }, [user, animeId, episodeId, comments, saveComments]);

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    likeComment,
    addReply,
  };
}
