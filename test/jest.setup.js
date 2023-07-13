let util = require('util');

expect.extend({
    toEqualEntity(actual, entity) {
        let isPass = entity.deepEquals(actual);
        return {
            message: () => isPass ? 'pass' : `expected=${entity.toDetailString()}\nactual=${actual.toDetailString()}`,
            pass: isPass
        };
    }
});

expect.extend({
    containsEntities(actual, ...entities) {
        let isPass = entities.every(entity => actual.find(e => entity.equals(e)));
        return {
            message: () => isPass ? 'pass' : `actual [${actual}] must contain [${entities}]`,
            pass: isPass
        };
    }
});

expect.extend({
    toThrowValidationException(actual, expectedException) {
        let isPass = true;
        try {
            actual();
            isPass = false;
        } catch(err) {
            actual = err;
            isPass = actual instanceof Object.getPrototypeOf(expectedException).constructor &&
                        actual.message === expectedException.message &&
                        util.isDeepStrictEqual(new Set(actual.userMessageKeys), new Set(expectedException.userMessageKeys));
        }
        return {
            message: () => isPass ? 'pass' : `expected => ${toPrettyMessage(expectedException)}\nactual => ${toPrettyMessage(actual)}`,
            pass: isPass
        };
    }
});

function toPrettyMessage(exception) {
    let result = {
        typeName: Object.getPrototypeOf(exception).constructor.name,
        message: exception.message,
        userMessageKeys: exception.userMessageKeys
    };
    return util.inspect(result, {breakLength: Infinity, compact: true});
}