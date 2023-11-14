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
exports.ActionsService = void 0;
const axios_1 = __importDefault(require("axios"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const HelperService_1 = require("./HelperService");
const ActionsRegistry_1 = require("./ActionsRegistry");
const ConfigService_1 = require("./ConfigService");
class ActionsService {
    getActions() {
        const config = ConfigService_1.ConfigService.get();
        return config && config.actions && Object.keys(config.actions).length > 0 ? config.actions : null;
    }
    runActionAutomation(config, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!config || !config.actions || Object.keys(config.actions).length < 1) {
                return;
            }
            for (let key in config.actions) {
                if (!config.actions[key] ||
                    !config.actions[key].type ||
                    !config.actions[key].automation ||
                    !config.actions[key].automation.mode) {
                    continue;
                }
                let run = false;
                if (config.actions[key].automation.mode === "daily") {
                    if (config.actions[key].automation.times && config.actions[key].automation.times.length > 0) {
                        for (let t of config.actions[key].automation.times) {
                            const time = t.length === 5 ? t + ":00" : t;
                            if (time === payload.time) {
                                run = true;
                                break;
                            }
                        }
                    }
                }
                if (run) {
                    this.runAction(key, config.actions[key]);
                }
            }
        });
    }
    runAction(actionKey, actionConfig, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const runId = (0, moment_timezone_1.default)().format("YYYYMMDDHHmmss") + "_" + HelperService_1.HelperService.randomString(12);
            const action = ActionsRegistry_1.ActionsRegistry.get(actionConfig.type);
            if (!action) {
                yield this.sendRunActionSignal(actionKey, runId, "failed", {
                    config: actionConfig,
                    message: "Action '" + (actionKey && actionKey.trim() !== "" ? actionKey : "undefined") + "' not found ...",
                });
                return;
            }
            yield this.sendRunActionSignal(actionKey, runId, "started", {
                config: actionConfig,
            });
            let logContent = "";
            const log = (msg) => {
                logContent += msg;
            };
            let status = false;
            let hasError = false;
            let message = null;
            try {
                status = yield action({ key: actionKey, config: actionConfig, runId: runId, log: log });
            }
            catch (e) {
                if (options && options.debug) {
                    console.error(e);
                }
                hasError = true;
                if (e && e.toString() && e.toString().trim() !== "") {
                    message = e.toString();
                    logContent += logContent && logContent.trim() !== "" ? logContent + "\n" : "" + e.toString();
                }
            }
            if (!hasError && status) {
                yield this.sendRunActionSignal(actionKey, runId, "finished", { message: message, log: logContent });
            }
            else {
                yield this.sendRunActionSignal(actionKey, runId, "failed", { message: message, log: logContent });
            }
        });
    }
    sendRunActionSignal(actionKey, runId, status, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const config = ConfigService_1.ConfigService.get();
                yield axios_1.default.post(ConfigService_1.ConfigService.getApiUrl("/api/actions/signal"), {
                    action: actionKey,
                    run: runId,
                    status: status,
                    server: config.server,
                    payload: payload,
                });
            }
            catch (e) {
                console.error(e);
            }
        });
    }
}
exports.ActionsService = ActionsService;
