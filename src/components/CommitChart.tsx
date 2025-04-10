  import axios from "axios";
import { useEffect, useState } from "react";
  import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
  } from "recharts";

  interface CommitChartProps {
    username: string;
  }

  interface RepoMeta {
    name: string;
    stargazers_count: number;
    forks_count: number;
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const CommitChart = ({ username }: CommitChartProps) => {
    const [dailyCommits, setDailyCommits] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingCommits, setLoadingCommits] = useState(true);
    const [totalRepos, setTotalRepos] = useState<number | null>(null);
    const [topRepos, setTopRepos] = useState<RepoMeta[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Helper function: fetch with retry for 202 responses (data not ready yet)
    // const fetchCommitStatsWithRetry = async (url: string, headers: any, retries = 3) => {
    //   for (let i = 0; i < retries; i++) {
    //     const res = await fetch(url, { headers });
    //     if (res.status === 202) {
    //       await new Promise((r) => setTimeout(r, 1500));
    //     } else {
    //       try {
    //         return await res.json();
    //       } catch {
    //         return [];
    //       }
    //     }
    //   }
    //   return [];
    // };

    useEffect(() => {
      const fetchCommits = async () => {
        // Clear previous state before starting fetch
        setDailyCommits([]);
        setTopRepos([]);
        setError(null);
        
        setLoading(true);
        setLoadingCommits(true);

        if (!username) {
          setError("No username provided.");
          setLoading(false);
          setLoadingCommits(false);
          return;
        }

        try {
          const headers = {
            Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
          };

          // Fetch user info
          const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
          if (!userRes.ok) throw new Error("User not found");
          const userData = await userRes.json();
          setTotalRepos(userData.public_repos || 0);

          // Fetch repos for the given username
          const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
          const repos = await repoRes.json();
          if (!Array.isArray(repos)) throw new Error("Unexpected repos response");

          // Prepare a container for the commit counts for each weekday
          const allCommits = new Array(7).fill(0);
          // Select a subset of repositories (e.g. first 20) from current username
          const selectedRepos = repos.slice(0, 20);
          const repoMeta: RepoMeta[] = [];

          for (const repo of selectedRepos) {
            repoMeta.push({
              name: repo.name,
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
            });

            // Fetch commit activity stats for this repository
            const stats = await axios.get(
              `https://api.github.com/repos/${username}/${repo.name}/stats/commit_activity`,
              {

                headers
              }
            );
            // Use the latest week data (which is now the current week) only
            if (Array.isArray(stats) && stats.length > 0) {
              const currentWeek = stats[stats.length - 1];
              currentWeek.days.forEach((count: number, index: number) => {
                allCommits[index] += count;
              });
            }
          }

          setDailyCommits(allCommits);
          setTopRepos(repoMeta);
        } catch (err: any) {
          console.error("Error fetching commit activity", err);
          setError(err.message || "Something went wrong");
        } finally {
          setLoading(false);
          setLoadingCommits(false);
        }
      };

      fetchCommits();
    }, [username]);

    const chartData = dayLabels.map((day, i) => ({
      day,
      commits: dailyCommits[i] || 0,
    }));

    if (loading) return <p className="text-gray-500">Loading user data...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
      <div className="mt-8">
      
        {totalRepos !== null && (
          <div className="text-lg font-medium mb-2">
            Total Public Repositories: <span className="font-bold">{totalRepos}</span>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4">Weekly Commit Activity (Current Week)</h2>

        {loadingCommits ? (
          <p className="text-gray-500 mb-4">Fetching commit activity from repositories...</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="commits" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Top Repositories Analyzed</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 border-b">Repository</th>
                      <th className="p-3 border-b">⭐ Stars</th>
                      <th className="p-3 border-b">🍴 Forks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRepos.map((repo) => (
                      <tr key={repo.name} className="hover:bg-gray-50">
                        <td className="p-3 border-b">{repo.name}</td>
                        <td className="p-3 border-b">{repo.stargazers_count}</td>
                        <td className="p-3 border-b">{repo.forks_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  export default CommitChart;
