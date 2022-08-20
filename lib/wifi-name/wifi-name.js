'use strict';

if (process.platform === 'darwin') {
	module.exports.sync = require('./osx').sync;
} else if (process.platform === 'win32') {
	module.exports.sync = require('./win').sync;
} else {
	module.exports.sync = require('./linux').sync;
}
