import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowBigDown, ArrowBigUp, MessageSquare, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post as PostType } from '../types';
import { useAuth } from '../context/AuthContext';
 
interface PostProps {
  post: PostType;
  onVote: (postId: string, userId: string, value: number) => Promise<void>;
}

export const Post: React.FC<PostProps> = ({ post, onVote }) => {
  const { authState } = useAuth();
  
  const handleVote = async (value: number) => {
    if (!authState.user) {
      // Redirect to login or show a message
      return;
    }
    
    await onVote(post.id, authState.user.id, value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Vote column */}
      <div className="flex">
        <div className="w-10 sm:w-12 flex flex-col items-center py-2 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={() => handleVote(1)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            disabled={!authState.user}
          >
            <ArrowBigUp className="h-6 w-6 text-gray-500 hover:text-orangered dark:text-gray-400" />
          </button>
          <span className="font-medium text-gray-800 dark:text-gray-200 my-1">{post.votes}</span>
          <button
            onClick={() => handleVote(-1)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            disabled={!authState.user}
          >
            <ArrowBigDown className="h-6 w-6 text-gray-500 hover:text-periwinkle dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-3">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <div className="flex items-center">
              {post.user?.avatar_url ? (
                <img
                  src={post.user.avatar_url}
                  alt={post.user.username}
                  className="h-5 w-5 rounded-full mr-1"
                />
              ) : (
                <User className="h-4 w-4 mr-1" />
              )}
              <Link
                to={`/user/${post.user?.username}`}
                className="font-medium text-gray-700 dark:text-gray-300 hover:underline mr-1"
              >
                u/{post.user?.username}
              </Link>
            </div>
            <span className="mx-1">•</span>
            <span>
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>

          <Link to={`/post/${post.id}`}>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2 hover:text-orangered dark:hover:text-orangered transition-colors duration-200">
              {post.title}
            </h2>
            <div className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
              {post.content}
            </div>
          </Link>

          <div className="flex items-center mt-2">
            <Link
              to={`/post/${post.id}`}
              className="flex items-center text-gray-500 dark:text-gray-400 hover:text-orangered dark:hover:text-orangered transition-colors duration-200"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-sm">{post.comment_count || 0} comments</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};