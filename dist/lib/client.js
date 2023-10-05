"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const configPath_1 = require("./programs/configPath");
const processRestart_1 = require("./programs/processRestart");
const processStart_1 = require("./programs/processStart");
const processStatus_1 = require("./programs/processStatus");
const processStop_1 = require("./programs/processStop");
const run_1 = require("./programs/run");
const start_1 = require("./programs/start");
const status_1 = require("./programs/status");
const stop_1 = require("./programs/stop");
const version_1 = require("./programs/version");
const ConfigService_1 = require("./services/ConfigService");
class Client {
    boot() {
        return __awaiter(this, void 0, void 0, function* () {
            ConfigService_1.ConfigService.load();
            const program = process.argv && process.argv[2] && process.argv[2].trim() !== ""
                ? process.argv[2].trim().toLowerCase()
                : null;
            if (!program || program === "version" || program === "-v" || program === "--version") {
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
            else if (program === "process.status") {
                (0, processStatus_1.processStatusProgram)();
            }
            else if (program === "process.start") {
                (0, processStart_1.processStartProgram)(process.argv[3]);
            }
            else if (program === "process.restart") {
                (0, processRestart_1.processRestartProgram)(process.argv[3]);
            }
            else if (program === "process.stop") {
                yield (0, processStop_1.processStopProgram)(process.argv[3]);
            }
        });
    }
}
exports.Client = Client;
