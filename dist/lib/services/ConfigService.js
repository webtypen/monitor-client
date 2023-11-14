"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
class ConfigServiceWrapper {
    constructor() {
        this.config = null;
    }
    load() {
        const mainPath = __dirname + "/../../config.json";
        if (!fs_1.default.existsSync(mainPath)) {
            fs_1.default.copyFileSync(__dirname + "/../../config.default.json", mainPath);
        }
        if (!fs_1.default.existsSync(mainPath)) {
            throw new Error("Missing main-config file ...");
        }
        const json = JSON.parse(fs_1.default.readFileSync(mainPath, "utf-8"));
        if (json && json.config && json.config.trim() !== "") {
            this.config = JSON.parse(fs_1.default.readFileSync(json.config, "utf-8"));
        }
        else {
            this.config = json;
        }
        return this;
    }
    get() {
        return this.config;
    }
    getApiUrl(path) {
        if (!this.config) {
            this.load();
        }
        let apiBase = "https://monitoring-api.webtypen.de";
        if (this.config && this.config.api !== undefined && this.config.api && this.config.api.trim() !== "") {
            apiBase = this.config.api.trim();
        }
        return apiBase + (path ? path.trim() : "");
    }
    set(key, value) {
        if (!this.config) {
            throw new Error("No config loaded ...");
        }
        lodash_1.default.set(this.config, key, value);
        return this;
    }
    saveMain() {
        if (!this.config) {
            throw new Error("No config loaded ...");
        }
        fs_1.default.writeFileSync(__dirname + "/../../config.json", JSON.stringify(this.config, null, 4));
        return this;
    }
}
exports.ConfigService = new ConfigServiceWrapper();
