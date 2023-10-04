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
exports.runProgram = void 0;
const ActionsService_1 = require("../services/ActionsService");
const ConfigService_1 = require("../services/ConfigService");
const runProgram = (actionKey) => __awaiter(void 0, void 0, void 0, function* () {
    if (!actionKey || actionKey.trim() === "") {
        throw new Error("Missing action key ...");
    }
    ConfigService_1.ConfigService.load();
    const config = ConfigService_1.ConfigService.get();
    if (!config) {
        throw new Error("Config not found ...");
    }
    if (!config.actions || !config.actions[actionKey]) {
        throw new Error("Unknown action '" + actionKey + "' ...");
    }
    const service = new ActionsService_1.ActionsService();
    try {
        yield service.runAction(actionKey, config.actions[actionKey], { debug: true });
    }
    catch (e) {
        console.error(e);
    }
});
exports.runProgram = runProgram;
