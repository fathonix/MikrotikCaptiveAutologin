'use strict';
const chproc = require('child_process');

module.exports.sync = () => {
	const stdout = chproc.execFileSync('netsh', ['wlan', 'show', 'interface']).toString();

	let ret;

	ret = /^\s*SSID\s*: (.+)\s*$/gm.exec(stdout);
	ret = ret && ret.length ? ret[1] : null;

	if (!ret) {
		throw new Error('Could not get SSID');
	}

	return ret;
};
