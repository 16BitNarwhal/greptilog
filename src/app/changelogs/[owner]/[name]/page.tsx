// src/app/changelogs/[owner]/[name]/page.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';

const ChangelogPage = async ({ params }: { params: { owner: string; name: string } }) => {
  const { owner, name } = params;

  const baseURL = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/changelogs`;
  const response = await axios.get(`${baseURL}?owner=${owner}&name=${name}`);
  const changelogs: Changelog[] = response.data.data;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Repository changelogs</p>
      </div>
      <div className="border-t border-gray-200">
        {changelogs.length === 0 ? (
          <p className="px-4 py-5 sm:px-6 text-gray-500">No changelogs have been created for this repository</p>
        ) : (
          changelogs
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((log, index) => (
              <div key={index} className="px-4 py-5 sm:px-6 border-b border-gray-200 last:border-b-0">
                <h2 className="text-2xl font-bold text-gray-900">{log.version}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{log.title}</h3>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="mt-2 prose prose-sm sm:prose lg:prose-lg xl:prose-xl"
                >
                  {log.md_content}
                </ReactMarkdown>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ChangelogPage;