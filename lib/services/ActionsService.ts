import axios from "axios";
import moment from "moment";
import { HelperService } from "./HelperService";
import { ActionsRegistry } from "./ActionsRegistry";
import { ConfigService } from "./ConfigService";

export class ActionsService {
    getActions() {
        const config: any = ConfigService.get();
        return config && config.actions && Object.keys(config.actions).length > 0 ? config.actions : null;
    }

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
        const action = ActionsRegistry.get(actionConfig.type);
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
        let message = null;
        try {
            status = await action({ key: actionKey, config: actionConfig, runId: runId, log: log });
        } catch (e: any) {
            if (options && options.debug) {
                console.error(e);
            }

            hasError = true;

            if (e && e.toString() && e.toString().trim() !== "") {
                message = e.toString();
                logContent += logContent && logContent.trim() !== "" ? logContent + "\n" : "" + e.toString();
            }
        }

        if (!hasError && status) {
            await this.sendRunActionSignal(actionKey, runId, "finished", { message: message, log: logContent });
        } else {
            await this.sendRunActionSignal(actionKey, runId, "failed", { message: message, log: logContent });
        }
    }

    async sendRunActionSignal(actionKey: string, runId: string, status: string, payload?: any) {
        try {
            const config: any = ConfigService.get();

            await axios.post("https://monitoring-api.webtypen.de/api/actions/signal", {
                action: actionKey,
                run: runId,
                status: status,
                server: config.server,
                payload: payload,
            });
        } catch (e: any) {
            console.error(e);
        }
    }
}
