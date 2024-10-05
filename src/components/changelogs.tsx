import { useState, useEffect } from 'react';
import axios from 'axios';
import { Session } from 'next-auth';
import ReactMarkdown from 'react-markdown';

interface ChangelogsProps {
  selectedRepo: { id: number; name: string; html_url: string } | null;
  session: Session;
  showCommits: boolean;
}

export default function Changelogs({ selectedRepo, session, showCommits}: ChangelogsProps) {
  const [changelogs, setChangelogs] = useState<ChangelogWithId[]>([]);
  const [editingChangelog, setEditingChangelog] = useState<ChangelogWithId | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedRepo) return;
    fetchChangelogs();
  }, [selectedRepo, session, showCommits]);

  const fetchChangelogs = async () => {
    setLoading(true);
    try {
      console.log('fetching changelogs');
      console.log(`/api/changelogs?id=${selectedRepo?.id}`);
      const response = await axios.get(`/api/changelogs?id=${selectedRepo?.id}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      setChangelogs(
        response.data.data.sort((a: ChangelogWithId, b: ChangelogWithId) => {
          const aDate = new Date(a.timestamp), bDate = new Date(b.timestamp);
          return bDate.getTime() - aDate.getTime();
        })
      );
    } catch (error) {
      console.error('Error fetching changelogs:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingChangelog) return;
    setLoading(true);
    try {
      await axios.put(`/api/changelogs?changelog_id=${editingChangelog._id}`, editingChangelog, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      setEditingChangelog(null);
      fetchChangelogs();
    } catch (error) {
      console.error('Error saving changelog:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Changelogs</h2>
      {loading ? (
        <div className="text-center">Loading changelogs...</div>
      ) : (
        <div className="space-y-8">
          {Array.isArray(changelogs) && changelogs.map((changelog) => (
            <div key={changelog._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {changelog.version} {changelog.title ? `- ${changelog.title}` : ''}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {new Date(changelog.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                {editingChangelog && editingChangelog?._id === changelog._id ? (
                  <div className="sm:p-6">
                    <textarea
                      value={editingChangelog.md_content}
                      onChange={(e) => setEditingChangelog({ ...editingChangelog, md_content: e.target.value })}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      rows={10}
                    />
                    <div className="mt-4">
                      <button
                        onClick={handleSave}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="sm:p-6">
                    <ReactMarkdown className="prose max-w-none">
                      {changelog.md_content}
                    </ReactMarkdown>
                    <div className="mt-4">
                      <button
                        onClick={() => setEditingChangelog(changelog)}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}