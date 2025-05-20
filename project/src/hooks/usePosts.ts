import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../types';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setPosts(data as Post[]);
      setLoading(false);
    };

    fetchPosts();

    // Set up real-time subscription
    const postsSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, async () => {
        await fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
    };
  }, []);

  const createPost = async (title: string, content: string, userId: string) => {
    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, content, user_id: userId, votes: 0 }])
      .select();

    if (error) {
      setError(error.message);
      return { error };
    }

    return { post: data[0] as Post };
  };

  const votePost = async (postId: string, userId: string, value: number) => {
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
  };

  return {
    posts,
    loading,
    error,
    createPost,
    votePost,
  };
};