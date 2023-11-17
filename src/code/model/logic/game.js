'use strict'

const {groups} = require('../gameEngine/gameLoop.js');
const {newLogger} = require('../../conf/logConf.js');

let logger = newLogger('info', 'game.js');

module.exports.Game = class Game {

    constructor(outputCallback, user, gameRepository, userRepository, fabric) {
        this.user = user;
        this.gameRepository = gameRepository;
        this.world = fabric.world()();

        this.world.getSystemManager().
            putSystem('InitSystem', fabric.initSystem()()).appendToGroup(groups.start, 'InitSystem').
            putSystem('LoadGameSystem', fabric.loadGameSystem()(user._id)).appendToGroup(groups.start, 'LoadGameSystem').
            putSystem('GameCommandSystem', fabric.gameCommandSystem()()).
            putSystem('ShovelSystem', fabric.shovelSystem()()).
            putSystem('PlantNewVegetableSystem', fabric.plantNewVegetableSystem()()).
            putSystem('GrowSystem', fabric.growSystem()()).
            putSystem('ThirstSystem', fabric.thirstSystem()()).
            putSystem('SatietySystem', fabric.satietySystem()()).
            putSystem('ImmunitySystem', fabric.immunitySystem()()).
            putSystem('TomatoDeathSystem', fabric.tomatoDeathSystem()()).
            putSystem('PotatoDeathSystem', fabric.potatoDeathSystem()()).
            putSystem('ClearEventsSystem', fabric.clearEventsSystem()()).
            putSystem('WorldLoggerSystem', fabric.worldLogger()(user)).
            putSystem('OutputSystem', fabric.outputSystem()(outputCallback)).
            putSystem('TutorialSystem', fabric.tutorialSystem()(user, userRepository)).
            putSystem('SaveGameSystem', fabric.saveGameSystem()(user._id, gameRepository)).appendToGroup(groups.stop, 'SaveGameSystem');
        
        if(user.isTutorialFinished) {
            this.world.getSystemManager().
                appendToGroup(groups.update, 'GameCommandSystem').
                appendToGroup(groups.update, 'ShovelSystem').
                appendToGroup(groups.update, 'PlantNewVegetableSystem').
                appendToGroup(groups.update, 'GrowSystem').
                appendToGroup(groups.update, 'ThirstSystem').
                appendToGroup(groups.update, 'SatietySystem').
                appendToGroup(groups.update, 'ImmunitySystem').
                appendToGroup(groups.update, 'TomatoDeathSystem').
                appendToGroup(groups.update, 'PotatoDeathSystem').
                appendToGroup(groups.update, 'ClearEventsSystem').
                appendToGroup(groups.update, 'WorldLoggerSystem').
                appendToGroup(groups.update, 'OutputSystem');
        } else {
            this.world.getSystemManager().
                appendToGroup(groups.update, 'TutorialSystem').
                appendToGroup(groups.update, 'OutputSystem');
        }
    }

    async start() {
        logger.info('userId=%s: start game', this.user._id);

        let fullGameState = await this.gameRepository.load(this.user._id);
        this.world.getEntityComponentManager().putSingletonEntity('fullGameState', fullGameState);
        this.world.getGameLoop().start();
    }

    stop() {
        logger.info('userId=%s: stop game', this.user._id);
        this.world.getGameLoop().stop();
    }

    execute(command) {
        logger.info('userId=%s; execute game command=%s', this.user._id, command);
        this.world.getEventManager().writeEvent('rawCommand', command);
    }

};