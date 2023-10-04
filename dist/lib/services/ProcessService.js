"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessService = void 0;
const fs_1 = __importDefault(require("fs"));
const child = __importStar(require("child_process"));
class ProcessService {
    getStatus(processId) {
        const pid = processId ? processId : this.getProcessPid();
        if (pid) {
            const running = this.checkProcess(pid);
            if (running) {
                return ProcessService.STATUS_RUNNING;
            }
        }
        return ProcessService.STATUS_STOPPED;
    }
    start() {
        const childProcess = child.spawn("ts-node", ["./lib/runner.ts"], {
            detached: true,
            stdio: "ignore",
        });
        childProcess.unref();
        fs_1.default.writeFileSync("./PROCESS", JSON.stringify({ pid: childProcess.pid }));
        return childProcess.pid;
    }
    stop() {
        const pid = this.getProcessPid();
        if (pid && this.getStatus(pid)) {
            process.kill(pid, 1);
        }
    }
    checkProcess(pid) {
        try {
            process.kill(pid, 0);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    getProcessPid() {
        if (fs_1.default.existsSync("./PROCESS")) {
            let json = JSON.parse(fs_1.default.readFileSync("./PROCESS", "utf-8"));
            if (json && json.pid && parseInt(json.pid) > 0) {
                return parseInt(json.pid);
            }
        }
        return null;
    }
}
exports.ProcessService = ProcessService;
ProcessService.STATUS_STOPPED = "stopped";
ProcessService.STATUS_RUNNING = "running";
