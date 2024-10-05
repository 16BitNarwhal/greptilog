import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/../pages/api/auth/[...nextauth]';
import { connectToDatabase } from '@/../lib/db/mongoose';
import { RepoModel } from '@/../lib/db/repoModel';
import { OpenAI } from 'openai/index.mjs';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const repo_id = req.query.id;
      if (!repo_id) {
        return res.status(400).json({ message: 'No repository ID provided' });
      }
      await connectToDatabase();
      // if repo not in db, create it
      if (!await RepoModel.exists({ id: repo_id })) {
        await RepoModel.create({ id: repo_id, changelogs: [] });
      }
      // // create new changelog
      // format commits + prompt
      const since = req.query.since;
      const until = req.query.until;
      const url = `https://api.github.com/repositories/${repo_id}/commits`
        + (since ? `&since=${since}` : '')
        + (until ? `&until=${until}` : '');
      const commits_response = await axios.get(url, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      const commits = commits_response.data as Commit[];
      const prompt = `Given the following commits, generate a friendly changelog in markdown for users. Make sure to use emojis and links:\n\n`
        + commits.map(commit => `- ${commit.commit.message} (${commit.html_url})`).join('\n');

      console.log("Making request to OpenAI...");
      const openai_response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const md_content = openai_response.choices[0]?.message.content?.trim();
      const changelog: Changelog = {
        timestamp: new Date(),
        version: req.query.version as string || '1.0.0',
        md_content: md_content || '',
        title: req.query.title as string,
        commits: commits,
      }
      console.log("Adding changelog to db...");
      // add changelog to db
      await RepoModel.findOneAndUpdate({ id: repo_id }, { $push: { changelogs: changelog } });

      // get latest changelog from db
      const repo = await RepoModel.findOne({ id: repo_id });
      const changelog_content = repo?.changelogs[repo.changelogs.length - 1].md_content;

      return res.status(200).json({ message: 'Changelog generated', data: changelog_content });
    } catch (error) {
      console.error('Error creating changelog', error);
      return res.status(500).json({ message: 'Error creating changelog' });
    }
  } else if (req.method === 'GET') {
    try {
      const repo_id = req.query.id;
      if (!repo_id) {
        return res.status(400).json({ message: 'No repository ID provided' });
      }
      await connectToDatabase();
      const repo = await RepoModel.findOne({ id: repo_id });
      const all_changelogs = repo?.changelogs || [];

      const use_links = req.body.use_links === 'true';
      if (!use_links) {
        all_changelogs.forEach((log: Changelog) => {
          // Remove markdown links like [title](link)
          log.md_content = log.md_content.replace(/\[([^\]]+)\]\((https?:\/\/[^\s]*github[^\s]*commit[^\s]*)\)/gi, '$1');

          // Remove standalone links (link) that contain "github" and "commit"
          log.md_content = log.md_content.replace(/\((https?:\/\/[^\s]*github[^\s]*commit[^\s]*)\)/gi, '');

          // Remove standalone links that are just text and contain "github" and "commit"
          log.md_content = log.md_content.replace(/https?:\/\/[^\s]*github[^\s]*commit[^\s]*/gi, '');
        });
      }

      return res.status(200).json({ message: 'Changelogs fetched', data: all_changelogs });
    } catch (error) {
      console.error('Error fetching changelogs', error);
      return res.status(500).json({ message: 'Error fetcing changelogs' });
    }
  } else if (req.method === 'PUT') {
    console.log('reeee');
    try {
      await connectToDatabase();
      const changelog_id = req.query.changelog_id;
      if (!changelog_id) {
        return res.status(400).json({ message: 'No changelog ID provided' });
      }
      console.log(changelog_id);
      const changelog = await RepoModel.findOne({ changelogs: { $elemMatch: { _id: changelog_id } } });
      if (!changelog) {
        return res.status(404).json({ message: 'Changelog not found' });
      }
      const { md_content } = req.body;
      if (!md_content) {
        return res.status(400).json({ message: 'No changelog content provided' });
      }

      changelog.changelogs.forEach((log: ChangelogWithId) => {
        if (log._id.toString() === changelog_id) {
          log.md_content = md_content;
        }
      })
      await changelog.save();
      return res.status(200).json({ message: 'Changelog updated' });
    } catch (error) {
      console.error('Error updating changelog', error);
      return res.status(500).json({ message: 'Error updating changelog' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default handler;
