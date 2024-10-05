import { useState, useEffect } from 'react';
import axios from 'axios';

interface ChangelogWithId extends Changelog {
  _id: string;
}

interface ChangelogsProps {
  selectedRepo: { id: number; name: string; html_url: string } | null;
  session: any;
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
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      console.log(response.data.data);
      setChangelogs(response.data.data);
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
              <textarea
                value={editingChangelog.md_content}
                onChange={(e) => setEditingChangelog({ ...editingChangelog, md_content: e.target.value })}
              />
              <button onClick={handleSave}>Save Changes</button>
            </>
          ) : (
            <>
              <p>{changelog.md_content}</p>
              <button onClick={() => setEditingChangelog(changelog)}>Edit</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}