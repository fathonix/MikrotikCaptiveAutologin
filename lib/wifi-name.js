"use strict";
const chproc = require("child_process");
const utils = require("./utils");

if (process.platform === "darwin") {
  module.exports.sync = osx;
} else if (process.platform === "win32") {
  module.exports.sync = win;
} else {
  module.exports.sync = linux;
}

function osx() {
  const stdout = chproc
    .execFileSync(
      "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport",
      ["-I"]
    )
    .toString();

  if (stdout.includes("AirPort: Off")) {
    utils.die("Wi-Fi is turned off.");
  }

  let ret;

  ret = /^\s*SSID: (.+)\s*$/gm.exec(stdout);
  ret = ret && ret.length ? ret[1] : null;

  if (!ret) noSSID();

  return ret;
}

function win() {
  const stdout = chproc
    .execFileSync("netsh", ["wlan", "show", "interface"])
    .toString();

  let ret;

  ret = /^\s*SSID\s*: (.+)\s*$/gm.exec(stdout);
  ret = ret && ret.length ? ret[1] : null;

  if (!ret) noSSID();

  return ret;
}

function linux() {
  const ret = chproc
    .execFileSync("iwgetid", ["--raw"])
    .toString()
    .replace("\n", "");

  if (!ret) noSSID();

  return ret;
}

function noSSID() {
  utils.die("Could not get SSID.");
}
