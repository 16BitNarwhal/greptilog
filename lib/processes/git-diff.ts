import { execSync } from "child_process";

export const getGitDiff = (hashes: string[]): string => {
	const setupCommands = [
		"git fetch",
		"git checkout main",
		"git pull",
	];

	try {
		setupCommands.forEach((command) => {
			execSync(command, { encoding: "utf8" });
		});

		let gitCommand = "git diff";

		if (hashes.length === 1) {
			gitCommand += ` ${hashes[0]}`;
		} else if (hashes.length === 2) {
			gitCommand += ` ${hashes[0]} ${hashes[1]}`;
		}

		const output = execSync(gitCommand, { encoding: "utf8" });
		return output;
	} catch (error) {
		console.error("Error running git diff command:", error);
		throw new Error("Failed to get git diff output");
	}
};

