"use strict";
const chproc = require("child_process");

module.exports.sync = () => {
  const ret = chproc
    .execFileSync("iwgetid", ["--raw"])
    .toString()
    .replace("\n", "");

  if (!ret) {
    throw new Error("Could not get SSID");
  }

  return ret;
};
