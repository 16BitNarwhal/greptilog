"use client";
import { useState } from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

export default function Page() {
  return (
    <SessionProvider>
      <Content />
    </SessionProvider>
  );
}

function Content() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);

  const fetchRepos = async () => {
    fetch('/api/repos')
  }

  return (
    <div>
      { session ? 
      <>
        <p>Welcome {session.user?.name}!</p>
        <button onClick={() => signOut()}>Sign out</button>
      </> :
        <button onClick={() => signIn()}>Sign in</button>
      }
    </div>
  );

}