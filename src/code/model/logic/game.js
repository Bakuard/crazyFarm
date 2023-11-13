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
            putSystem('InitSystem', fabric.initSystem()()).appendToGroup('InitSystem', groups.start).
            putSystem('LoadGameSystem', fabric.loadGameSystem()(user._id)).appendToGroup('LoadGameSystem', groups.start).
            putSystem('GameCommandSystem', fabric.gameCommandSystem()()).appendToGroup('GameCommandSystem', groups.update);
        if(user.isTutorialFinished) {
            this.world.getSystemManager().
                putSystem('ShovelSystem', fabric.shovelSystem()()).appendToGroup('ShovelSystem', groups.update).
                putSystem('PlantNewVegetableSystem', fabric.plantNewVegetableSystem()()).appendToGroup('PlantNewVegetableSystem', groups.update).
                putSystem('GrowSystem', fabric.growSystem()()).appendToGroup('GrowSystem', groups.update).
                putSystem('ThirstSystem', fabric.thirstSystem()()).appendToGroup('ThirstSystem', groups.update).
                putSystem('SatietySystem', fabric.satietySystem()()).appendToGroup('SatietySystem', groups.update).
                putSystem('ImmunitySystem', fabric.immunitySystem()()).appendToGroup('ImmunitySystem', groups.update).
                putSystem('TomatoDeathSystem', fabric.tomatoDeathSystem()()).appendToGroup('TomatoDeathSystem', groups.update).
                putSystem('PotatoDeathSystem', fabric.potatoDeathSystem()()).appendToGroup('PotatoDeathSystem', groups.update);
        } else {
            this.world.getSystemManager().
                putSystem('TutorialSystem', fabric.tutorialSystem()(user, userRepository)).appendToGroup('TutorialSystem', groups.update);
        }

        this.world.getSystemManager().
            putSystem('WorldLogger', fabric.worldLogger()(user._id)).appendToGroup('WorldLogger', groups.update).
            putSystem('OutputSystem', fabric.outputSystem()(outputCallback)).appendToGroup('OutputSystem', groups.update).
            putSystem('SaveGameSystem', fabric.saveGameSystem()(user._id, gameRepository)).appendToGroup('SaveGameSystem', groups.stop);
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