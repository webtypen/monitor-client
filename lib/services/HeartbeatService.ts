import axios from "axios";
import moment from "moment";
import { ActivitiesService } from "./ActivitiesService";
import { SystemService } from "./SystemService";

export class HeartbeatService {
    async sendHeartbeat(config: any) {
        const systemService = new SystemService();
        const data = {
            system: await systemService.getSystemData(),
        };

        const activitiesService = new ActivitiesService();
        activitiesService.store("system.last_heartbeat", moment().format("YYYY-MM-DD HH:mm:ss"));

        try {
            await axios.post("https://monitoring.webtypen.de/api-backend/api/heartbeat", {
                data: data,
                project: config.project,
            });
        } catch (e: any) {
            console.error();
        }
    }

    needsHeartbeat(config: any, activities: any) {
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
