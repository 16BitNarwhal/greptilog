// src/app/create/page.tsx
"use client";
import { useState, useEffect } from "react";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import axios from "axios";
import Commits from "@/components/commits";
import Changelogs from "@/components/changelogs";

function CreateContent() {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [showCommits, setShowCommits] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchRepos = async () => {
      setLoading(true);
      const response = await axios.get('/api/repos', { headers: { Authorization: `Bearer ${session.accessToken}` } });
      setRepos(response.data);
      setLoading(false);
    };
    fetchRepos();
  }, [session, status]);

  const handleSelectRepo = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRepoId = event.target.value;
    const selectedRepo = repos.find((repo) => repo.id === parseInt(selectedRepoId));
    setSelectedRepo(selectedRepo || null);
  };

  const onGenerateChangelog = async () => {
    if (!selectedRepo) return;
    if (!session) return;
    setShowCommits(false);
  };

  if (status === "loading") {
    return <div className="text-center">Loading...</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="text-center">
        <p className="mb-4">Please sign in to access this page.</p>
        <button
          onClick={() => signIn()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Changelog</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Generate changelogs from your GitHub repositories</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        {loading ? (
          <div className="text-center">Loading repositories...</div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="repo-select" className="block text-sm font-medium text-gray-700">
                Select a repository
              </label>
              <select
                id="repo-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                onChange={handleSelectRepo}
                value={selectedRepo?.id || ""}
              >
                <option value="">Select a repo</option>
                {repos.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedRepo && (
              <>
                <div className="mb-4">
                  <a
                    href={selectedRepo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View selected repo: {selectedRepo.name}
                  </a>
                </div>
                <div className="mb-4">
                  <button
                    onClick={() => setShowCommits(true)}
                    className={`mr-2 px-4 py-2 border rounded-md ${
                      showCommits
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Commits
                  </button>
                  <button
                    onClick={() => setShowCommits(false)}
                    className={`px-4 py-2 border rounded-md ${
                      !showCommits
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Changelogs
                  </button>
                </div>
                {showCommits ? (
                  <Commits
                    selectedRepo={selectedRepo}
                    session={session}
                    onGenerateChangelog={onGenerateChangelog}
                  />
                ) : (
                  <Changelogs selectedRepo={selectedRepo} session={session} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <SessionProvider>
      <CreateContent />
    </SessionProvider>
  );
}