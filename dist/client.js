"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configPath_1 = require("./lib/programs/configPath");
const run_1 = require("./lib/programs/run");
const start_1 = require("./lib/programs/start");
const status_1 = require("./lib/programs/status");
const stop_1 = require("./lib/programs/stop");
const version_1 = require("./lib/programs/version");
const ConfigService_1 = require("./lib/services/ConfigService");
ConfigService_1.ConfigService.load();
const program = process.argv && process.argv[2] && process.argv[2].trim() !== "" ? process.argv[2].trim().toLowerCase() : null;
if (!program || program === "version") {
    (0, version_1.versionProgram)();
}
else if (program === "status") {
    (0, status_1.statusProgram)();
}
else if (program === "start") {
    (0, start_1.startProgram)();
}
else if (program === "stop") {
    (0, stop_1.stopProgram)();
}
else if (program === "config.path") {
    (0, configPath_1.configPathProgram)(process.argv[3]);
}
else if (program === "run") {
    (0, run_1.runProgram)(process.argv[3]);
}
