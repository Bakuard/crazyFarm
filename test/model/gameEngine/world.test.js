const {World} = require('../../../src/code/model/gameEngine/world.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {SystemManager} = require('../../../src/code/model/gameEngine/systemManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {GameLoop} = require('../../../src/code/model/gameEngine/gameLoop.js');

test(`getEntityComponentManager():
        => return instance of EntityComponentManager`,
    () => {
        let world = new World(1000);

        let actual = world.getEntityComponentManager();

        expect(actual instanceof EntityComponentManager).toBe(true);
    });

test(`getSystemManager():
        => return instance of SystemManager`,
    () => {
        let world = new World(1000);

        let actual = world.getSystemManager();

        expect(actual instanceof SystemManager).toBe(true);
    });

test(`getEventManager():
        => return instance of EventManager`,
    () => {
        let world = new World(1000);

        let actual = world.getEventManager();

        expect(actual instanceof EventManager).toBe(true);
    });

test(`getGameLoop():
        => return instance of GameLoop`,
    () => {
        let world = new World(1000);

        let actual = world.getGameLoop();

        expect(actual instanceof GameLoop).toBe(true);
    });