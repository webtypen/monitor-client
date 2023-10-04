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
exports.SystemService = void 0;
const os_1 = __importDefault(require("os"));
const os_utils_1 = __importDefault(require("os-utils"));
const diskusage_1 = require("diskusage");
class SystemService {
    getSystemData() {
        return __awaiter(this, void 0, void 0, function* () {
            const disk = yield (0, diskusage_1.check)("/");
            const memTotal = os_1.default.totalmem();
            const memFree = os_1.default.freemem();
            return {
                arch: process.arch,
                platform: process.platform,
                nodejs: {
                    version: process.versions.node,
                    openssl: process.versions.openssl,
                    v8: process.versions.v8,
                },
                disk: disk,
                memory: {
                    free: memFree,
                    total: memTotal,
                    usage: memTotal - memFree,
                },
                cpu: {
                    usage: yield this.getCpuUsage(),
                    count: os_utils_1.default.cpuCount(),
                },
            };
        });
    }
    getCpuUsage() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => os_utils_1.default.cpuUsage((value) => {
                resolve(value);
            }));
        });
    }
}
exports.SystemService = SystemService;
