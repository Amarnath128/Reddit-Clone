import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Comment } from '../types';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(id, username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setComments(data as Comment[]);
      setLoading(false);
    };

    fetchComments();

    // Set up real-time subscription
    const commentsSubscription = supabase
      .channel(`public:comments:post_id=eq.${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, async () => {
        await fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
    };
  }, [postId]);

  const addComment = async (content: string, userId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ content, post_id: postId, user_id: userId }])
      .select();

    if (error) {
      setError(error.message);
      return { error };
    }

    // Update comment count on the post
    await supabase.rpc('update_comment_count', { post_id: postId });

    return { comment: data[0] as Comment };
  };

  return {
    comments,
    loading,
    error,
    addComment,
  };
};