"use client";
import { useState, useEffect } from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
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

  return (
    <div>{ session && <>

      <p>Welcome {session.user?.name}!</p>
      <button onClick={() => signOut()}>Sign out</button>

      <h1>Repos</h1>
      <ul>
        {repos.map((repo) => (
          <li key={repo.id}>
            {repo.name}
          </li>
        ))}
      </ul>

    </>}</div>  );

}