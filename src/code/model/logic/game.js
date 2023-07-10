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
const {GardenBedCell} = require('./gardenBedCell.js');
const {WorldLogger} = require('./worldLogger.js');
const {newLogger} = require('../../conf/logConf.js');

let logger = newLogger('info', 'game.js');

module.exports.Game = class Game {

    constructor(outputCallback, userId) {
        this.userId = userId;
        this.world = new World(1000);

        let cell = this.world.getEntityComponentManager().createEntity();
        cell.put(GardenBedCell.of(0, 0));
        this.world.getEntityComponentManager().bindEntity(cell);

        let shovelSystem = new ShovelSystem(this.world.getEntityComponentManager());
        let sleepingSeed = new SleepingSeedSystem(this.world.getEntityComponentManager());
        let thirst = new ThirstSystem(this.world.getEntityComponentManager());
        let satiety = new SatietySystem(this.world.getEntityComponentManager());
        let immunity = new ImmunitySystem(Math.random, this.world.getEntityComponentManager());
        let commonDeath = new DeathSystem(this.world.getEntityComponentManager());
        let potatoDeath = new PotatoDeathSystem(this.world.getEntityComponentManager());
        let grow = new GrowTimerSystem(this.world.getEntityComponentManager());
        let worldLogger = new WorldLogger(this.world.getEntityComponentManager(), userId);
        let output = new OutputSystem(this.world.getEntityComponentManager(), outputCallback);

        this.world.getSystemManager().
            putSystem('ShovelSystem', shovelSystem.update.bind(shovelSystem), groups.update).
            putSystem('SleepingSeedSystem', sleepingSeed.update.bind(sleepingSeed), groups.update).
            putSystem('ThirstSystem', thirst.update.bind(thirst), groups.update).
            putSystem('SatietySystem', satiety.update.bind(satiety), groups.update).
            putSystem('ImmunitySystem', immunity.update.bind(immunity), groups.update).
            putSystem('DeathSystem', commonDeath.update.bind(commonDeath), groups.update).
            putSystem('PotatoDeathSystem', potatoDeath.update.bind(potatoDeath), groups.update).
            putSystem('GrowTimerSystem', grow.update.bind(grow), groups.update).
            //putSystem('WorldLogger', worldLogger.update.bind(worldLogger), groups.update).
            putSystem('OutputSystem', output.update.bind(output), groups.update);
    }

    start() {
        logger.info('start game for userId=%s', this.userId);
        this.world.getGameLoop().start();
    }

    stop() {
        logger.info('stop game for userId=%s', this.userId);
        this.world.getGameLoop().stop();
    }

    execute(command) {
        logger.info('execute command=%s for userId=%s', command, this.userId);
        this.world.getEventManager().writeEvent(command.tool, command);
    }

};