import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, Flame, PanelTop, Zap } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { Post as PostComponent } from '../components/Post';
import { useAuth } from '../context/AuthContext';

enum SortOption {
  HOT = 'hot',
  NEW = 'new',
  TOP = 'top',
}

export const HomePage: React.FC = () => {
  const { posts, loading, votePost } = usePosts();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.HOT);

  const handleVote = async (postId: string, userId: string, value: number) => {
    if (!authState.user) {
      navigate('/login');
      return;
    }
    
    await votePost(postId, userId, value);
  };

  const getSortedPosts = () => {
    if (!posts) return [];
    
    const postsCopy = [...posts];
    
    switch (sortOption) {
      case SortOption.HOT:
        // A simple algorithm for "hot" - considering both votes and recency
        return postsCopy.sort((a, b) => {
          const aScore = a.votes * 0.7 + (new Date(a.created_at).getTime() / 1000) * 0.3;
          const bScore = b.votes * 0.7 + (new Date(b.created_at).getTime() / 1000) * 0.3;
          return bScore - aScore;
        });
      case SortOption.NEW:
        return postsCopy.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case SortOption.TOP:
        return postsCopy.sort((a, b) => b.votes - a.votes);
      default:
        return postsCopy;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                sortOption === SortOption.HOT
                  ? 'bg-orangered text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } transition-colors duration-200 mr-2`}
              onClick={() => setSortOption(SortOption.HOT)}
            >
              <Flame className="h-4 w-4 mr-1" />
              <span>Hot</span>
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                sortOption === SortOption.NEW
                  ? 'bg-orangered text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } transition-colors duration-200 mr-2`}
              onClick={() => setSortOption(SortOption.NEW)}
            >
              <Zap className="h-4 w-4 mr-1" />
              <span>New</span>
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                sortOption === SortOption.TOP
                  ? 'bg-orangered text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } transition-colors duration-200 mr-2`}
              onClick={() => setSortOption(SortOption.TOP)}
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>Top</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-10 space-y-3 flex flex-col items-center">
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <PanelTop className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first to share something interesting!
            </p>
            <button
              onClick={() => navigate('/submit')}
              className="px-4 py-2 bg-orangered text-white rounded-full hover:bg-orange-600 transition-colors duration-200"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {getSortedPosts().map((post) => (
              <PostComponent key={post.id} post={post} onVote={handleVote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};