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
exports.HeartbeatService = void 0;
const axios_1 = __importDefault(require("axios"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const ActivitiesService_1 = require("./ActivitiesService");
const SystemService_1 = require("./SystemService");
const ProcessService_1 = require("./ProcessService");
const ActionsService_1 = require("./ActionsService");
const ConfigService_1 = require("./ConfigService");
class HeartbeatService {
    constructor() {
        this.lastHeartbeat = null;
    }
    sendHeartbeat(config, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.lastHeartbeat = (0, moment_timezone_1.default)();
            const actionsService = new ActionsService_1.ActionsService();
            const systemService = new SystemService_1.SystemService();
            const processService = new ProcessService_1.ProcessService();
            const data = {
                system: yield systemService.getSystemData(),
                processes: processService.processesStatus(),
                actions: actionsService.getActions(),
            };
            const activitiesService = new ActivitiesService_1.ActivitiesService();
            activitiesService.store("system.last_heartbeat", (0, moment_timezone_1.default)().format("YYYY-MM-DD HH:mm:ss"));
            try {
                const result = yield axios_1.default.post(ConfigService_1.ConfigService.getApiUrl("/api/heartbeat"), {
                    _server: config.server,
                    data: data,
                });
                if (result && result.data && result.data.status === "success" && result.data.data) {
                    if (!options || !options.skipHandleResponse) {
                        yield this.handleHeartbeatResponse(config, result.data.data, {
                            systemService: systemService,
                            processService: processService,
                        });
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    needsHeartbeat(config, activities) {
        if (this.lastHeartbeat && (0, moment_timezone_1.default)().diff(this.lastHeartbeat, "seconds") < 5) {
            return false;
        }
        if (!activities || !activities.system || !activities.system.last_heartbeat) {
            return true;
        }
        const heartbeatTimeout = config && config.heartbeatInterval && parseInt(config.heartbeatInterval) > 0
            ? parseInt(config.heartbeatInterval)
            : 60;
        const diff = (0, moment_timezone_1.default)().diff((0, moment_timezone_1.default)(activities.system.last_heartbeat), "seconds");
        if (diff >= heartbeatTimeout) {
            return true;
        }
        return false;
    }
    handleHeartbeatResponse(config, response, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!response || !response._id) {
                return;
            }
            const systemService = options && options.systemService ? options.systemService : new SystemService_1.SystemService();
            const processService = options && options.processService ? options.processService : new ProcessService_1.ProcessService();
            // Processes Queue
            let needsNewHeartbeat = false;
            if (response.processes_actions_queue && Object.keys(response.processes_actions_queue).length > 0) {
                for (let processKey in response.processes_actions_queue) {
                    if (!response.processes_actions_queue[processKey] ||
                        !response.processes_actions_queue[processKey].action) {
                        continue;
                    }
                    let error = null;
                    try {
                        if (response.processes_actions_queue[processKey].action === "process.start") {
                            processService.processStart(processKey);
                        }
                        else if (response.processes_actions_queue[processKey].action === "process.restart") {
                            processService.processRestart(processKey);
                        }
                        else if (response.processes_actions_queue[processKey].action === "process.stop") {
                            yield processService.processStop(processKey);
                        }
                        else {
                            throw new Error("Unknown action-key '" + response.processes_actions_queue[processKey].action + "' ...");
                        }
                    }
                    catch (e) {
                        console.error(e);
                        error = e.toString();
                    }
                    needsNewHeartbeat = true;
                    try {
                        yield axios_1.default.post(ConfigService_1.ConfigService.getApiUrl("/api/heartbeat/processes/action-result"), {
                            _server: config.server,
                            process: processKey,
                            action: response.processes_actions_queue[processKey].action,
                            error: error,
                        });
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            if (needsNewHeartbeat) {
                yield this.sendHeartbeat(config, { skipHandleResponse: true });
            }
            // Actions Queue
            if (response.actions_queue && Object.keys(response.actions_queue).length > 0) {
                for (let actionKey in response.actions_queue) {
                    try {
                        yield axios_1.default.post(ConfigService_1.ConfigService.getApiUrl("/api/heartbeat/actions/started"), {
                            _server: config.server,
                            action: actionKey,
                        });
                    }
                    catch (e) {
                        console.error(e);
                    }
                    if (!actionKey) {
                        continue;
                    }
                    if (!config.actions || !config.actions[actionKey]) {
                        continue;
                    }
                    const service = new ActionsService_1.ActionsService();
                    try {
                        yield service.runAction(actionKey, config.actions[actionKey], { debug: true });
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
        });
    }
}
exports.HeartbeatService = HeartbeatService;
