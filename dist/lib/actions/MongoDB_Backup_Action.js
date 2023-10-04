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
exports.MongoDB_Backup_Action = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
const child = __importStar(require("child_process"));
const ConfigService_1 = require("../services/ConfigService");
const MongoDB_Backup_Action = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload) {
        throw new Error("Missing payload ...");
    }
    if (!payload.config) {
        throw new Error("Missing config ...");
    }
    if (!payload.config.database || payload.config.database.trim() === "") {
        throw new Error("Missing database name ...");
    }
    ConfigService_1.ConfigService.load();
    const config = ConfigService_1.ConfigService.get();
    if (!config || !config.server || config.server.trim() === "") {
        throw new Error("Missing server config ...");
    }
    const backupName = (payload.config.filename ? payload.conftig.filename : "backup" + (payload.config.gzip ? ".gzip" : ".mongodump"))
        .replaceAll("{date}", (0, moment_1.default)().format("YYYY-MM-DD"))
        .replaceAll("{time}", (0, moment_1.default)().format("HH-mm"))
        .replaceAll("{database}", payload.config.database)
        .replaceAll("{runId}", payload.runId);
    const backupPath = __dirname + "/../../temp/" + payload.runId + "/" + backupName;
    yield new Promise((resolve, reject) => {
        if (!fs_1.default.existsSync(__dirname + "/../../temp/" + payload.runId)) {
            fs_1.default.mkdirSync(__dirname + "/../../temp/" + payload.runId, { recursive: true });
        }
        const mongodump = child.spawn(payload.config && payload.config.binary ? payload.config.binary : "mongodump", [
            "--db=" + payload.config.database,
            payload.config.gzip ? "--gzip" : "",
            "--archive=" + backupPath,
        ]);
        mongodump.stdout.on("data", (data) => {
            payload.log(data);
        });
        mongodump.stderr.on("data", (data) => {
            payload.log(data);
        });
        mongodump.on("exit", (code, signal) => {
            if (code) {
                return reject();
            }
            else if (signal) {
                return reject();
            }
            resolve();
        });
    });
    // fs.writeFileSync(backupPath, "TEST");
    if (!fs_1.default.existsSync(backupPath)) {
        throw new Error("Backup '" + backupPath + "' not found ...");
    }
    let configRequest = null;
    try {
        configRequest = yield axios_1.default.post("https://monitoring-api.webtypen.de/api/upload", {
            serverid: config.server,
            upload_type: "backup",
            filename: (0, moment_1.default)().format("YYYY-MM-DD") + "_mongodb_backup.gzip",
        }, {
            headers: {
                "Content-Type": "application/json", // Wichtig: Setzen Sie den Content-Type richtig
            },
        });
    }
    catch (e) {
        console.error(e);
    }
    const uploadConfig = configRequest && configRequest.data && configRequest.data.status === "success" && configRequest.data.data
        ? configRequest.data.data
        : null;
    if (!uploadConfig ||
        !uploadConfig._id ||
        !uploadConfig.ssh ||
        !uploadConfig.ssh.token ||
        uploadConfig.ssh.token.trim() === "") {
        throw new Error("Could not load upload config ....");
    }
    const sftp = new ssh2_sftp_client_1.default();
    const status = yield new Promise((resolve) => {
        const token = JSON.parse(Buffer.from(uploadConfig.ssh.token, "base64").toString("utf-8"));
        if (!token ||
            !token.d ||
            !token.h ||
            !token.u ||
            !token.k ||
            token.d.trim() === "" ||
            token.h.trim() === "" ||
            token.u.trim() === "" ||
            token.k.trim() === "") {
        }
        sftp.connect({
            host: token.h,
            port: token.p && parseInt(token.p) > 0 ? parseInt(token.p) : 22,
            username: token.u,
            privateKey: token.k,
        })
            .then(() => {
            return sftp.put(backupPath, token.d);
        })
            .then(() => {
            resolve(true);
        })
            .catch((err) => {
            console.error("Fehler beim Hochladen der Datei:", err);
            resolve(false);
        })
            .finally(() => {
            sftp.end();
        });
    });
    const handleError = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            axios_1.default.post("https://monitoring-api.webtypen.de/api/upload/error", {
                serverid: config.server,
                _id: uploadConfig._id,
            });
        }
        catch (e) {
            console.error(e);
        }
    });
    if (!status) {
        yield handleError();
        throw new Error("Error while uploading the backup ...");
    }
    let response = null;
    try {
        response = yield axios_1.default.post("https://monitoring-api.webtypen.de/api/upload/finish", {
            serverid: config.server,
            _id: uploadConfig._id,
        });
    }
    catch (e) {
        console.error(e);
    }
    if (fs_1.default.existsSync(__dirname + "/../../temp/" + payload.runId)) {
        fs_1.default.rmSync(__dirname + "/../../temp/" + payload.runId, { recursive: true });
    }
    if (response &&
        response.data &&
        response.data.status === "success" &&
        response.data.data &&
        response.data.data._id) {
        console.log("Backup successfully created and uploaded ...");
    }
    else {
        console.log("Backup failed ...");
    }
});
exports.MongoDB_Backup_Action = MongoDB_Backup_Action;
