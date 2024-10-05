declare global {
    type Repo = {
        id: number;
        name: string;
        full_name: string;
        html_url: string;
        commits_url: string;
    };

    type Commit = {
        sha: string;
        commit: {
            message: string;
        };
        html_url: string;
    };
}

export {};