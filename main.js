const http = require("http");
const md5 = require("./lib/md5");
const wifiName = require("./lib/wifi-name");
const utils = require("./lib/utils");
const os = require("os");

function getHashCode(response, password) {
  let hash = /document\.sendin\.password\.value = hexMD5\('(.{4})' \+ document\.login\.password\.value \+ '(.{64})'\);/g.exec(response);

  if (!hash && !hash.length) {
    utils.die(
      "Could not find hash in response. Are you already logged in or trying to log into another website?"
    );
  }

  return md5.hexMD5(eval(`"${hash[1]}"`) + password + eval(`"${hash[2]}"`));
}

function displayResponse(response) {
  if (response.includes("You are logged in")) {
    console.log("Successfully logged in!");
  } else {
    utils.die(`Could not log in! See below for the response.\n${response}`);
  }
}

function login(config, response) {
  const password = getHashCode(response, config.password);
  const postData = `username=${config.username}&password=${password}`;
  const options = {
    hostname: config.hostname,
    port: 80,
    path: "/login",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
  };
  const request = http.request(options, (res) => {
    if (res.statusCode !== 200) {
      utils.die(
        `POST to ${config.hostname} returned status code ${res.statusCode}.`
      );
    }
    res.on("data", (data) => {
      displayResponse(data.toString());
    });
  });
  request.on("error", (err) => {
    utils.die(err.message);
  });
  request.write(postData);
  request.end();
}

function initLogin(config) {
  console.log(`SSID: ${config.ssid}`);
  console.log(
    `Logging into ${config.hostname} with username ${config.username}...`
  );

  const request = http.get(`http://${config.hostname}/login`, (res) => {
    if (res.statusCode !== 200) {
      utils.die(
        `GET to ${config.hostname} returned status code ${res.statusCode}.`
      );
    }
    res.on("data", (data) => {
      login(config, data.toString());
    });
  });
  request.on("error", (err) => {
    utils.die(err.message);
  });
  request.end();
}

function main() {
  let configs;
  try {
    configs = require(`${os.homedir()}/.config/mikrotik-captive-autologin/config.json`);
  } catch (err) {
    utils.die(err.message);
  }

  if (configs.length < 1) {
    utils.die("No configuration found so Wi-Fi was not logged in.");
  }

  for (idx in configs) {
    let config = configs[idx];
    if (!config.ssid || !config.hostname || !config.username || !config.password) {
      utils.die("Configuration is not valid or one of the arguments is not supplied.");
    }
    if (config.ssid === wifiName.sync()) {
      initLogin(config);
      break;
    }
  }
}

module.exports = { main };
