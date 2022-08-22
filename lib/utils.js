function die(msg) {
    console.warn(`Error: ${msg}`);
    process.exit(1);
}

module.exports = { die };