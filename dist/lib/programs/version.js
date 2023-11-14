"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionProgram = void 0;
const fs_1 = __importDefault(require("fs"));
const ConfigService_1 = require("../services/ConfigService");
const versionProgram = () => {
    const { log } = console;
    const path = process.env._ && process.env._.indexOf("/bin/ts-node") > 0
        ? __dirname + "/../../package.json"
        : __dirname + "/../../../package.json";
    const packageJson = JSON.parse(fs_1.default.readFileSync(path, "utf-8"));
    log("Installed version: " + packageJson.version + " (" + packageJson.name + ")");
    const apiUrl = ConfigService_1.ConfigService.getApiUrl();
    if (apiUrl && apiUrl.trim() !== "https://monitoring-api.webtypen.de") {
        log("   - Use custom api: ");
    }
};
exports.versionProgram = versionProgram;
