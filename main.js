const fs = require("fs");
const http = require("http");
const process = require("process");
const md5 = require("./md5");
const wifiName = require("wifi-name");

function getHashCode(response, password) {
  let hash = Array.from(
    response.matchAll(
      /document\.sendin\.password\.value = hexMD5\('(.{4})' \+ document\.login\.password\.value \+ '(.{64})'\);/g
    )
  )[0];

  if (hash === undefined) {
    console.warn(
      "Error: Can't find hash in response. Are you already logged in or trying to log into another website?"
    );
    process.exit(1);
  }

  return md5.hexMD5(eval(`"${hash[1]}"`) + password + eval(`"${hash[2]}"`));
}

function displayResponse(response) {
  if (response.match(/You are logged in/)) {
    console.log("Succesfully logged in!");
  } else {
    console.warn("Error logging in! See below for the response.");
    console.warn(response);
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
      console.warn(
        `Error: POST to ${config.hostname} returns status code ${res.statusCode}`
      );
      process.exit(1);
    }
    res.on("data", (data) => {
      displayResponse(data.toString());
    });
  });
  request.on("error", (err) => {
    throw err;
  });
  request.write(postData);
  request.end();
}

function initLogin(config) {
  console.log(
    `Logging into ${config.hostname} with username ${config.username}...`
  );

  const request = http.get(`http://${config.hostname}/login`, (res) => {
    if (res.statusCode !== 200) {
      console.warn(
        `Error: GET to ${config.hostname} returns status code ${res.statusCode}`
      );
      process.exit(1);
    }
    res.on("data", (data) => {
      login(config, data.toString());
    });
  });
  request.on("error", (err) => {
    throw err;
  });
  request.end();
}

function main() {
  let configs;
  try {
    configs = JSON.parse(
      fs.readFileSync("./config.json", { encoding: "utf8", flag: "r" })
    );
  } catch (err) {
    console.warn(`Error: ${err.message}`);
    configs = [{}];
  }

  for (idx in configs) {
    let config = configs[idx];
    if (!config.ssid || !config.hostname || !config.username || !config.password) {
      console.warn("Error: Configuration is not valid or one of the arguments is not supplied.");
      process.exit(1);
    }
    if (config.ssid === wifiName.sync()) {
      initLogin(config);
      break;
    }
  }
}

main();