'use strict'

const {World} = require('../gameEngine/world.js');
const {PlantNewVegetableSystem} = require('./plantNewVegetable.js');
const {ThirstSystem} = require('./thirst.js');
const {SatietySystem} = require('./satiety.js');
const {ImmunitySystem} = require('./immunity.js');
const {PotatoDeathSystem} = require('./potatoDeath.js');
const {TomatoDeathSystem} = require('./tomatoDeath.js');
const {groups} = require('../gameEngine/gameLoop.js');
const {GameCommandSystem} = require('./gameCommand.js');
const {ShovelSystem} = require('./shovel.js');
const {OutputSystem} = require('./output.js');
const {GrowSystem} = require('./vegetableState.js');
const {WorldLogger} = require('./worldLogger.js');
const {InitSystem} = require('./init.js');
const {LoadGameSystem} = require('./loadGame.js');
const {newLogger} = require('../../conf/logConf.js');
const {SaveGameSystem} = require('./saveGame.js');

let logger = newLogger('info', 'game.js');

module.exports.Game = class Game {

    constructor(outputCallback, user, gameRepository, fabric) {
        this.user = user;
        this.gameRepository = gameRepository;
        this.world = new World(fabric.frameDurationInMillis(), fabric.timeUtil());
        const manager = this.world.getEntityComponentManager();

        this.world.getSystemManager().
            putSystem('InitSystem', new InitSystem(fabric)).appendToGroup('InitSystem', groups.start).
            putSystem('LoadGameSystem', new LoadGameSystem(user._id)).appendToGroup('LoadGameSystem', groups.start).
            putSystem('GameCommandSystem', new GameCommandSystem()).appendToGroup('GameCommandSystem', groups.update).
            putSystem('ShovelSystem', new ShovelSystem()).appendToGroup('ShovelSystem', groups.update).
            putSystem('PlantNewVegetableSystem', new PlantNewVegetableSystem(fabric.randomGenerator())).
                appendToGroup('PlantNewVegetableSystem', groups.update).
            putSystem('GrowSystem', new GrowSystem(manager)).appendToGroup('GrowSystem', groups.update).
            putSystem('ThirstSystem', new ThirstSystem(manager)).appendToGroup('ThirstSystem', groups.update).
            putSystem('SatietySystem', new SatietySystem(manager)).appendToGroup('SatietySystem', groups.update).
            putSystem('ImmunitySystem', new ImmunitySystem(manager, fabric.randomGenerator())).
                appendToGroup('ImmunitySystem', groups.update).
            putSystem('TomatoDeathSystem', new TomatoDeathSystem(manager, fabric.randomGenerator())).
                appendToGroup('TomatoDeathSystem', groups.update).
            putSystem('PotatoDeathSystem', new PotatoDeathSystem(manager)).appendToGroup('PotatoDeathSystem', groups.update).
            putSystem('WorldLogger', new WorldLogger(manager, this.user._id)).appendToGroup('WorldLogger', groups.update).
            putSystem('OutputSystem', new OutputSystem(false, outputCallback)).appendToGroup('OutputSystem', groups.update).
            putSystem('SaveGameSystem', new SaveGameSystem(user._id, gameRepository, fabric.timeUtil())).
                appendToGroup('SaveGameSystem', groups.stop);
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