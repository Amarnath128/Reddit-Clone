import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';
import { Comment } from '../types';
import { useAuth } from '../context/AuthContext';

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const { authState } = useAuth();
  const isAuthor = authState.user?.id === comment.user_id;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center mb-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-2">
          {comment.user?.avatar_url ? (
            <img 
              src={comment.user.avatar_url} 
              alt={comment.user.username} 
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
        <div>
          <div className="flex items-center">
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {comment.user?.username}
            </span>
            {isAuthor && (
              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                Author
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>
      <div className="text-gray-700 dark:text-gray-300 pl-10">
        {comment.content}
      </div>
    </div>
  );
};