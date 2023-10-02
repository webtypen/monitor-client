import os from "os";
import osUtils from "os-utils";
import { check } from "diskusage";

export class SystemService {
    async getSystemData() {
        const disk = await check("/");

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
                free: os.freemem(),
                total: os.totalmem(),
            },
            cpu: {
                usage: await this.getCpuUsage(),
                count: osUtils.cpuCount(),
            },
        };
    }

    async getCpuUsage() {
        return new Promise((resolve) =>
            osUtils.cpuUsage((value: any) => {
                resolve(value);
            })
        );
    }
}
