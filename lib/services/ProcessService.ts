import fs from "fs";
import * as child from "child_process";
import { ConfigService } from "./ConfigService";
import moment from "moment";

export class ProcessService {
    static STATUS_STOPPED = "stopped";
    static STATUS_RUNNING = "running";

    getStatus(processId?: number) {
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

        let data: any = {};
        if (fs.existsSync(__dirname + "/../../PROCESS")) {
            data = JSON.parse(fs.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
        }

        data.pid = childProcess.pid;
        fs.writeFileSync(__dirname + "/../../PROCESS", JSON.stringify(data));
        return childProcess.pid;
    }

    stop() {
        const pid = this.getProcessPid();
        if (pid && this.getStatus(pid)) {
            process.kill(pid, 1);
        }
    }

    checkProcess(pid: number) {
        try {
            process.kill(pid, 0);
            return true;
        } catch (e) {
            return false;
        }
    }

    getProcessPid() {
        if (fs.existsSync(__dirname + "/../../PROCESS")) {
            let json = JSON.parse(fs.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
            if (json && json.pid && parseInt(json.pid) > 0) {
                return parseInt(json.pid);
            }
        }
        return null;
    }

    processesStatus() {
        const config: any = ConfigService.get();
        if (!config || !config.processes || Object.keys(config.processes).length < 1) {
            return [];
        }

        let processes: any = {};
        if (fs.existsSync(__dirname + "/../../PROCESS")) {
            let json = JSON.parse(fs.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
            if (json && json.processes) {
                processes = json.processes;
            }
        }

        let needsUpdate = false;
        const out: any = [];
        for (let key in config.processes) {
            let running = false;
            if (
                processes &&
                processes[key] &&
                processes[key].started_at &&
                processes[key].pid &&
                parseInt(processes[key].pid) > 0 &&
                this.checkProcess(parseInt(processes[key].pid))
            ) {
                running = true;

                out.push({
                    key: key,
                    status: "running",
                    pid: parseInt(processes[key].pid),
                    started_at: processes[key].started_at,
                });
            } else {
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
            let data: any = {};
            if (fs.existsSync(__dirname + "/../../PROCESS")) {
                data = JSON.parse(fs.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
            }

            data.processes = processes;
            fs.writeFileSync(__dirname + "/../../PROCESS", JSON.stringify(data));
        }

        return out;
    }

    processStart(processKey: string) {
        const config: any = ConfigService.get();
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

        const childProcess = child.spawn(config.processes[processKey].command, {
            shell: true,
            detached: true,
            stdio: "ignore",
        });
        childProcess.unref();

        const pid = childProcess.pid;
        let data: any = {};
        if (fs.existsSync(__dirname + "/../../PROCESS")) {
            data = JSON.parse(fs.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
        }

        if (!data.processes) {
            data.processes = {};
        }
        data.processes[processKey] = {
            key: processKey,
            status: "running",
            pid: pid,
            started_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
        fs.writeFileSync(__dirname + "/../../PROCESS", JSON.stringify(data));

        return pid;
    }

    processStop(processKey: string) {
        let data: any = {};
        if (fs.existsSync(__dirname + "/../../PROCESS")) {
            data = JSON.parse(fs.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
        }

        if (!data.processes) {
            throw new Error("No processes running ...");
        }
    }
}
