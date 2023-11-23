'use strcit'

const {checkRawGameCommand} = require('../../validation/validation.js');
const {newLogger} = require('../../conf/logConf.js');
const {CommandRequest, ControllGameCommandRequest} = require('../../dto/dto.js');

let logger = newLogger('error', 'gameCommand.js');

module.exports.GameCommandSystem = class GameCommandSystem {
    constructor() {

    }

    update(systemHandler, world) {
        let eventManager = world.getEventManager();

        eventManager.forEachEvent('rawCommand', rawCommand => {
            try {
                checkRawGameCommand(rawCommand);
                if(rawCommand.tool) eventManager.writeEvent(rawCommand.tool, new CommandRequest(rawCommand));
                else eventManager.writeEvent('resetGame', new ControllGameCommandRequest(rawCommand.commandName));
            } catch(error) {
                logger.error(JSON.stringify(error));
            }
        });

        eventManager.clearEventQueue('rawCommand');
    }
};