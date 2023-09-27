import { ProcessService } from "../services/ProcessService";

export const startProgram = () => {
  const service = new ProcessService();
  const status = service.getStatus();

  if (status !== ProcessService.STATUS_STOPPED) {
    console.log("Cannot start. Current state: " + status);
    return;
  }

  console.log("Starting ...");
  service.start();
};
