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
const moment_1 = __importDefault(require("moment"));
const ActivitiesService_1 = require("./ActivitiesService");
const SystemService_1 = require("./SystemService");
class HeartbeatService {
    constructor() {
        this.lastHeartbeat = null;
    }
    sendHeartbeat(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.lastHeartbeat = (0, moment_1.default)();
            const systemService = new SystemService_1.SystemService();
            const data = {
                system: yield systemService.getSystemData(),
            };
            const activitiesService = new ActivitiesService_1.ActivitiesService();
            activitiesService.store("system.last_heartbeat", (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss"));
            try {
                yield axios_1.default.post("https://monitoring-api.webtypen.de/api/heartbeat", {
                    data: data,
                    server: config.server,
                });
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    needsHeartbeat(config, activities) {
        if (this.lastHeartbeat && (0, moment_1.default)().diff(this.lastHeartbeat, "seconds") < 5) {
            return false;
        }
        if (!activities || !activities.system || !activities.system.last_heartbeat) {
            return true;
        }
        const heartbeatTimeout = config && config.heartbeatInterval && parseInt(config.heartbeatInterval) > 0
            ? parseInt(config.heartbeatInterval)
            : 60;
        const diff = (0, moment_1.default)().diff((0, moment_1.default)(activities.system.last_heartbeat), "seconds");
        if (diff >= heartbeatTimeout) {
            return true;
        }
        return false;
    }
}
exports.HeartbeatService = HeartbeatService;
