"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const axios_1 = __importDefault(require("axios"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const child = __importStar(require("child_process"));
const process_1 = require("process");
const ConfigService_1 = require("./services/ConfigService");
if (!process_1.argv[2] || process_1.argv[2].trim() === "") {
    process.exit();
}
const optionsString = Buffer.from(process_1.argv[2], "base64").toString();
const options = optionsString && optionsString.trim() !== "" ? JSON.parse(optionsString) : null;
if (!options ||
    !options.command ||
    options.command.trim() === "" ||
    !options.processKey ||
    options.processKey.trim() === "") {
    process.exit();
}
function sendError(errorString) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = ConfigService_1.ConfigService.get();
        axios_1.default
            .post(ConfigService_1.ConfigService.getApiUrl("/api/processes/log/error"), {
            _server: config.server,
            process_key: options.processKey,
            error: errorString,
        })
            .then(() => { })
            .catch(() => { });
    });
}
function start() {
    // fs.appendFileSync(__dirname + "/../test.txt", "Start at : " + moment().format("YYYY-MM-DD HH:mm:ss") + "\n");
    const childProcess = child.spawn(options.command, {
        shell: true,
    });
    const pid = childProcess.pid;
    childProcess.stderr.on("data", function (data) {
        if (!options || !options.errors) {
            return;
        }
        let count = 0;
        let status = false;
        const filename = (0, moment_timezone_1.default)().format("YYYY-MM-DD_HHmmss");
        const path = __dirname + "/../log/";
        if (!fs_1.default.existsSync(path)) {
            fs_1.default.mkdirSync(path, { recursive: true });
        }
        while (status === false) {
            if (!fs_1.default.existsSync(path + filename + (count > 0 ? "-" + count.toString() : "") + ".txt")) {
                status = false;
                break;
            }
            else {
                count++;
            }
        }
        fs_1.default.writeFileSync(path + filename + (count > 0 ? "-" + count.toString() : "") + ".txt", JSON.stringify({
            process: options.processKey,
            date: (0, moment_timezone_1.default)().format("YYYY-MM-DD HH:mm:ss"),
            error: data.toString(),
        }));
    });
    childProcess.on("exit", (code, signal) => {
        if (options && options.restart) {
            setTimeout(() => {
                start();
            }, options.restartTimeout && parseInt(options.restartTimeout) > 0 ? parseInt(options.restartTimeout) : 1000);
        }
    });
}
start();
