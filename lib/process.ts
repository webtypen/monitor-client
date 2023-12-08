import fs from "fs";
import axios from "axios";
import moment from "moment-timezone";
import * as child from "child_process";
import { argv } from "process";
import { ConfigService } from "./services/ConfigService";

if (!argv[2] || argv[2].trim() === "") {
    process.exit();
}

const optionsString: string = Buffer.from(argv[2], "base64").toString();
const options: any = optionsString && optionsString.trim() !== "" ? JSON.parse(optionsString) : null;

if (
    !options ||
    !options.command ||
    options.command.trim() === "" ||
    !options.processKey ||
    options.processKey.trim() === ""
) {
    process.exit();
}

async function sendError(errorString?: string | null) {
    const config: any = ConfigService.get();
    axios
        .post(ConfigService.getApiUrl("/api/processes/log/error"), {
            _server: config.server,
            process_key: options.processKey,
            error: errorString,
        })
        .then(() => {})
        .catch(() => {});
}

function start() {
    // fs.appendFileSync(__dirname + "/../test.txt", "Start at : " + moment().format("YYYY-MM-DD HH:mm:ss") + "\n");

    const childProcess = child.spawn(options.command, {
        shell: true,
    });
    const pid = childProcess.pid;

    childProcess.stderr.on("data", function (data) {
        if (!options || !options.errors) {
            return;
        }

        let count = 0;
        let status = false;
        const filename = moment().format("YYYY-MM-DD_HHmmss");
        const path = __dirname + "/../log/";
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }

        while (status === false) {
            if (!fs.existsSync(path + filename + (count > 0 ? "-" + count.toString() : "") + ".txt")) {
                status = false;
                break;
            } else {
                count++;
            }
        }

        fs.writeFileSync(
            path + filename + (count > 0 ? "-" + count.toString() : "") + ".txt",
            JSON.stringify({
                process: options.processKey,
                date: moment().format("YYYY-MM-DD HH:mm:ss"),
                error: data.toString(),
            })
        );
    });

    childProcess.on("exit", (code, signal) => {
        if (options && options.restart) {
            setTimeout(
                () => {
                    start();
                },
                options.restartTimeout && parseInt(options.restartTimeout) > 0 ? parseInt(options.restartTimeout) : 1000
            );
        }
    });
}

start();
