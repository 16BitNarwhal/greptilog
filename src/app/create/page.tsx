"use client";
import { useState, useEffect } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import axios from "axios";

export default function Page() {
  return (
    <SessionProvider>
      <Content />
    </SessionProvider>
  );
}

function Content() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      if (status === "authenticated") {
        const response = await axios.get('/api/repos', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setRepos(response.data);
      }
    };
    fetchRepos();
  }, [session, status]);

  const handleSelectRepo = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRepoId = event.target.value;
    const selectedRepo = repos.find((repo) => repo.id === parseInt(selectedRepoId));
    setSelectedRepo(selectedRepo || null);
  };

  return (
    <div>{ session && <>

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
      {selectedRepo && <p>Currently selected repo: {selectedRepo.name}</p>}

    </>}</div>
  );

}
