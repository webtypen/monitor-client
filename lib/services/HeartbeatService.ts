import axios from "axios";
import moment from "moment";
import { ActivitiesService } from "./ActivitiesService";
import { SystemService } from "./SystemService";
import { ProcessService } from "./ProcessService";

export class HeartbeatService {
    lastHeartbeat: any = null;

    async sendHeartbeat(config: any) {
        this.lastHeartbeat = moment();
        const systemService = new SystemService();
        const data = {
            system: await systemService.getSystemData(),
        };

        const activitiesService = new ActivitiesService();
        activitiesService.store("system.last_heartbeat", moment().format("YYYY-MM-DD HH:mm:ss"));

        const processService = new ProcessService();

        try {
            await axios.post("https://monitoring-api.webtypen.de/api/heartbeat", {
                data: data,
                server: config.server,
                processes: processService.processesStatus(),
            });
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
}
