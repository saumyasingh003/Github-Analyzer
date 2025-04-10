// types/github.ts

export interface Repo {
    id: number;
    name: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
  }
  
  export interface CommitActivity {
    days: number[];
    total: number;
    week: number;
  }
  