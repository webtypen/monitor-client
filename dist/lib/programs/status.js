"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusProgram = void 0;
const ProcessService_1 = require("../services/ProcessService");
const statusProgram = () => {
    const service = new ProcessService_1.ProcessService();
    const status = service.getStatus();
    if (status === "running") {
        const pid = service.getProcessPid();
        console.log("Running on port " + pid);
    }
    else {
        console.log("Current state: " + status);
    }
};
exports.statusProgram = statusProgram;
