import fs from "fs";
import axios from "axios";
import moment from "moment-timezone";
import Client from "ssh2-sftp-client";
import * as child from "child_process";
import { ConfigService } from "../services/ConfigService";

export const MongoDB_Backup_Action = async (payload: any) => {
    if (!payload) {
        throw new Error("Missing payload ...");
    }

    if (!payload.config) {
        throw new Error("Missing config ...");
    }

    if (!payload.config.database || payload.config.database.trim() === "") {
        throw new Error("Missing database name ...");
    }

    ConfigService.load();
    const config: any = ConfigService.get();
    if (!config || !config.server || config.server.trim() === "") {
        throw new Error("Missing server config ...");
    }

    const backupName = (
        payload.config.filename ? payload.conftig.filename : "backup" + (payload.config.gzip ? ".gzip" : ".mongodump")
    )
        .replaceAll("{date}", moment().format("YYYY-MM-DD"))
        .replaceAll("{time}", moment().format("HH-mm"))
        .replaceAll("{database}", payload.config.database)
        .replaceAll("{runId}", payload.runId);
    const backupPath = __dirname + "/../../temp/" + payload.runId + "/" + backupName;

    await new Promise<void>((resolve, reject) => {
        if (!fs.existsSync(__dirname + "/../../temp/" + payload.runId)) {
            fs.mkdirSync(__dirname + "/../../temp/" + payload.runId, { recursive: true });
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
            } else if (signal) {
                return reject();
            }
            resolve();
        });
    });

    // fs.writeFileSync(backupPath, "TEST");
    if (!fs.existsSync(backupPath)) {
        throw new Error("Backup '" + backupPath + "' not found ...");
    }

    let configRequest: any = null;
    try {
        configRequest = await axios.post(
            ConfigService.getApiUrl("/api/upload"),
            {
                serverid: config.server,
                upload_type: "backup",
                filename: moment().format("YYYY-MM-DD") + "_mongodb_backup.gzip",
            },
            {
                headers: {
                    "Content-Type": "application/json", // Wichtig: Setzen Sie den Content-Type richtig
                },
            }
        );
    } catch (e: any) {
        console.error(e);
    }

    const uploadConfig: any =
        configRequest && configRequest.data && configRequest.data.status === "success" && configRequest.data.data
            ? configRequest.data.data
            : null;
    if (
        !uploadConfig ||
        !uploadConfig._id ||
        !uploadConfig.ssh ||
        !uploadConfig.ssh.token ||
        uploadConfig.ssh.token.trim() === ""
    ) {
        throw new Error("Could not load upload config ....");
    }

    const sftp = new Client();
    const status = await new Promise((resolve) => {
        const token = JSON.parse(Buffer.from(uploadConfig.ssh.token, "base64").toString("utf-8"));
        if (
            !token ||
            !token.d ||
            !token.h ||
            !token.u ||
            !token.k ||
            token.d.trim() === "" ||
            token.h.trim() === "" ||
            token.u.trim() === "" ||
            token.k.trim() === ""
        ) {
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

    const handleError = async () => {
        try {
            axios.post(ConfigService.getApiUrl("/api/upload/error"), {
                serverid: config.server,
                _id: uploadConfig._id,
            });
        } catch (e) {
            console.error(e);
        }
    };

    if (!status) {
        await handleError();
        throw new Error("Error while uploading the backup ...");
    }

    let response = null;
    try {
        response = await axios.post(ConfigService.getApiUrl("/api/upload/finish"), {
            serverid: config.server,
            _id: uploadConfig._id,
        });
    } catch (e) {
        console.error(e);
    }

    if (payload.config && payload.config.moveBackup && payload.config.moveBackup.trim() !== "") {
        if (fs.existsSync(backupPath)) {
            fs.renameSync(backupPath, payload.config.moveBackup.trim());
        }
    }

    if (!payload.config || !payload.config.keepBackup) {
        if (fs.existsSync(__dirname + "/../../temp/" + payload.runId)) {
            fs.rmSync(__dirname + "/../../temp/" + payload.runId, { recursive: true });
        }
    }

    if (
        response &&
        response.data &&
        response.data.status === "success" &&
        response.data.data &&
        response.data.data._id
    ) {
        console.log("Backup successfully created and uploaded ...");
    } else {
        console.log("Backup failed ...");
    }
};
