import fs from "fs";
import moment from "moment-timezone";
import pstree from "ps-tree";
import * as child from "child_process";
import { ConfigService } from "./ConfigService";

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
        const childProcess =
            process.env._ && process.env._.indexOf("/bin/ts-node") > 0
                ? child.spawn("ts-node", [__dirname + "/../runner.ts"], {
                      detached: true,
                      stdio: "ignore",
                  })
                : child.spawn("node", [__dirname + "/../runner.js"], {
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

    async processStop(processKey: string) {
        let data: any = {};
        if (fs.existsSync(__dirname + "/../../PROCESS")) {
            data = JSON.parse(fs.readFileSync(__dirname + "/../../PROCESS", "utf-8"));
        }

        if (!data.processes || !data.processes[processKey]) {
            throw new Error("No processes running ...");
        }

        if (
            !data.processes[processKey].pid ||
            parseInt(data.processes[processKey].pid) < 1 ||
            !this.checkProcess(parseInt(data.processes[processKey].pid))
        ) {
            throw new Error("Process '" + processKey + "' is not running ...");
        }

        try {
            let result: any = null;
            try {
                result = await new Promise((resolve, reject) => {
                    pstree(parseInt(data.processes[processKey].pid), (err, children) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(children);
                        }
                    });
                });
            } catch (e) {}

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
            } catch (e) {}

            return true;
        } catch (e) {
            console.error(e);
        }
        return false;
    }

    async processRestart(processKey: string) {
        let data: any = {};
        if (fs.existsSync(__dirname + "/../../PROCESS")) {
            data = JSON.parse(fs.readFileSync(__dirname + "/../../PROCESS", "utf-8"));

            if (data.processes && data.processes[processKey]) {
                if (
                    data.processes[processKey].pid &&
                    parseInt(data.processes[processKey].pid) > 0 &&
                    this.checkProcess(parseInt(data.processes[processKey].pid))
                ) {
                    try {
                        await this.processStop(processKey);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }

        return await this.processStart(processKey);
    }
}
