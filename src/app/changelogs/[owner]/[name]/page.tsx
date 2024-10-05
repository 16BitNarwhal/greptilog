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
		<div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
			<h1 className="text-3xl font-bold leading-tight">{name}</h1>
			<div className="mt-4 space-y-4">
				{changelogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log, index) => (
					<div key={index} className="border-b border-gray-200 py-4">
						<h2 className="text-2xl font-bold">{log.version}</h2>
						<p className="text-gray-600"><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</p>
						<h3 className="text-xl font-bold">{log.title}</h3>
						<ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl">
							{log.md_content}
						</ReactMarkdown>
					</div>
				))}
			</div>
		</div>
	);
};

export default ChangelogPage;

