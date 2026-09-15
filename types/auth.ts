export interface User {
  user_id: string;
  email: string;
  username?: string;
  display_name?: string;
  bio?: string | null;
  avatar_media_id?: string | null;
  followers_count?: number;
  following_count?: number;
  relationship?: string;
}

export interface SessionData {
  user_id: string;
  email: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message?: string;
  };
  message?: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}
