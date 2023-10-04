import fs from "fs";
import moment from "moment";
import { HeartbeatService } from "./services/HeartbeatService";
import { ActionsService } from "./services/ActionsService";
import { ConfigService } from "./services/ConfigService";

const heartbeatService = new HeartbeatService();
const actionsService = new ActionsService();

const run = async () => {
    ConfigService.load();

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
    run();
}, 1000);
run();
