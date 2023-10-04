import fs from "fs";
import lodash from "lodash";

class ConfigServiceWrapper {
    config = null;

    load() {
        const mainPath = __dirname + "/../../config.json";
        if (!fs.existsSync(mainPath)) {
            fs.copyFileSync(__dirname + "/../../config.default.json", mainPath);
        }

        if (!fs.existsSync(mainPath)) {
            throw new Error("Missing main-config file ...");
        }

        const json = JSON.parse(fs.readFileSync(mainPath, "utf-8"));
        if (json && json.config && json.config.trim() !== "") {
            this.config = JSON.parse(fs.readFileSync(json.config, "utf-8"));
        } else {
            this.config = json;
        }
        return this;
    }

    get() {
        return this.config;
    }

    set(key: string, value?: any) {
        if (!this.config) {
            throw new Error("No config loaded ...");
        }

        lodash.set(this.config, key, value);
        return this;
    }

    saveMain() {
        if (!this.config) {
            throw new Error("No config loaded ...");
        }

        fs.writeFileSync(__dirname + "/../../config.json", JSON.stringify(this.config, null, 4));
        return this;
    }
}

export const ConfigService = new ConfigServiceWrapper();
