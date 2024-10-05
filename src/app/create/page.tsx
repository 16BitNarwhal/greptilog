"use client";
import { useState, useEffect } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import axios from "axios";
import Commits from "@/components/commits";
import Changelogs from "@/components/changelogs";

export default function Page() {
  return (
    <SessionProvider>
      <Content />
    </SessionProvider>
  );
}

function Content() {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

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
    setSelectedRepo(selectedRepo); // trigger useEffects
  };

  return (
    <div>
      {loading && <div className="fixed inset-0 bg-gray-500 bg-opacity-50">
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-6xl text-white">Loading...</div>
        </div>
      </div>}
      { session && <>
        <p>Welcome {session.user?.name}!</p>
        <button onClick={() => signOut()}>Sign out</button>

        <h1>Repos</h1>
        <select onChange={handleSelectRepo} value={selectedRepo?.id || ""}>
          <option value="">Select a repo</option>
          {repos.map((repo) => (
            <option key={repo.id} value={repo.id}>
              {repo.name}
            </option>
          ))}
        </select>
        {selectedRepo && <>
          <a target="_blank" href={selectedRepo.html_url}>Currently selected repo: {selectedRepo.name}</a>
          <Commits selectedRepo={selectedRepo} session={session} onGenerateChangelog={onGenerateChangelog} />
          <Changelogs selectedRepo={selectedRepo} session={session} />
        </>}
      </>}
    </div>
  );
}