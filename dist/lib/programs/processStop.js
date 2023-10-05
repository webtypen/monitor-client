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
exports.processStopProgram = void 0;
const ProcessService_1 = require("../services/ProcessService");
const processStatus_1 = require("./processStatus");
const processStopProgram = (processKey) => __awaiter(void 0, void 0, void 0, function* () {
    if (!processKey || processKey.trim() === "") {
        throw new Error("Missing process-key ...");
    }
    try {
        const { log } = console;
        const service = new ProcessService_1.ProcessService();
        yield service.processStop(processKey);
        log("Process '" + processKey + "' stopped.");
    }
    catch (e) {
        console.error(e);
    }
    (0, processStatus_1.printProcessStatus)();
});
exports.processStopProgram = processStopProgram;
