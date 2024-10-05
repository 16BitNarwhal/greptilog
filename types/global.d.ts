declare global {
    type Repo = {
        id: number;
        owner: string;
        name: string;
        full_name: string;
        html_url: string;
        commits_url: string;
        changelogs: Changelog[];
    };

    type Commit = {
        sha: string;
        commit: {
            message: string;
        };
        html_url: string;
    };

    type Changelog = {
        timestamp: Date;
        version: string;
        md_content: string;
        // // alternative w/o markdown?
        // changes: {
        //     title: string;
        //     type?: string;
        //     description: string;
        // }[];
        title?: string;
        commits: Commit[];
    };

    interface ChangelogWithId extends Changelog {
        _id: string;
    }

}

export {};