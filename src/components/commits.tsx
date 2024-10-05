import { useState, useEffect } from 'react';
import axios from 'axios';
import { Session } from 'next-auth';

import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
      const sinceDate = new Date(since);
      const untilDate = new Date(until);
      const url = `/api/commits?id=${selectedRepo.id}&page=${page}&per_page=${perPage}` 
        + (since ? `&since=${sinceDate}` : '') 
        + (until ? `&until=${untilDate}` : '');
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      setCommits(response.data);
      setLoading(false);
    }
    fetchCommits();
  }, [selectedRepo, page, perPage, since, until, session]);

  const handleCreateChangelog = async () => {
    if (!selectedRepo) return;
    setLoading(true);
    const sinceDate = new Date(since);
    const untilDate = new Date(until);
    await axios.post(`/api/changelogs?id=${selectedRepo.id}`, { sinceDate, untilDate, version, title }, { 
      headers: { Authorization: `Bearer ${session.accessToken}` },
      withCredentials: true,
    });
    setLoading(false);
    onGenerateChangelog();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="since">Since</Label>
          <Input
            type="datetime-local"
            id="since"
            value={since}
            onChange={(e) => setSince(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="until">Until</Label>
          <Input
            type="datetime-local"
            id="until"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="version">Version</Label>
          <Input
            type="text"
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleCreateChangelog}>Generate changelog</Button>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : commits.map((commit) => (
          <Card key={commit.sha}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{commit.commit.message.split('\n')[0]}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(commit.commit.author.date), 'PPpp')}
                  </p>
                </div>
                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  View on GitHub
                </a>
              </div>
              {commit.commit.message.split('\n').slice(1).join('\n').trim() && (
                <p className="mt-2 text-sm whitespace-pre-wrap">
                  {commit.commit.message.split('\n').slice(1).join('\n').trim()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil(totalCommits / perPage)}
        </span>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= Math.ceil(totalCommits / perPage)}
          variant="outline"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}