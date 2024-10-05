declare global {
    type Repo = {
        id: number;
        name: string;
        full_name: string;
        commits_url: string;
    };
}

export {};