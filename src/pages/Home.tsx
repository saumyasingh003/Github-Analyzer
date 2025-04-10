import { useState } from "react";
import { Search, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import RepoList from "../components/RepoList";
import CommitChart from "../components/CommitChart";

const Home = () => {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (username.trim()) {
      setSubmitted(false);
      setLoading(true);
      setTimeout(() => {
        setSubmitted(true);
        setLoading(false);
      }, 500); // simulate fetch delay
    }
  };

  return (
    <div className="min-h-screen flex  justify-center bg-gradient-to-br px-4 py-10">
      <Card className="w-full max-w-4xl shadow-2xl rounded-2xl">
        <div className="bg-blue-600 py-6 px-8 rounded-t-2xl">
          <div className="text-3xl sm:text-3xl font-extrabold text-white text-center">
            GitHub User Profile Analyzer
          </div>
        </div>

        <CardContent className="space-y-8 p-6 sm:p-8">
          {/* Input section */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSubmit}
              className="flex items-center gap-2 hover:cursor-pointer "
              disabled={loading}
              variant="destructive"
              color="black"
            >
              {loading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? "Loading" : "Analyze"}
            </Button>
          </div>

          {/* Result section */}
          {submitted && !loading && (
            <div className="space-y-6">
              <RepoList username={username} />
              <CommitChart username={username} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
