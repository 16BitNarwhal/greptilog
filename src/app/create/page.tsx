"use client";
import { useState, useEffect } from "react";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Changelogs from "@/components/changelogs";
import Commits from "@/components/commits";

function CreateContent() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [showCommits, setShowCommits] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchRepos = async () => {
      const response = await axios.get('/api/repos', { headers: { Authorization: `Bearer ${session.accessToken}` } });
      setRepos(response.data);
    };
    fetchRepos();
  }, [session, status]);

  const handleSelectRepo = (value: string) => {
    const selectedRepo = repos.find((repo) => repo.id === parseInt(value));
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
                {showCommits ? (
                  <Commits selectedRepo={selectedRepo} session={session} onGenerateChangelog={onGenerateChangelog} />
                ) : <Changelogs selectedRepo={selectedRepo} session={session} showCommits={showCommits} />}
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