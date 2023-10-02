import fs from "fs";
import * as child from "child_process";

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

        fs.writeFileSync("./PROCESS", JSON.stringify({ pid: childProcess.pid }));
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
        if (fs.existsSync("./PROCESS")) {
            let json = JSON.parse(fs.readFileSync("./PROCESS", "utf-8"));
            if (json && json.pid && parseInt(json.pid) > 0) {
                return parseInt(json.pid);
            }
        }
        return null;
    }
}
