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
  const [totalCommits, setTotalCommits] = useState(0);

  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchRepos = async () => {
      const response = await axios.get('/api/repos', { headers: { Authorization: `Bearer ${session.accessToken}` } });
      setRepos(response.data);
    };
    fetchRepos();
  }, [session, status]);

  useEffect(() => {
    if (!selectedRepo) return;
    if (status !== "authenticated") return;
    const fetchTotalCommits = async () => {
      const url = `/api/total-commits?id=${selectedRepo.id}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      setTotalCommits(response.data || 0);
      console.log(response.data);
    }
    fetchTotalCommits();
  }, [selectedRepo])

  useEffect(() => {
    if (!selectedRepo) return;
    if (status !== "authenticated") return;
    const fetchCommits = async () => {

      const url = `/api/commits?id=${selectedRepo.id}&page=${page}&per_page=${perPage}` 
        + (since ? `&since=${since}` : '') 
        + (until ? `&until=${until}` : '');
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      setCommits(response.data);
    }
    fetchCommits();
  }, [selectedRepo, page, perPage, since, until]);

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
        <div className="flex items-center">
          <label htmlFor="since" className="mr-2">Since:</label>
          <input type="datetime-local" id="since" value={since} onChange={(event) => setSince(event.target.value)} className="border px-2 py-1" />
        </div>
        <div className="flex items-center">
          <label htmlFor="until" className="mr-2">Until:</label>
          <input type="datetime-local" id="until" value={until} onChange={(event) => setUntil(event.target.value)} className="border px-2 py-1" />
        </div>
        <div className="flex items-center">
          <label htmlFor="page" className="mr-2">Page:</label>
          <input type="number" id="page" value={page} onChange={(event) => setPage(Math.min(Math.ceil(totalCommits/perPage), Math.max(1, parseInt(event.target.value, 10))))} className="border px-2 py-1 w-12" />
        </div>
        <div className="flex items-center">
          <span className="mr-2">Commits per page:</span>
          <label>
            <input type="radio" name="perPage" value="10" checked={perPage === 10} onChange={() => setPerPage(10)} className="mr-1" />
            10
          </label>
          <label className="mx-2">
            <input type="radio" name="perPage" value="25" checked={perPage === 25} onChange={() => setPerPage(25)} className="mr-1" />
            25
          </label>
          <label>
            <input type="radio" name="perPage" value="100" checked={perPage === 100} onChange={() => setPerPage(100)} className="mr-1" />
            100
          </label>
        </div>
        <div>
          {commits.map((commit) => (
            <div key={commit.sha} className="mt-4">
              <a href={commit.html_url} className="block">
                {commit.commit.message
                  .split('\n')
                  .map((line, index) => <span key={index} style={{ display: 'block' }}>{line}</span>)}
              </a>
            </div>

          ))}
        </div>
      </>}

    </>}</div>
  );

}
