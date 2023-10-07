import axios from "axios";
import moment from "moment";
import { ActivitiesService } from "./ActivitiesService";
import { SystemService } from "./SystemService";
import { ProcessService } from "./ProcessService";
import { ActionsService } from "./ActionsService";

export class HeartbeatService {
    lastHeartbeat: any = null;

    async sendHeartbeat(config: any) {
        this.lastHeartbeat = moment();
        const actionsService = new ActionsService();
        const systemService = new SystemService();
        const processService = new ProcessService();
        const data = {
            system: await systemService.getSystemData(),
            processes: processService.processesStatus(),
            actions: actionsService.getActions(),
        };

        const activitiesService = new ActivitiesService();
        activitiesService.store("system.last_heartbeat", moment().format("YYYY-MM-DD HH:mm:ss"));

        try {
            const result = await axios.post("https://monitoring-api.webtypen.de/api/heartbeat", {
                _server: config.server,
                data: data,
            });

            if (result && result.data && result.data.status === "success" && result.data.data) {
                await this.handleHeartbeatResponse(config, result.data.data, {
                    systemService: systemService,
                    processService: processService,
                });
            }
        } catch (e: any) {
            console.error(e);
        }
    }

    needsHeartbeat(config: any, activities: any) {
        if (this.lastHeartbeat && moment().diff(this.lastHeartbeat, "seconds") < 5) {
            return false;
        }

        if (!activities || !activities.system || !activities.system.last_heartbeat) {
            return true;
        }

        const heartbeatTimeout =
            config && config.heartbeatInterval && parseInt(config.heartbeatInterval) > 0
                ? parseInt(config.heartbeatInterval)
                : 60;
        const diff = moment().diff(moment(activities.system.last_heartbeat), "seconds");
        if (diff >= heartbeatTimeout) {
            return true;
        }
        return false;
    }

    async handleHeartbeatResponse(config: any, response: any, options?: any) {
        if (!response || !response._id) {
            return;
        }

        const systemService = options && options.systemService ? options.systemService : new SystemService();
        const processService = options && options.processService ? options.processService : new ProcessService();

        // Processes Queue
        if (response.processes_actions_queue && Object.keys(response.processes_actions_queue).length > 0) {
            for (let processKey in response.processes_actions_queue) {
                if (
                    !response.processes_actions_queue[processKey] ||
                    !response.processes_actions_queue[processKey].action
                ) {
                    continue;
                }

                let error = null;
                try {
                    if (response.processes_actions_queue[processKey].action === "process.start") {
                        processService.processStart(processKey);
                    } else if (response.processes_actions_queue[processKey].action === "process.restart") {
                        processService.processRestart(processKey);
                    } else if (response.processes_actions_queue[processKey].action === "process.stop") {
                        await processService.processStop(processKey);
                    } else {
                        throw new Error(
                            "Unknown action-key '" + response.processes_actions_queue[processKey].action + "' ..."
                        );
                    }
                } catch (e: any) {
                    console.error(e);
                    error = e.toString();
                }

                try {
                    await axios.post("https://monitoring-api.webtypen.de/api/heartbeat/processes/action-result", {
                        _server: config.server,
                        process: processKey,
                        action: response.processes_actions_queue[processKey].action,
                        error: error,
                    });
                } catch (e) {
                    console.error(e);
                }
            }
        }

        // Actions Queue
        if (response.actions_queue && Object.keys(response.actions_queue).length > 0) {
            for (let actionKey in response.actions_queue) {
                try {
                    await axios.post("https://monitoring-api.webtypen.de/api/heartbeat/actions/started", {
                        _server: config.server,
                        action: actionKey,
                    });
                } catch (e) {
                    console.error(e);
                }

                if (!actionKey) {
                    continue;
                }

                if (!config.actions || !config.actions[actionKey]) {
                    continue;
                }

                const service = new ActionsService();
                try {
                    await service.runAction(actionKey, config.actions[actionKey], { debug: true });
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
}
