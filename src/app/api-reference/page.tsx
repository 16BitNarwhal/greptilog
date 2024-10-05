import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ApiReferencePage = () => {
  const exampleRequest = `GET /api/changelogs?owner={owner}&name={name}`;
  const exampleResponse = `{
  "data": [
    {
      "version": "v1.0.0",
      "timestamp": "2023-10-05T12:34:56Z",
      "title": "Initial Release",
      "md_content": "# Changelog\\n- Initial release with basic features."
    },
    {
      "version": "v1.1.0",
      "timestamp": "2023-11-10T08:15:30Z",
      "title": "Bug Fixes and Improvements",
      "md_content": "# Changelog\\n- Fixed bugs\\n- Improved performance."
    }
  ]
}`;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">API Reference</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">How to retrieve changelogs</p>
      </div>
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900">Endpoint</h2>
          <p className="mt-1 text-sm text-gray-500">
            To retrieve changelogs, send a GET request to the following endpoint:
          </p>
          <code className="block bg-gray-100 text-gray-900 p-2 rounded mt-2">
            {exampleRequest}
          </code>
          <p className="mt-2 text-sm text-gray-500">
            Replace <code>{'{owner}'}</code> and <code>{'{name}'}</code> with the appropriate values.
          </p>
        </div>

        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Response</h2>
          <p className="mt-1 text-sm text-gray-500">A successful request returns a JSON object with the following structure:</p>
          <pre className="bg-gray-100 text-gray-900 p-4 rounded mt-2 overflow-auto">
            {exampleResponse}
          </pre>
        </div>

        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Fields</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]} className="mt-2 prose prose-sm sm:prose lg:prose-lg xl:prose-xl">
            {`
- **version** (string): The version identifier of the changelog entry.
- **timestamp** (string): The date and time the changelog entry was created, in ISO 8601 format.
- **title** (string): The title of the changelog entry.
- **md_content** (string): The changelog details in Markdown format.
            `}
          </ReactMarkdown>
        </div>

        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Example Usage</h2>
          <p className="mt-1 text-sm text-gray-500">Here's an example of how to use this endpoint in JavaScript:</p>
          <pre className="bg-gray-100 text-gray-900 p-4 rounded mt-2 overflow-auto">
            {`
// Example: Fetch changelogs for a repository
const owner = 'ownerName';
const name = 'repoName';

fetch(\`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/changelogs?owner=\${owner}&name=\${name}\`)
  .then(response => response.json())
  .then(data => console.log(data));
            `}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ApiReferencePage;
