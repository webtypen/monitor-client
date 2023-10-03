import moment from "moment";
import { HelperService } from "./HelperService";
import { ActionsRegistry } from "./ActionsRegistry";

export class ActionsService {
    async runActionAutomation(config: any, payload: any) {
        if (!config || !config.actions || Object.keys(config.actions).length < 1) {
            return;
        }

        for (let key in config.actions) {
            if (
                !config.actions[key] ||
                !config.actions[key].type ||
                !config.actions[key].automation ||
                !config.actions[key].automation.mode
            ) {
                continue;
            }

            let run = false;
            if (config.actions[key].automation.mode === "daily") {
                if (config.actions[key].automation.times && config.actions[key].automation.times.length > 0) {
                    for (let t of config.actions[key].automation.times) {
                        const time = t.length === 5 ? t + ":00" : t;
                        if (time === payload.time) {
                            run = true;
                            break;
                        }
                    }
                }
            }

            if (run) {
                this.runAction(key, config.actions[key]);
            }
        }
    }

    async runAction(actionKey: string, actionConfig: any, options?: any) {
        const runId = moment().format("YYYYMMDDHHmmss") + "_" + HelperService.randomString(12);
        const action = ActionsRegistry.get(actionKey);
        if (!action) {
            await this.sendRunActionSignal(actionKey, runId, "failed", {
                config: actionConfig,
                message:
                    "Action '" + (actionKey && actionKey.trim() !== "" ? actionKey : "undefined") + "' not found ...",
            });
            return;
        }

        await this.sendRunActionSignal(actionKey, runId, "started", {
            config: actionConfig,
        });

        let logContent = "";
        const log = (msg: string) => {
            logContent += msg;
        };

        let status = false;
        let hasError = false;
        try {
            status = await action({ key: actionKey, config: actionConfig, runId: runId, log: log });
        } catch (e: any) {
            if (options && options.debug) {
                console.error(e);
            }

            hasError = true;
            await this.sendRunActionSignal(actionKey, runId, "failed", {
                message: e && e.toString().trim() !== "" ? e.toString() : undefined,
                log: logContent,
            });
        }

        if (!hasError) {
            if (status) {
                await this.sendRunActionSignal(actionKey, runId, "finished");
            } else {
                await this.sendRunActionSignal(actionKey, runId, "failed");
            }
        }
    }

    async sendRunActionSignal(actionKey: string, runId: string, status: string, payload?: any) {}
}
