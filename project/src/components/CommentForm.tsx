import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface CommentFormProps {
  postId: string;
  onAddComment: (content: string, userId: string) => Promise<{ error?: any }>;
}

export const CommentForm: React.FC<CommentFormProps> = ({ postId, onAddComment }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user) {
      setError('You must be logged in to comment');
      return;
    }
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error } = await onAddComment(content, authState.user.id);
      
      if (error) {
        setError(error.message);
      } else {
        setContent('');
      }
    } catch (err) {
      setError('An error occurred while adding your comment');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authState.user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please <a href="/login" className="text-orangered hover:underline">sign in</a> to leave a comment
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <label htmlFor="comment" className="sr-only">
        Your comment
      </label>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Comment as <span className="text-orangered">{authState.user.username}</span>
          </h3>
        </div>
        <textarea
          id="comment"
          rows={4}
          className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 focus:ring-orangered focus:border-orangered"
          placeholder="What are your thoughts?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={`ml-auto px-4 py-2 bg-orangered text-white rounded-full font-medium ${
              isSubmitting || !content.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-orange-600'
            } transition-colors duration-200`}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>
    </form>
  );
};