import fs from "fs";
import moment from "moment-timezone";
import { HeartbeatService } from "./services/HeartbeatService";
import { ActionsService } from "./services/ActionsService";
import { ConfigService } from "./services/ConfigService";

moment.tz.setDefault("Europe/Berlin");

const heartbeatService = new HeartbeatService();
const actionsService = new ActionsService();

const run = async () => {
    ConfigService.load();

    const config: any = ConfigService.get();
    if (config && config.timezone && config.timezone.trim() !== "") {
        moment.tz.setDefault(config.timezone);
    }

    const date = moment().format("YYYY-MM-DD");
    const time = moment().format("HH:mm:ss");
    const activities = fs.existsSync(__dirname + "/../activities.json")
        ? JSON.parse(fs.readFileSync(__dirname + "/../activities.json", "utf-8"))
        : {};

    if (heartbeatService.needsHeartbeat(ConfigService.get(), activities)) {
        heartbeatService.sendHeartbeat(ConfigService.get());
    }
    actionsService.runActionAutomation(ConfigService.get(), { time: time, date: date });
};

setInterval(() => {
    try {
        run();
    } catch (e: any) {
        const logPath = __dirname + "/../temp/logs/";
        if (!fs.existsSync(logPath)) {
            fs.mkdirSync(logPath, { recursive: true });
        }

        fs.appendFileSync(
            logPath + "/" + moment("YYYY-MM-DD") + "_log.txt",
            "[" + moment().format("YYYY-MM-DD HH:mm") + "] " + e.toString()
        );
    }
}, 1000);
run();
