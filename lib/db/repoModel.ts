import mongoose, { Schema } from 'mongoose';

const changelogSchema = new Schema<Changelog>({
  timestamp: { type: Date, required: true },
  version: { type: String, required: true },
  md_content: { type: String, required: true },
  // changes: [
  //   {
  //     title: { type: String, required: true },
  //     type: { type: String },
  //     description: { type: String, required: true },
  //   },
  // ],
  title: { type: String },
});

const repoSchema = new Schema<Repo>({
  id: { type: Number, required: true },
  owner: { type: String, required: true },
  name: { type: String, required: true },
  changelogs: [changelogSchema],
});

export const RepoModel = mongoose.models.Repo || mongoose.model<Repo>('Repo', repoSchema);