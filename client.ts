import { configPathProgram } from "./lib/programs/configPath";
import { runProgram } from "./lib/programs/run";
import { startProgram } from "./lib/programs/start";
import { statusProgram } from "./lib/programs/status";
import { stopProgram } from "./lib/programs/stop";
import { versionProgram } from "./lib/programs/version";
import { ConfigService } from "./lib/services/ConfigService";

ConfigService.load();
const program =
    process.argv && process.argv[2] && process.argv[2].trim() !== "" ? process.argv[2].trim().toLowerCase() : null;

if (!program || program === "version") {
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
}
