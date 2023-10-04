"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startProgram = void 0;
const ProcessService_1 = require("../services/ProcessService");
const startProgram = () => {
    const service = new ProcessService_1.ProcessService();
    const status = service.getStatus();
    if (status !== ProcessService_1.ProcessService.STATUS_STOPPED) {
        console.log("Cannot start. Current state: " + status);
        return;
    }
    console.log("Starting ...");
    service.start();
};
exports.startProgram = startProgram;
