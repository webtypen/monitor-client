import { configPathProgram } from "./programs/configPath";
import { processStartProgram } from "./programs/processStart";
import { processStatusProgram } from "./programs/processStatus";
import { runProgram } from "./programs/run";
import { startProgram } from "./programs/start";
import { statusProgram } from "./programs/status";
import { stopProgram } from "./programs/stop";
import { versionProgram } from "./programs/version";
import { ConfigService } from "./services/ConfigService";

export class Client {
    boot() {
        ConfigService.load();
        const program =
            process.argv && process.argv[2] && process.argv[2].trim() !== ""
                ? process.argv[2].trim().toLowerCase()
                : null;

        if (!program || program === "version" || program === "-v" || program === "--version") {
            versionProgram();
        } else if (program === "status") {
            statusProgram();
        } else if (program === "start") {
            startProgram();
        } else if (program === "stop") {
            stopProgram();
        } else if (program === "config.path") {
            configPathProgram(process.argv[3]);
        } else if (program === "run") {
            runProgram(process.argv[3]);
        } else if (program === "process.status") {
            processStatusProgram();
        } else if (program === "process.start") {
            processStartProgram(process.argv[3]);
        } else if (program === "process.stop") {
            // runProgram(process.argv[3]);
        }
    }
}
