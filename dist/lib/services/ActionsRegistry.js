"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsRegistry = void 0;
const Command_Action_1 = require("../actions/Command_Action");
const MongoDB_Backup_Action_1 = require("../actions/MongoDB_Backup_Action");
class ActionsRegistryWrapper {
    constructor() {
        this.actions = {
            command: Command_Action_1.Command_Action,
            "backup.mongodb": MongoDB_Backup_Action_1.MongoDB_Backup_Action,
        };
    }
    register(key, func) {
        this.actions[key] = func;
        return this;
    }
    get(key) {
        if (this.actions && this.actions[key]) {
            return this.actions[key];
        }
        return null;
    }
}
exports.ActionsRegistry = new ActionsRegistryWrapper();
