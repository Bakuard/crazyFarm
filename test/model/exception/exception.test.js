const exceptions = require('../../../src/code/model/exception/exceptions.js');

test(`tryExecuteAll(callbacks):
        all callbacks completed successfully
        => doesn't throw exception`,
    async () => {
        return exceptions.tryExecuteAll(
            function() {},
            () => {},
            async function() {},
            async () => {}
        ).catch(e => expect(e).toBeNull());
    });

test(`tryExecuteAll(callbacks):
        some callbacks have failed
        => throw exception`,
    async () => {
        return exceptions.tryExecuteAll(
            function() {},
            () => { throw new exceptions.UnknownVegetableType()},
            async function() { throw new exceptions.FailToCreateVegetableMeta()},
            async () => {}
        ).catch(e => {
            expect(e).toBeInstanceOf(exceptions.AggregateDomainException);
            expect(e.reasons.map(r => Object.getPrototypeOf(r).constructor)).
                toEqual([exceptions.UnknownVegetableType, exceptions.FailToCreateVegetableMeta]);
        });
    });