import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBigDown, ArrowBigUp, ArrowLeft, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { useComments } from '../hooks/useComments';
import { CommentList } from '../components/CommentList';
import { CommentForm } from '../components/CommentForm';

export const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const { comments, loading: commentsLoading, addComment } = useComments(postId || '');

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(id, username, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setPost(data as Post);
      setLoading(false);
    };

    fetchPost();

    // Set up real-time subscription
    const postSubscription = supabase
      .channel(`public:posts:id=eq.${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `id=eq.${postId}` }, async () => {
        await fetchPost();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postSubscription);
    };
  }, [postId]);

  const handleVote = async (value: number) => {
    if (!post || !authState.user) {
      navigate('/login');
      return;
    }
    
    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('post_id', post.id)
      .eq('user_id', authState.user.id)
      .single();

    // If vote exists and is the same value, remove the vote
    if (existingVote && existingVote.value === value) {
      await supabase.from('votes').delete().eq('id', existingVote.id);
      
      // Update post vote count
      await supabase.rpc('update_post_votes', { post_id: post.id });
      return;
    }

    // If vote exists but with different value, update it
    if (existingVote) {
      await supabase
        .from('votes')
        .update({ value })
        .eq('id', existingVote.id);
    } else {
      // If no vote exists, create one
      await supabase.from('votes').insert([
        { post_id: post.id, user_id: authState.user.id, value },
      ]);
    }

    // Update post vote count
    await supabase.rpc('update_post_votes', { post_id: post.id });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              {error || 'Post not found'}
            </h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-orangered text-white rounded-full hover:bg-orange-600 transition-colors duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orangered dark:hover:text-orangered mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 overflow-hidden">
          {/* Post header with voting */}
          <div className="flex">
            <div className="w-10 sm:w-12 flex flex-col items-center py-4 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => handleVote(1)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                disabled={!authState.user}
              >
                <ArrowBigUp className="h-6 w-6 text-gray-500 hover:text-orangered dark:text-gray-400" />
              </button>
              <span className="font-medium text-gray-800 dark:text-gray-200 my-2">{post.votes}</span>
              <button
                onClick={() => handleVote(-1)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                disabled={!authState.user}
              >
                <ArrowBigDown className="h-6 w-6 text-gray-500 hover:text-periwinkle dark:text-gray-400" />
              </button>
            </div>

            {/* Post content */}
            <div className="flex-1 p-6">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center">
                  {post.user?.avatar_url ? (
                    <img
                      src={post.user.avatar_url}
                      alt={post.user.username}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                  ) : (
                    <User className="h-5 w-5 mr-2" />
                  )}
                  <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                    u/{post.user?.username}
                  </span>
                </div>
                <span className="mx-1">•</span>
                <span>
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>
              
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {post.content}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Comments ({comments.length})
          </h2>
          <CommentForm postId={post.id} onAddComment={addComment} />
          <CommentList comments={comments} loading={commentsLoading} />
        </div>
      </div>
    </div>
  );
};