'use strict'

const {World} = require('../gameEngine/world.js');
const {PlantNewVegetableSystem} = require('./plantNewVegetable.js');
const {ThirstSystem} = require('./thirst.js');
const {SatietySystem} = require('./satiety.js');
const {ImmunitySystem} = require('./immunity.js');
const {PotatoDeathSystem} = require('./potatoDeath.js');
const {TomatoDeathSystem} = require('./tomatoDeath.js');
const {groups} = require('../gameEngine/gameLoop.js');
const {ShovelSystem} = require('./shovel.js');
const {OutputSystem} = require('./output.js');
const {GrowSystem} = require('./vegetableState.js');
const {WorldLogger} = require('./worldLogger.js');
const {InitLogicSystem} = require('./initLogic.js');
const {newLogger} = require('../../conf/logConf.js');

let logger = newLogger('info', 'game.js');

module.exports.Game = class Game {

    constructor(outputCallback, user) {
        this.user = user;
        this.world = new World(1000);
        const manager = this.world.getEntityComponentManager();

        let initLogic = new InitLogicSystem();
        let shovel = new ShovelSystem(manager);
        let plantNewVegetableSystem = new PlantNewVegetableSystem(manager, Math.random);
        let thirst = new ThirstSystem(manager);
        let satiety = new SatietySystem(manager);
        let immunity = new ImmunitySystem(manager, Math.random);
        let potatoDeath = new PotatoDeathSystem(manager);
        let tomatoDeath = new TomatoDeathSystem(manager);
        let grow = new GrowSystem(manager);
        let worldLogger = new WorldLogger(manager, this.user._id);
        let output = new OutputSystem(manager, outputCallback);

        this.world.getSystemManager().
            putSystem('InitLogicSystem', initLogic.update.bind(initLogic), groups.start).
            putSystem('ShovelSystem', shovel.update.bind(shovel), groups.update).
            putSystem('PlantNewVegetableSystem', plantNewVegetableSystem.update.bind(plantNewVegetableSystem), groups.update).
            putSystem('GrowSystem', grow.update.bind(grow), groups.update).
            putSystem('ThirstSystem', thirst.update.bind(thirst), groups.update).
            putSystem('SatietySystem', satiety.update.bind(satiety), groups.update).
            putSystem('ImmunitySystem', immunity.update.bind(immunity), groups.update).
            putSystem('PotatoDeathSystem', potatoDeath.update.bind(potatoDeath), groups.update).
            putSystem('TomatoDeathSystem', tomatoDeath.update.bind(tomatoDeath), groups.update).
            putSystem('WorldLogger', worldLogger.update.bind(worldLogger), groups.update).
            putSystem('OutputSystem', output.update.bind(output), groups.update);
    }

    start() {
        logger.info('userId=%s; start game', this.user._id);
        this.world.getGameLoop().start();
    }

    stop() {
        logger.info('userId=%s: stop game', this.user._id);
        this.world.getGameLoop().stop();
    }

    execute(command) {
        logger.info('userId=%s; execute game command=%s', this.user._id, command);
        this.world.getEventManager().writeEvent(command.tool, command);
    }

};