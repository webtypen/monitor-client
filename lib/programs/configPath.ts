import { ConfigService } from "../services/ConfigService";

export const configPathProgram = (path?: string) => {
    const { log } = console;
    if (!path || path.trim() === "") {
        ConfigService.set("config", null);
        log("Reset config-path to default ...");
    } else {
        ConfigService.set("config", path.trim());
        log("New config-path: " + path.trim());
    }

    ConfigService.saveMain();
};
