'use strict'

const {World} = require('../gameEngine/world.js');
const {SleepingSeedSystem} = require('./sleepingSeed.js');
const {ThirstSystem} = require('./thirst.js');
const {SatietySystem} = require('./satiety.js');
const {ImmunitySystem} = require('./immunity.js');
const {DeathSystem} = require('./commonDeath.js');
const {PotatoDeathSystem} = require('./potatoDeath.js');
const {GrowTimerSystem} = require('./growTimer.js');
const {groups} = require('../gameEngine/gameLoop.js');
const {ShovelSystem} = require('./shovel.js');
const {OutputSystem} = require('./output.js');
const {WorldLogger} = require('./worldLogger.js');
const {InitLogicSystem} = require('./initLogic.js');
const {Fabric} = require('./fabric.js');
const {newLogger} = require('../../conf/logConf.js');

let logger = newLogger('info', 'game.js');

module.exports.Game = class Game {

    constructor(outputCallback, userId) {
        this.userId = userId;
        this.world = new World(1000);

        let fabric = Fabric.createWithDefaultSettings();

        let initLogicSystem = new InitLogicSystem(fabric);
        let shovelSystem = new ShovelSystem(this.world.getEntityComponentManager());
        let sleepingSeed = new SleepingSeedSystem(this.world.getEntityComponentManager());
        let thirst = new ThirstSystem(this.world.getEntityComponentManager());
        let satiety = new SatietySystem(this.world.getEntityComponentManager());
        let immunity = new ImmunitySystem(Math.random, this.world.getEntityComponentManager());
        let commonDeath = new DeathSystem(this.world.getEntityComponentManager());
        let potatoDeath = new PotatoDeathSystem(this.world.getEntityComponentManager(), fabric);
        let grow = new GrowTimerSystem(this.world.getEntityComponentManager());
        let worldLogger = new WorldLogger(this.world.getEntityComponentManager(), userId);
        let output = new OutputSystem(this.world.getEntityComponentManager(), outputCallback);

        this.world.getSystemManager().
            putSystem('InitLogicSystem', initLogicSystem.update.bind(initLogicSystem), groups.start).
            putSystem('ShovelSystem', shovelSystem.update.bind(shovelSystem), groups.update).
            putSystem('SleepingSeedSystem', sleepingSeed.update.bind(sleepingSeed), groups.update).
            putSystem('ThirstSystem', thirst.update.bind(thirst), groups.update).
            putSystem('SatietySystem', satiety.update.bind(satiety), groups.update).
            putSystem('ImmunitySystem', immunity.update.bind(immunity), groups.update).
            putSystem('DeathSystem', commonDeath.update.bind(commonDeath), groups.update).
            putSystem('PotatoDeathSystem', potatoDeath.update.bind(potatoDeath), groups.update).
            putSystem('GrowTimerSystem', grow.update.bind(grow), groups.update).
            putSystem('WorldLogger', worldLogger.update.bind(worldLogger), groups.update).
            putSystem('OutputSystem', output.update.bind(output), groups.update);
    }

    start() {
        logger.info('userId=%s; start game', this.userId);
        this.world.getGameLoop().start();
    }

    stop() {
        logger.info('userId=%s: stop game', this.userId);
        this.world.getGameLoop().stop();
    }

    execute(command) {
        logger.info('userId=%s; execute game command=%s', this.userId, command);
        this.world.getEventManager().writeEvent(command.tool, command);
    }

};