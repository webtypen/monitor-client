"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionProgram = void 0;
const versionProgram = () => {
    const packageJson = require("../../package.json");
    console.log("Installed version: " + packageJson.version + " (" + packageJson.name + ")");
};
exports.versionProgram = versionProgram;
