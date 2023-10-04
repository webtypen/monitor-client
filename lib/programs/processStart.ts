import { ProcessService } from "../services/ProcessService";
import { printProcessStatus } from "./processStatus";

export const processStartProgram = async (processKey: string) => {
    if (!processKey || processKey.trim() === "") {
        throw new Error("Missing process-key ...");
    }

    try {
        const { log } = console;
        const service = new ProcessService();
        const pid = service.processStart(processKey);
        log("Process '" + processKey + "' started on PID " + pid + ":");
    } catch (e) {
        console.error(e);
    }

    printProcessStatus();
};
