import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import axios from 'axios';

const commitsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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
      const page = req.query.page || 1;
      const perPage = req.query.per_page || 10;
      const since = req.query.since;
      const until = req.query.until;
      const url = `https://api.github.com/repositories/${repo_id}/commits?page=${page}&per_page=${perPage}`
        + (since ? `&since=${since}` : '')
        + (until ? `&until=${until}` : '');

      const response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching commits', error);
      return res.status(500).json({ message: 'Error fetching commits' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default commitsHandler;

