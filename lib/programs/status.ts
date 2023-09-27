import { ProcessService } from "../services/ProcessService";

export const statusProgram = () => {
  const service = new ProcessService();
  const status = service.getStatus();

  if (status === "running") {
    const pid = service.getProcessPid();
    console.log("Running on port " + pid);
  } else {
    console.log("Current state: " + status);
  }
};
