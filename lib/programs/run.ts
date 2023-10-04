import fs from "fs";
import { ActionsService } from "../services/ActionsService";
import { ConfigService } from "../services/ConfigService";

export const runProgram = async (actionKey: string) => {
    if (!actionKey || actionKey.trim() === "") {
        throw new Error("Missing action key ...");
    }

    ConfigService.load();
    const config: any = ConfigService.get();
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
