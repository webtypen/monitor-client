import { startProgram } from "./lib/programs/start";
import { statusProgram } from "./lib/programs/status";
import { stopProgram } from "./lib/programs/stop";
import { versionProgram } from "./lib/programs/version";

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
}
