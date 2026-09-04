export interface AuthSession {
  [key: string]: unknown;
}

export interface AuthUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

export interface AuthSession {
  authenticated: boolean;
  user: AuthUser | null;
}
