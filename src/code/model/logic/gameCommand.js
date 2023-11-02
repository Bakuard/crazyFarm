'use strcit'

const {checkRawGameCommand} = require('../../validation/validation.js');
const {newLogger} = require('../../conf/logConf.js');
const {CommandRequest} = require('../../dto/dto.js');

let logger = newLogger('error', 'gameCommand.js');

module.exports.GameCommandSystem = class GameCommandSystem {
    constructor() {

    }

    update(systemName, groupName, world) {
        let eventManager = world.getEventManager();

        eventManager.forEachEvent('rawCommand', rawCommand => {
            try {
                checkRawGameCommand(rawCommand);
                eventManager.writeEvent(rawCommand.tool, new CommandRequest(rawCommand));
            } catch(error) {
                logger.error(JSON.stringify(error));
            }
        });

        eventManager.clearEventQueue('rawCommand');
    }
};