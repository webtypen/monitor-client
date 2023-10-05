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
exports.printProcessStatus = exports.processStatusProgram = void 0;
const console_1 = require("console");
const stream_1 = require("stream");
const ProcessService_1 = require("../services/ProcessService");
const processStatusProgram = () => __awaiter(void 0, void 0, void 0, function* () {
    const { log } = console;
    log("Current state of defined processes:");
    (0, exports.printProcessStatus)();
});
exports.processStatusProgram = processStatusProgram;
const printProcessStatus = () => {
    const service = new ProcessService_1.ProcessService();
    const status = service.processesStatus();
    const table = [];
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
exports.printProcessStatus = printProcessStatus;
function printTable(input) {
    const ts = new stream_1.Transform({
        transform(chunk, enc, cb) {
            cb(null, chunk);
        },
    });
    const logger = new console_1.Console({ stdout: ts });
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
