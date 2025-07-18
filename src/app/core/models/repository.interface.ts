export interface Repository {
  _id: string;
  github_id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  owner: {
    login: string;
    github_id: number;
    avatar_url: string;
  };
  organization_id: string;
  integration_id: string;
  created_at_db: string;
  updated_at_db: string;
} 