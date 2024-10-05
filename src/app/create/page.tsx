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
  const [commits, setCommits] = useState<Commit[]>([]);

  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");

  useEffect(() => {
    const fetchRepos = async () => {
      if (status !== "authenticated") return;
      const response = await axios.get('/api/repos', { headers: { Authorization: `Bearer ${session.accessToken}`, }, });
      setRepos(response.data);
    };
    fetchRepos();
  }, [session, status]);

  useEffect(() => {
    if (!selectedRepo) return;
    const fetchCommits = async () => {
      if (status !== "authenticated") return;

      const selectedRepoId = 492633739;
      const page = 0;
      const perPage = 10;
      const since = "2023-01-05T18:30:20Z";
      const until = "2023-01-05T18:30:40Z";

      const url = `/api/commits?_id=${selectedRepoId}&page=${page}&per_page=${perPage}?since=${since}&until=${until}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}`, }, });

      setCommits(response.data);
    }
    fetchCommits();
  }, [selectedRepo]);

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
      {selectedRepo && <>
        <a href={selectedRepo.html_url}>Currently selected repo: {selectedRepo.name}</a>
        <ul>
          {commits.map((commit) => (
            <a href={commit.html_url} key={commit.sha}>{commit.commit.message}</a>
          ))}
        </ul>
      </>}

    </>}</div>
  );

}
