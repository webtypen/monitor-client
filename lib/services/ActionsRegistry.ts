import { MongoDB_Backup_Action } from "../actions/MongoDB_Backup_Action";

class ActionsRegistryWrapper {
    actions: { [key: string]: any } = {
        mongodb_backup: MongoDB_Backup_Action,
    };

    register(key: string, func: any) {
        this.actions[key] = func;
        return this;
    }

    get(key: string) {
        if (this.actions && this.actions[key]) {
            return this.actions[key];
        }
        return null;
    }
}

export const ActionsRegistry = new ActionsRegistryWrapper();
