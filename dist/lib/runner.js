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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const HeartbeatService_1 = require("./services/HeartbeatService");
const ActionsService_1 = require("./services/ActionsService");
const ConfigService_1 = require("./services/ConfigService");
const heartbeatService = new HeartbeatService_1.HeartbeatService();
const actionsService = new ActionsService_1.ActionsService();
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    ConfigService_1.ConfigService.load();
    const date = (0, moment_1.default)().format("YYYY-MM-DD");
    const time = (0, moment_1.default)().format("HH:mm:ss");
    const activities = fs_1.default.existsSync(__dirname + "/../activities.json")
        ? JSON.parse(fs_1.default.readFileSync(__dirname + "/../activities.json", "utf-8"))
        : {};
    if (heartbeatService.needsHeartbeat(ConfigService_1.ConfigService.get(), activities)) {
        heartbeatService.sendHeartbeat(ConfigService_1.ConfigService.get());
    }
    actionsService.runActionAutomation(ConfigService_1.ConfigService.get(), { time: time, date: date });
});
setInterval(() => {
    run();
}, 1000);
run();
