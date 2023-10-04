import { Console } from "console";
import { Transform } from "stream";
import { ProcessService } from "../services/ProcessService";

export const processStatusProgram = async () => {
    const { log } = console;
    log("Current state of defined processes:");
    printProcessStatus();
};

export const printProcessStatus = () => {
    const service = new ProcessService();
    const status = service.processesStatus();

    const table: any = [];
    for (let entry of status) {
        table.push({
            Key: entry.key,
            Status: entry.status,
            PID: entry.pid ? entry.pid : "-",
            "Started at": entry.started_at ? entry.started_at : "-",
        });
    }

    printTable(table);
};

function printTable(input: any) {
    const ts = new Transform({
        transform(chunk, enc, cb) {
            cb(null, chunk);
        },
    });
    const logger = new Console({ stdout: ts });
    logger.table(input);
    const table = (ts.read() || "").toString();
    let result = "";
    for (let row of table.split(/[\r\n]+/)) {
        let r = row.replace(/[^┬]*┬/, "┌");
        r = r.replace(/^├─*┼/, "├");
        r = r.replace(/│[^│]*/, "");
        r = r.replace(/^└─*┴/, "└");
        r = r.replace(/'/g, " ");
        result += `${r}\n`;
    }
    console.log(result);
}
