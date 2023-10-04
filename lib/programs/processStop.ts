import { ProcessService } from "../services/ProcessService";
import { printProcessStatus } from "./processStatus";

export const processStopProgram = async (processKey: string) => {
    if (!processKey || processKey.trim() === "") {
        throw new Error("Missing process-key ...");
    }

    try {
        const { log } = console;
        const service = new ProcessService();
        await service.processStop(processKey);
        log("Process '" + processKey + "' stopped.");
    } catch (e) {
        console.error(e);
    }

    printProcessStatus();
};
