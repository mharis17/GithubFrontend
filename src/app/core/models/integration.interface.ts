export interface Integration {
  _id: string;
  github_id: number;
  username: string;
  display_name: string;
  email: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
} 