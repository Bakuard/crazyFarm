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

        let initLogic = new InitSystem(fabric);
        let loadGame = new LoadGameSystem(user._id);
        let gameCommand = new GameCommandSystem();
        let shovel = new ShovelSystem();
        let plantNewVegetableSystem = new PlantNewVegetableSystem(fabric.randomGenerator());
        let grow = new GrowSystem(manager);
        let thirst = new ThirstSystem(manager);
        let satiety = new SatietySystem(manager);
        let immunity = new ImmunitySystem(manager, fabric.randomGenerator());
        let tomatoDeath = new TomatoDeathSystem(manager, fabric.randomGenerator());
        let potatoDeath = new PotatoDeathSystem(manager);
        let worldLogger = new WorldLogger(manager, this.user._id);
        let output = new OutputSystem(outputCallback);
        let saveGame = new SaveGameSystem(user._id, gameRepository, fabric.timeUtil());

        this.world.getSystemManager().
            putSystem('InitSystem', initLogic.update.bind(initLogic), groups.start).
            putSystem('LoadGameSystem', loadGame.update.bind(loadGame), groups.start).
            putSystem('GameCommandSystem', gameCommand.update.bind(gameCommand), groups.update).
            putSystem('ShovelSystem', shovel.update.bind(shovel), groups.update).
            putSystem('PlantNewVegetableSystem', plantNewVegetableSystem.update.bind(plantNewVegetableSystem), groups.update).
            putSystem('GrowSystem', grow.update.bind(grow), groups.update).
            putSystem('ThirstSystem', thirst.update.bind(thirst), groups.update).
            putSystem('SatietySystem', satiety.update.bind(satiety), groups.update).
            putSystem('ImmunitySystem', immunity.update.bind(immunity), groups.update).
            putSystem('TomatoDeathSystem', tomatoDeath.update.bind(tomatoDeath), groups.update).
            putSystem('PotatoDeathSystem', potatoDeath.update.bind(potatoDeath), groups.update).
            putSystem('WorldLogger', worldLogger.update.bind(worldLogger), groups.update).
            putSystem('OutputSystem', output.update.bind(output), groups.update).
            putSystem('SaveGameSystem', saveGame.update.bind(saveGame), groups.stop);
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