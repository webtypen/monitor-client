import { ProcessService } from "../services/ProcessService";

export const stopProgram = () => {
    const service = new ProcessService();
    const status = service.getStatus();

    if (status !== ProcessService.STATUS_RUNNING) {
        console.log("Cannot stop. Current state: " + status);
        return;
    }

    console.log("Stopping ...");
    service.stop();
};
