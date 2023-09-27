import { SystemService } from "./services/SystemService";

const systemService = new SystemService();

const run = async () => {
  const data = {
    system: await systemService.getSystemData(),
  };

  console.log(data);
};

setInterval(() => {
  run();
}, 15000);
run();
