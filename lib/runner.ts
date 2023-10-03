import fs from "fs";
import moment from "moment";
import { HeartbeatService } from "./services/HeartbeatService";
import { ActionsService } from "./services/ActionsService";

const heartbeatService = new HeartbeatService();
const actionsService = new ActionsService();

const run = async () => {
    const date = moment().format("YYYY-MM-DD");
    const time = moment().format("HH:mm:ss");
    const config = JSON.parse(fs.readFileSync(__dirname + "/../config.json", "utf-8"));
    const activities = fs.existsSync(__dirname + "/../activities.json")
        ? JSON.parse(fs.readFileSync(__dirname + "/../activities.json", "utf-8"))
        : {};

    if (heartbeatService.needsHeartbeat(config, activities)) {
        heartbeatService.sendHeartbeat(config);
    }

    actionsService.runActionAutomation(config, { time: time, date: date });
};

setInterval(() => {
    run();
}, 1000);
run();
