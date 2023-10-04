"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopProgram = void 0;
const ProcessService_1 = require("../services/ProcessService");
const stopProgram = () => {
    const service = new ProcessService_1.ProcessService();
    const status = service.getStatus();
    if (status !== ProcessService_1.ProcessService.STATUS_RUNNING) {
        console.log("Cannot stop. Current state: " + status);
        return;
    }
    console.log("Stopping ...");
    service.stop();
};
exports.stopProgram = stopProgram;
