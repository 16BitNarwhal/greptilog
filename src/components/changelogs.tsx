import { useState, useEffect } from 'react';
import axios from 'axios';
import { Session } from 'next-auth';
import ReactMarkdown from 'react-markdown';

interface ChangelogsProps {
  selectedRepo: { id: number; name: string; html_url: string } | null;
  session: Session;
}

export default function Changelogs({ selectedRepo, session }: ChangelogsProps) {
  const [changelogs, setChangelogs] = useState<ChangelogWithId[]>([]);
  const [editingChangelog, setEditingChangelog] = useState<ChangelogWithId | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedRepo) return;
    fetchChangelogs();
  }, [selectedRepo, session]);

  const fetchChangelogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/changelogs?id=${selectedRepo?.id}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      // sort reverse chronologically
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
      fetchChangelogs(); // Refresh the list after saving
    } catch (error) {
      console.error('Error saving changelog:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Changelogs</h2>
      {loading && <div>Loading...</div>}
      {Array.isArray(changelogs) && changelogs.map((changelog) => (
        <div key={changelog._id}>
          {editingChangelog && editingChangelog?._id === changelog._id ? (
            <>
              <p>{new Date(changelog.timestamp).toLocaleString()}</p>
              <textarea
                value={editingChangelog.md_content}
                onChange={(e) => setEditingChangelog({ ...editingChangelog, md_content: e.target.value })}
              />
              <button onClick={handleSave}>Save Changes</button>
            </>
          ) : (
            <>
              <p>{new Date(changelog.timestamp).toLocaleString()}</p>
              <ReactMarkdown>{changelog.md_content}</ReactMarkdown>
              <button onClick={() => setEditingChangelog(changelog)}>Edit</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}