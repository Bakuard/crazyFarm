const {GameLoop} = require('../../../src/code/model/gameEngine/gameLoop.js');
const {FixedInterval} = require('../../../src/code/model/gameEngine/gameLoop.js');
const {TimeUtil} = require('../../../src/code/model/gameEngine/timeUtil.js');

test(`start():
        => doesn't throw any exception`,
    () => {
        jest.useFakeTimers();
        let systemManagerMock = {
            updateGroup: () => {}
        };
        let worldMock = {
            getSystemManager: () => systemManagerMock
        };
        let gameLoop = new GameLoop(worldMock, 100, new TimeUtil());

        expect(() => gameLoop.start()).not.toThrow();
    });

test(`stop():
        => doesn't throw any exception`,
    () => {
        jest.useFakeTimers();
        let systemManagerMock = {
            updateGroup: jest.fn(() => {})
        };
        let worldMock = {
            getSystemManager: () => systemManagerMock
        };
        let gameLoop = new GameLoop(worldMock, 1000, new TimeUtil());

        expect(() => gameLoop.stop()).not.toThrow();
    });

test(`start() and stop():
        => call systems the correct number of times`,
    () => {
        jest.useFakeTimers();
        let systemManagerMock = {
            updateGroup: jest.fn(() => {})
        };
        let worldMock = {
            getSystemManager: () => systemManagerMock
        };
        let gameLoop = new GameLoop(worldMock, 100, new TimeUtil());

        gameLoop.start();
        jest.advanceTimersByTime(2000);

        expect(worldMock.getSystemManager().updateGroup).toHaveBeenCalledTimes(21);
    });