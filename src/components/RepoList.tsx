import { useEffect, useState } from "react";
import { Repo } from "@/types/github";

interface RepoListProps {
  username: string;
}

const RepoList = ({ username }: RepoListProps) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = {
          Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
        };

        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
          headers,
        });

        const data = await res.json();

        if (!Array.isArray(data)) {
          setError(data.message || "Something went wrong");
          return;
        }

        setRepos(data);
      } catch (err) {
        console.error("Error fetching repos", err);
        setError("Failed to fetch repositories");
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [username]);

  if (loading) return <p>Loading repositories...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (repos.length === 0) return <p>No repositories found.</p>;
};

export default RepoList;
