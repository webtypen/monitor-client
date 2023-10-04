"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configPathProgram = void 0;
const ConfigService_1 = require("../services/ConfigService");
const configPathProgram = (path) => {
    const { log } = console;
    if (!path || path.trim() === "") {
        ConfigService_1.ConfigService.set("config", null);
        log("Reset config-path to default ...");
    }
    else {
        ConfigService_1.ConfigService.set("config", path.trim());
        log("New config-path: " + path.trim());
    }
    ConfigService_1.ConfigService.saveMain();
};
exports.configPathProgram = configPathProgram;
