import fs from "fs";
import moment from "moment";
import * as child from "child_process";

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

    const backupName = (
        payload.config.filename ? payload.config.filename : "backup" + (payload.config.gzip ? ".gzip" : ".mongodump")
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

    if (!fs.existsSync(backupPath)) {
        throw new Error("Backup '" + backupPath + "' not found ...");
    }

    return true;
};
