"use client";
import { useState, useEffect } from "react";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import axios from "axios";
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CreateContent() {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [showCommits, setShowCommits] = useState(true);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCommits, setTotalCommits] = useState(0);
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");

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

  useEffect(() => {
    if (!selectedRepo) return;
    if (!session) return;
    setLoading(true);
    const fetchCommits = async () => {
      const url = `/api/commits?id=${selectedRepo.id}&page=${page}&per_page=${perPage}` 
        + (since ? `&since=${since}` : '') 
        + (until ? `&until=${until}` : '');
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      setCommits(response.data);
    };
    const fetchTotalCommits = async () => {
      setLoading(true);
      const url = `/api/total-commits?id=${selectedRepo.id}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      setTotalCommits(response.data || 0);
    }
    const promise = Promise.all([fetchCommits(), fetchTotalCommits()]);
    promise.then(() => setLoading(false));
  }, [selectedRepo, page, perPage, since, until, session]);

  const handleSelectRepo = (value: string) => {
    const selectedRepo = repos.find((repo) => repo.id === parseInt(value));
    setSelectedRepo(selectedRepo || null);
  };

  const onGenerateChangelog = async () => {
    if (!selectedRepo) return;
    if (!session) return;
    setShowCommits(false);
  };

  const handleCreateChangelog = async () => {
    if (!selectedRepo) return;
    if (!session) return;
    setLoading(true);
    await axios.post(`/api/changelogs?id=${selectedRepo.id}`, { since, until, version, title }, { 
      headers: { Authorization: `Bearer ${session.accessToken}` },
      withCredentials: true,
    });
    setLoading(false);
    onGenerateChangelog();
  };

  if (status === "loading") {
    return <div className="text-center">Loading...</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="text-center">
        <p className="mb-4">Please sign in to access this page.</p>
        <Button onClick={() => signIn()}>Sign in</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Changelog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="repo-select">Select a repository</Label>
              <Select onValueChange={handleSelectRepo} value={selectedRepo?.id?.toString()}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a repo" />
                </SelectTrigger>
                <SelectContent>
                  {repos.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id.toString()}>
                      {repo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRepo && (
              <>
                <div>
                  <a
                    href={selectedRepo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View selected repo: {selectedRepo.name}
                  </a>
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button onClick={() => setShowCommits(true)} variant={showCommits ? "default" : "outline"}>
                      Commits
                    </Button>
                    <Button onClick={() => setShowCommits(false)} variant={!showCommits ? "default" : "outline"}>
                      Changelogs
                    </Button>
                  </div>
                  <a href={`/changelogs/${selectedRepo?.owner}/${selectedRepo?.name}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    <Button variant="outline" className="!bg-transparent">
                      View Result
                    </Button>
                  </a>
                </div>
                {showCommits && (
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
                      {commits.map((commit) => (
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
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
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