"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesService = void 0;
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
class ActivitiesService {
    store(key, value) {
        const activities = fs_1.default.existsSync(__dirname + "/../../activities.json")
            ? JSON.parse(fs_1.default.readFileSync(__dirname + "/../../activities.json", "utf-8"))
            : {};
        lodash_1.default.set(activities, key, value);
        fs_1.default.writeFileSync(__dirname + "/../../activities.json", JSON.stringify(activities));
    }
    storeMany(object) {
        const activities = fs_1.default.existsSync(__dirname + "/../../activities.json")
            ? JSON.parse(fs_1.default.readFileSync(__dirname + "/../../activities.json", "utf-8"))
            : {};
        for (let key in object) {
            lodash_1.default.set(activities, key, object[key]);
        }
        fs_1.default.writeFileSync(__dirname + "/../../activities.json", JSON.stringify(activities));
    }
}
exports.ActivitiesService = ActivitiesService;
