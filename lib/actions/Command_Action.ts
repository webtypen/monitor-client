import { execSync } from "child_process";

export const Command_Action = async (payload: any) => {
    if (!payload) {
        throw new Error("Missing payload ...");
    }

    if (!payload.config) {
        throw new Error("Missing config ...");
    }

    if (!payload.config.command || payload.config.command.trim() === "") {
        throw new Error("Missing command-string ...");
    }

    try {
        const result: any = execSync(payload.config.command, { stdio: "pipe" }).toString();
        if (result && result.trim() !== "") {
            payload.log(result);
        }
        return true;
    } catch (e: any) {
        payload.log(e.toString());
    }
    return false;
};
