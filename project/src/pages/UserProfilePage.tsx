import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Post, User as UserType } from '../types';
import { Post as PostComponent } from '../components/Post';

export const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      
      // Fetch user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError) {
        setError('User not found');
        setLoading(false);
        return;
      }

      setUser(userData as UserType);

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error(postsError);
      } else {
        setPosts(postsData as Post[]);
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, [username]);

  const handleVote = async (postId: string, userId: string, value: number) => {
    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    // If vote exists and is the same value, remove the vote
    if (existingVote && existingVote.value === value) {
      await supabase.from('votes').delete().eq('id', existingVote.id);
      
      // Update post vote count
      await supabase.rpc('update_post_votes', { post_id: postId });
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
        { post_id: postId, user_id: userId, value },
      ]);
    }

    // Update post vote count
    await supabase.rpc('update_post_votes', { post_id: postId });

    // Refresh posts
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data as Post[]);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 animate-pulse">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              {error || 'User not found'}
            </h1>
            <Link
              to="/"
              className="px-4 py-2 bg-orangered text-white rounded-full hover:bg-orange-600 transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-4">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.username} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                u/{user.username}
              </h1>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>
                  Member since {format(new Date(user.created_at), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Posts
        </h2>

        {posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {user.username} hasn't posted anything yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostComponent
                key={post.id}
                post={{ ...post, user }}
                onVote={handleVote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};