export const versionProgram = () => {
    const packageJson = require("../../package.json");
    console.log("Installed version: " + packageJson.version + " (" + packageJson.name + ")");
};
