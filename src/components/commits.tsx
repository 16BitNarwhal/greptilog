import { useState, useEffect } from 'react';
import axios from 'axios';
import { Session } from 'next-auth';

interface Commit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
  };
}

interface CommitsProps {
  selectedRepo: Repo | null;
  session: Session;
  onGenerateChangelog: () => void;
}

export default function Commits({ selectedRepo, session, onGenerateChangelog }: CommitsProps) {
  const [loading, setLoading] = useState(false);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [totalCommits, setTotalCommits] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!selectedRepo) return;
    const fetchTotalCommits = async () => {
      setLoading(true);
      const url = `/api/total-commits?id=${selectedRepo.id}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      setTotalCommits(response.data || 0);
      setLoading(false);
    }
    fetchTotalCommits();
  }, [selectedRepo, session]);

  useEffect(() => {
    if (!selectedRepo) return;
    const fetchCommits = async () => {
      setLoading(true);
      const url = `/api/commits?id=${selectedRepo.id}&page=${page}&per_page=${perPage}` 
        + (since ? `&since=${since}` : '') 
        + (until ? `&until=${until}` : '');
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      setCommits(response.data);
      setLoading(false);
    }
    fetchCommits();
  }, [selectedRepo, page, perPage, since, until, session]);

  const handleCreateChangelog = async () => {
    if (!selectedRepo) return;
    setLoading(true);
    await axios.post(`/api/changelogs?id=${selectedRepo.id}`, { since, until, version, title }, { 
      headers: { Authorization: `Bearer ${session.accessToken}` },
      withCredentials: true,
    });
    setLoading(false);
    onGenerateChangelog();
  }

  return (
    <div>
      {loading && <div>Loading...</div>}
      <button onClick={handleCreateChangelog}>Generate changelog</button>
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
        {[10, 25, 100].map((value) => (
          <label key={value} className="mx-2">
            <input type="radio" name="perPage" value={value} checked={perPage === value} onChange={() => setPerPage(value)} className="mr-1" />
            {value}
          </label>
        ))}
      </div>
      <div className="flex items-center">
        <label htmlFor="version" className="mr-2">Version:</label>
        <input type="text" id="version" value={version} onChange={(event) => setVersion(event.target.value)} className="border px-2 py-1" />
      </div>
      <div className="flex items-center">
        <label htmlFor="title" className="mr-2">Title (optional):</label>
        <input type="text" id="title" value={title} onChange={(event) => setTitle(event.target.value)} className="border px-2 py-1" />
      </div>
      <div>
        {commits.map((commit) => (
          <div key={commit.sha} className="mt-4">
            <a target="_blank" href={commit.html_url} className="block">
              {commit.commit.message
                .split('\n')
                .map((line, index) => <span key={index} style={{ display: 'block' }}>{line}</span>)}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
