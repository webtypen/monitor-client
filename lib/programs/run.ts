import fs from "fs";
import { ActionsService } from "../services/ActionsService";

export const runProgram = async (actionKey: string) => {
    if (!actionKey || actionKey.trim() === "") {
        throw new Error("Missing action key ...");
    }

    const config = JSON.parse(fs.readFileSync(__dirname + "/../../config.json", "utf-8"));
    if (!config) {
        throw new Error("Config not found ...");
    }

    if (!config.actions || !config.actions[actionKey]) {
        throw new Error("Unknown action '" + actionKey + "' ...");
    }

    const service = new ActionsService();
    try {
        await service.runAction(actionKey, config.actions[actionKey], { debug: true });
    } catch (e) {
        console.error(e);
    }
};
