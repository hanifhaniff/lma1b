export interface User {
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  created_at: Date;
}

export interface UserFormData {
  username: string;
  password: string;
  email?: string;
  name?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
}
