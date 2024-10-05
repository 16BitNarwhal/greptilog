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
      <div className="mb-4">
        <button
          onClick={handleCreateChangelog}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Generate changelog
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="since" className="block text-sm font-medium text-gray-700">Since:</label>
          <input
            type="datetime-local"
            id="since"
            value={since}
            onChange={(event) => setSince(event.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="until" className="block text-sm font-medium text-gray-700">Until:</label>
          <input
            type="datetime-local"
            id="until"
            value={until}
            onChange={(event) => setUntil(event.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="version" className="block text-sm font-medium text-gray-700">Version:</label>
          <input
            type="text"
            id="version"
            value={version}
            onChange={(event) => setVersion(event.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title (optional):</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="page" className="block text-sm font-medium text-gray-700">Page:</label>
        <input
          type="number"
          id="page"
          value={page}
          onChange={(event) => setPage(Math.min(Math.ceil(totalCommits/perPage), Math.max(1, parseInt(event.target.value, 10))))}
          className="mt-1 block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="mt-4">
        <span className="block text-sm font-medium text-gray-700">Commits per page:</span>
        <div className="mt-2 space-x-4">
          {[10, 25, 100].map((value) => (
            <label key={value} className="inline-flex items-center">
              <input
                type="radio"
                name="perPage"
                value={value}
                checked={perPage === value}
                onChange={() => setPerPage(value)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{value}</span>
            </label>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="mt-4 text-center">Loading commits...</div>
      ) : (
        <div className="mt-4 space-y-4">
          {commits.map((commit) => (
            <div key={commit.sha} className="border-t border-gray-200 pt-4">
              <a
                href={commit.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-600 hover:text-gray-900"
              >
                {commit.commit.message.split('\n').map((line, index) => (
                  <span key={index} className="block">{line}</span>
                ))}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}