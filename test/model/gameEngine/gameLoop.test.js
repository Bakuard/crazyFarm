const {FixedInterval} = require('../../../src/code/model/gameEngine/gameLoop.js');

test(`fixedInterval:
        elapsedTime < timeInMillis
        => ignore execute() calling`,
        () => {
            let fixedInterval = new FixedInterval(1000);
            let callback = jest.fn(() => {});

            fixedInterval.execute(callback, 500);

            expect(callback.mock.calls).toHaveLength(0);
        });

test(`fixedInterval:
        elapsedTime = timeInMillis
        => call execute() one time`,
        () => {
            let fixedInterval = new FixedInterval(1000);
            let callback = jest.fn(() => {});

            fixedInterval.execute(callback, 1000);

            expect(callback.mock.calls).toHaveLength(1);
        });

test(`fixedInterval:
        elapsedTime = timeInMillis * x
        => call execute() x time`,
        () => {
            let fixedInterval = new FixedInterval(1000);
            let callback = jest.fn(() => {});

            fixedInterval.execute(callback, 10000);

            expect(callback.mock.calls).toHaveLength(10);
        });