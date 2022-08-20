"use strict";
const chproc = require("child_process");

module.exports.sync = () => {
  const stdout = chproc.execFileSync(
    "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport",
    ["-I"]
  ).toString();

  if (stdout.includes("AirPort: Off")) {
    throw new Error("Wi-Fi is turned off");
  }

  let ret;

  ret = /^\s*SSID: (.+)\s*$/gm.exec(stdout);
  ret = ret && ret.length ? ret[1] : null;

  if (!ret) {
    throw new Error("Could not get SSID");
  }

  return ret;
};
