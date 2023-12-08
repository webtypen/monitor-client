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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessService = void 0;
const fs_1 = __importDefault(require("fs"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const ps_tree_1 = __importDefault(require("ps-tree"));
const child = __importStar(require("child_process"));
const ConfigService_1 = require("./ConfigService");
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
        const childProcess = process.env._ && process.env._.indexOf("/bin/ts-node") > 0
            ? child.spawn("ts-node", [__dirname + "/../runner.ts"], {
                detached: true,
                stdio: "ignore",
            })
            : child.spawn("node", [__dirname + "/../runner.js"], {
                detached: true,
                stdio: "ignore",
            });
        childProcess.unref();
        let data = {};
        if (fs_1.default.existsSync(__dirname + "/../../PROCESS")) {
            data = JSON.parse(fs_1.default.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
        }
        data.pid = childProcess.pid;
        fs_1.default.writeFileSync(__dirname + "/../../PROCESS", JSON.stringify(data));
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
        if (fs_1.default.existsSync(__dirname + "/../../PROCESS")) {
            let json = JSON.parse(fs_1.default.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
            if (json && json.pid && parseInt(json.pid) > 0) {
                return parseInt(json.pid);
            }
        }
        return null;
    }
    processesStatus() {
        const config = ConfigService_1.ConfigService.get();
        if (!config || !config.processes || Object.keys(config.processes).length < 1) {
            return [];
        }
        let processes = {};
        if (fs_1.default.existsSync(__dirname + "/../../PROCESS")) {
            let json = JSON.parse(fs_1.default.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
            if (json && json.processes) {
                processes = json.processes;
            }
        }
        let needsUpdate = false;
        const out = [];
        for (let key in config.processes) {
            let running = false;
            if (processes &&
                processes[key] &&
                processes[key].started_at &&
                processes[key].pid &&
                parseInt(processes[key].pid) > 0 &&
                this.checkProcess(parseInt(processes[key].pid))) {
                running = true;
                out.push({
                    key: key,
                    status: "running",
                    pid: parseInt(processes[key].pid),
                    started_at: processes[key].started_at,
                });
            }
            else {
                if (processes[key]) {
                    if (processes[key].status !== "stopped" || processes[key].started_at || processes[key].pid) {
                        processes[key].status = "stopped";
                        processes[key].started_at = null;
                        processes[key].pid = null;
                        needsUpdate = true;
                    }
                }
            }
            if (!running) {
                out.push({
                    key: key,
                    status: "stopped",
                });
            }
        }
        if (needsUpdate) {
            let data = {};
            if (fs_1.default.existsSync(__dirname + "/../../PROCESS")) {
                data = JSON.parse(fs_1.default.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
            }
            data.processes = processes;
            fs_1.default.writeFileSync(__dirname + "/../../PROCESS", JSON.stringify(data));
        }
        return out;
    }
    processStart(processKey) {
        const config = ConfigService_1.ConfigService.get();
        if (!config || !config.processes || !config.processes[processKey]) {
            throw new Error("Process '" + processKey + "' not found ...");
        }
        if (!config.processes[processKey].command || config.processes[processKey].command.trim() === "") {
            throw new Error("Process '" + processKey + "' has no configured command ...");
        }
        const status = this.processesStatus();
        if (status && status.length > 0) {
            for (let entry of status) {
                if (entry && entry.key === processKey && entry.status === "running") {
                    throw new Error("Process '" + processKey + "' is already running on PID " + entry.pid);
                }
            }
        }
        const command = Buffer.from(JSON.stringify({
            processKey: processKey,
            command: config.processes[processKey].command,
            restart: config.processes[processKey].restart ? true : false,
            restartTimeout: config.processes[processKey].restartTimeout
                ? config.processes[processKey].restartTimeout
                : null,
            errors: config.processes[processKey].errors ? true : false,
        })).toString("base64");
        const childProcess = process.env._ && process.env._.indexOf("/bin/ts-node") > 0
            ? child.spawn("ts-node", [__dirname + "/../process.ts", command], {
                detached: true,
                stdio: "ignore",
            })
            : child.spawn("node", [__dirname + "/../process.js", command], {
                detached: true,
                stdio: "ignore",
            });
        childProcess.unref();
        const pid = childProcess.pid;
        let data = {};
        if (fs_1.default.existsSync(__dirname + "/../../PROCESS")) {
            data = JSON.parse(fs_1.default.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
        }
        if (!data.processes) {
            data.processes = {};
        }
        data.processes[processKey] = {
            key: processKey,
            status: "running",
            pid: pid,
            started_at: (0, moment_timezone_1.default)().format("YYYY-MM-DD HH:mm:ss"),
        };
        fs_1.default.writeFileSync(__dirname + "/../../PROCESS", JSON.stringify(data));
        return pid;
    }
    processStop(processKey) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = {};
            if (fs_1.default.existsSync(__dirname + "/../../PROCESS")) {
                data = JSON.parse(fs_1.default.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
            }
            if (!data.processes || !data.processes[processKey]) {
                throw new Error("No processes running ...");
            }
            if (!data.processes[processKey].pid ||
                parseInt(data.processes[processKey].pid) < 1 ||
                !this.checkProcess(parseInt(data.processes[processKey].pid))) {
                throw new Error("Process '" + processKey + "' is not running ...");
            }
            try {
                let result = null;
                try {
                    result = yield new Promise((resolve, reject) => {
                        (0, ps_tree_1.default)(parseInt(data.processes[processKey].pid), (err, children) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(children);
                            }
                        });
                    });
                }
                catch (e) { }
                if (result && result.length > 0) {
                    for (let entry of result) {
                        if (!entry) {
                            continue;
                        }
                        const childPid = entry.PID ? entry.PID : entry.pid ? entry.pid : null;
                        if (childPid && parseInt(childPid) > 0) {
                            if (this.checkProcess(parseInt(childPid))) {
                                process.kill(parseInt(childPid), 1);
                            }
                        }
                        const ppid = entry.PPID ? entry.PPID : entry.ppid ? entry.ppid : null;
                        if (ppid && parseInt(ppid) > 0) {
                            if (this.checkProcess(parseInt(ppid))) {
                                process.kill(parseInt(ppid), 1);
                            }
                        }
                    }
                }
                try {
                    if (this.checkProcess(parseInt(data.processes[processKey].pid))) {
                        process.kill(parseInt(data.processes[processKey].pid), 1);
                    }
                }
                catch (e) { }
                return true;
            }
            catch (e) {
                console.error(e);
            }
            return false;
        });
    }
    processRestart(processKey) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = {};
            if (fs_1.default.existsSync(__dirname + "/../../PROCESS")) {
                data = JSON.parse(fs_1.default.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
                if (data.processes && data.processes[processKey]) {
                    if (data.processes[processKey].pid &&
                        parseInt(data.processes[processKey].pid) > 0 &&
                        this.checkProcess(parseInt(data.processes[processKey].pid))) {
                        try {
                            yield this.processStop(processKey);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
            try {
                yield this.processStart(processKey);
            }
            catch (e) {
                console.error(e);
                throw new Error(e);
            }
        });
    }
}
exports.ProcessService = ProcessService;
ProcessService.STATUS_STOPPED = "stopped";
ProcessService.STATUS_RUNNING = "running";
