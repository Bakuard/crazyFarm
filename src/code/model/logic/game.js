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
const {GardenBedCell} = require('./gardenBedCell.js');
const {ShovelSystem, ShovelSystem} = require('./shovel.js');

module.exports.Game = class Game {

    constructor() {
        this.world = new World(1000);
        this.plantsFilter = this.world.getEntityComponentManager().createFilter();

        let cell = this.world.getEntityComponentManager().createEntity();
        cell.put(GardenBedCell.of(0, 0));
        this.world.getEntityComponentManager.bindEntity(cell);

        let shovelSystem = new ShovelSystem(this.world.getEntityComponentManager());
        let sleepingSeed = new SleepingSeedSystem(this.world.getEntityComponentManager());
        let thirst = new ThirstSystem(this.world.getEntityComponentManager());
        let satiety = new SatietySystem(this.world.getEntityComponentManager());
        let immunity = new ImmunitySystem(Math.random, this.world.getEntityComponentManager());
        let commonDeath = new DeathSystem(this.world.getEntityComponentManager());
        let potatoDeath = new PotatoDeathSystem(this.world.getEntityComponentManager());
        let grow = new GrowTimerSystem(this.world.getEntityComponentManager());

        this.world.getSystemManager().
            putSystem('ShovelSystem', shovelSystem.update.bind(shovelSystem), groups.update).
            putSystem('SleepingSeedSystem', sleepingSeed.update.bind(sleepingSeed), groups.update).
            putSystem('ThirstSystem', thirst.update.bind(thirst), groups.update).
            putSystem('SatietySystem', satiety.update.bind(satiety), groups.update).
            putSystem('ImmunitySystem', immunity.update.bind(immunity), groups.update).
            putSystem('DeathSystem', commonDeath.update.bind(commonDeath), groups.update).
            putSystem('PotatoDeathSystem', potatoDeath.update.bind(potatoDeath), groups.update).
            putSystem('GrowTimerSystem', grow.update.bind(grow), groups.update);
    }

    start() {
        this.world.getGameLoop().start();
    }

    stop() {
        this.world.getGameLoop().stop();
    }

    getGardenBed() {
        return [...this.world.getEntityComponentManager().select(this.plantsFilter)];
    }

    execute(command) {
        this.world.getEventManager().writeEvent(command.tool, command);
    }

};