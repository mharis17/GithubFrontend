export interface Commit {
  _id: string;
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  repository_name: string;
  repository_uuid: string;
  branch: string;
  author_uuid: string;
  author_name: string;
  author_login: string;
  html_url: string;
  repository_id: string;
  organization_id: string;
  integration_id: string;
  created_at_db: string;
  updated_at_db: string;
} 