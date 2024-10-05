import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import axios from 'axios';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const repo_id = req.query.id;
      if (!repo_id) {
        return res.status(400).json({ message: 'No repository ID provided' });
      }
      const url = `https://api.github.com/repositories/${repo_id}/commits?page=1&per_page=1`;

      const response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}`, }, });
      const linkHeader = response.headers['link'];

      if (linkHeader) {
        const lastPageMatch = linkHeader.match(/<https:\/\/api\.github\.com\/repositories\/\d+\/commits\?page=(\d+)&per_page=\d+>; rel="last"/);

        if (lastPageMatch) {
          const lastPage = lastPageMatch[1];
          return res.status(200).json(lastPage);
        }
      }
      return res.status(200).json(1);
    } catch (error) {
      console.error('Error fetching commits', error);
      return res.status(500).json({ message: 'Error fetching commits' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default handler;

