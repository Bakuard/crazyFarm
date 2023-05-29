const dotenv = require("dotenv");

dotenv.config({path: "./test/.env"});

module.exports = {
    setupFilesAfterEnv: ['./jest.setup.js']
};