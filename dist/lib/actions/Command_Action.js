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
exports.Command_Action = void 0;
const child_process_1 = require("child_process");
const Command_Action = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload) {
        throw new Error("Missing payload ...");
    }
    if (!payload.config) {
        throw new Error("Missing config ...");
    }
    if (!payload.config.command || payload.config.command.trim() === "") {
        throw new Error("Missing command-string ...");
    }
    try {
        const result = (0, child_process_1.execSync)(payload.config.command, { stdio: "pipe" }).toString();
        if (result && result.trim() !== "") {
            payload.log(result);
        }
        return true;
    }
    catch (e) {
        payload.log(e.toString());
    }
    return false;
});
exports.Command_Action = Command_Action;
