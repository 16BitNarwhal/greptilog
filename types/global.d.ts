declare global {
    type Repo = {
        id: number;
        name: string;
        full_name: string;
        html_url: string;
        commits_url: string;
    };
}

export {};