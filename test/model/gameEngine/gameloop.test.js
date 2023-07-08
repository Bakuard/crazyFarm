const {GameLoop} = require('../../../src/code/model/gameEngine/gameLoop.js');

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
        let gameLoop = new GameLoop(worldMock, 100);

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
        let gameLoop = new GameLoop(worldMock, 1000);

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
        let gameLoop = new GameLoop(worldMock, 100);

        gameLoop.start();
        jest.advanceTimersByTime(2000);

        expect(worldMock.getSystemManager().updateGroup).toHaveBeenCalledTimes(21);
    });