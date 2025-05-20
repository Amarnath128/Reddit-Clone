import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';

export const SubmitPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  const { createPost } = usePosts();
  const navigate = useNavigate();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!authState.loading && !authState.user) {
      navigate('/login');
    }
  }, [authState, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user) {
      navigate('/login');
      return;
    }
    
    if (!title.trim()) {
      setError('Post title is required');
      return;
    }
    
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { post, error } = await createPost(title, content, authState.user.id);
      
      if (error) {
        setError(error.message);
      } else if (post) {
        navigate(`/post/${post.id}`);
      }
    } catch (err) {
      setError('An error occurred while creating your post');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authState.loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-6"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Create a post
          </h1>
          
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md flex">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
                placeholder="Title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orangered focus:border-orangered bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-end">
                {title.length}/300
              </div>
            </div>
            
            <div className="mb-6">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Text
              </label>
              <textarea
                id="content"
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Text (optional)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orangered focus:border-orangered bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mr-4 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-orangered text-white rounded-full ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600'
                } transition-colors duration-200`}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};