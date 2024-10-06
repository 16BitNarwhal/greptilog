# Greptilog

A site to generate changelogs from commits. Made for greptile technical challenge

## Create changelog
![image](https://github.com/user-attachments/assets/281242b3-2a44-4d82-ae0d-2bbeab0163b3)

This page allows selecting commits for generating a changelog via date range selection

I also made it paginated with the choice of displaying 10, 25, or 100 so users don't have to scroll down too much

## View & Edit changelogs
![image](https://github.com/user-attachments/assets/2e56bc44-5545-40e0-a18a-a1e9146a2d28)

This is shown automatically after generating a changelog so that developers can quickly review and modify the recently generated changelog or go back and edit previous ones too

Changelog content is all in markdown for easy editing

## Changelogs shown to use
![image](https://github.com/user-attachments/assets/15442780-57d0-493b-8304-fdb7a1fef877)

For developers who just want to generate a fast and quick changelog without worrying about making a site,
they can share this page (routed as `/changelog/{owner}/{repo_name}`) which already displays all the content for users.

## API Reference
![image](https://github.com/user-attachments/assets/b520c880-78dd-498e-84a1-0d2420ca6adc)
For developers to create their own page with changelogs generated from Greptilog, the page `/api-reference` is a quick and easy guide for grabbing all the changelogs for a repo.

```
GET /api/changelogs?owner={owner}&name={name}
```

## Run yourself:
```
git clone git@github.com:16BitNarwhal/greptilog.git
```

Add .env.local
```
OPENAI_API_KEY=...
NEXTAUTH_SECRET=...
MONGODB_URI=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=... 
```
Grab an openai api key [here](https://github.com/settings/developers)

To generate NEXTAUTH_SECRET, you can use `openssl rand -base64 32`

Get mongodb uri [here](https://www.mongodb.com/cloud/atlas/register)

For Github client ID and secret, go to [here](https://github.com/settings/developers) and create an OAuth app with both homepage and callback URL set to `http://localhost:3000/` (or whatever URL you run on)

```
npm i
npm run dev
```

## Extra comments
I used a NoSQL database for flexible fields (easy to change schema or if later down the line, I want to enable users to design their own). Changelogs are stored in the database under each Repo as a document keeping it easy to manage changelogs under a repo and new changelogs are pushed onto an array in the Repo document.

There's a technical challenge of getting all the diffs from each commit (not just the message), using `git diff --name-only <starting SHA> HEAD` then feed into GPT (or having too many commit messages).
Using the entire commit history of greptilog, I surpassed the OpenAI GPT-3.5 token limit by 10x. Currently I cap the diff to 1000 characters, but a solution I'd consider is to chunk each change and vector search with LLM-generated queries to generate more detailed changelogs.

With some more time, here are things I'd do:
- enable connection to links. previously I had GPT directly write hyperrefs in markdown content but it started hallucinating. instead, I'd have GPT write in numbers such as [0], [1] based on which commit they should link, then use regex to connect them to the commits
- the vercel deployment isn't working so fix that ;)

Made with: Next.js, MongoDB, Github OAuth
AI tools used: ChatGPT for general code generation, v0 for UI
