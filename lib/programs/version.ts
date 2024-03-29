import fs from "fs";
import { ConfigService } from "../services/ConfigService";

export const versionProgram = () => {
    const { log } = console;
    const path =
        process.env._ && process.env._.indexOf("/bin/ts-node") > 0
            ? __dirname + "/../../package.json"
            : __dirname + "/../../../package.json";
    const packageJson = JSON.parse(fs.readFileSync(path, "utf-8"));
    log("Installed version: " + packageJson.version + " (" + packageJson.name + ")");

    const apiUrl = ConfigService.getApiUrl();
    if (apiUrl && apiUrl.trim() !== "https://monitoring-api.webtypen.de") {
        log("   - Use custom api: " + apiUrl.trim());
    }
};
