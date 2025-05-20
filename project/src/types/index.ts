export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  votes: number;
  comment_count: number;
  user?: User;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
  user?: User;
}

export interface Vote {
  id: string;
  post_id: string;
  user_id: string;
  value: number;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}