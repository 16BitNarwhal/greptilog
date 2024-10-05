import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import axios from 'axios';
interface GithubRepo {
  owner: {
    login: string;
  };
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  commits_url: string;
  changelogs: Changelog[];
};

const reposHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const repos: Repo[] = response.data.map((repo: GithubRepo) => ({
        ...repo,
        owner: repo.owner.login.toLowerCase(),
      }));
      return res.status(200).json(repos);
    } catch (error) {
      console.error('Error fetching repositories', error);
      return res.status(500).json({ message: 'Error fetching repositories' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default reposHandler;
