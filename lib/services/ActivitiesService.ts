import fs from "fs";
import lodash from "lodash";

export class ActivitiesService {
    store(key: any, value: any) {
        const activities = fs.existsSync(__dirname + "/../../activities.json")
            ? JSON.parse(fs.readFileSync(__dirname + "/../../activities.json", "utf-8"))
            : {};

        lodash.set(activities, key, value);
        fs.writeFileSync(__dirname + "/../../activities.json", JSON.stringify(activities));
    }

    storeMany(object: { [key: string]: any }) {
        const activities = fs.existsSync(__dirname + "/../../activities.json")
            ? JSON.parse(fs.readFileSync(__dirname + "/../../activities.json", "utf-8"))
            : {};

        for (let key in object) {
            lodash.set(activities, key, object[key]);
        }
        fs.writeFileSync(__dirname + "/../../activities.json", JSON.stringify(activities));
    }
}
