"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const version_1 = require("./lib/programs/version");
const program = process.argv && process.argv[3] && process.argv[3].trim() !== ""
    ? process.argv[3].trim().toLowerCase()
    : null;
if (!program || program === "version") {
    (0, version_1.versionProgram)();
}
else if (program === "start") {
}
