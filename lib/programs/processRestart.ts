import { ProcessService } from "../services/ProcessService";
import { printProcessStatus } from "./processStatus";

export const processRestartProgram = async (processKey: string) => {
    if (!processKey || processKey.trim() === "") {
        throw new Error("Missing process-key ...");
    }

    try {
        const { log } = console;
        const service = new ProcessService();
        const pid = await service.processRestart(processKey);
        log("Process '" + processKey + "' restarted on PID " + pid + ":");
    } catch (e) {
        console.error(e);
    }

    printProcessStatus();
};
