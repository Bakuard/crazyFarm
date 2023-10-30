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
        let missingEntities = [];
        for(let i = 0; i < entities.length; i++) {
            let isFind = false;
            for(let j = 0; j < actual.length && !isFind; j++) {
                isFind = entities[i] === actual[j] || (entities[i] != null && entities[i].deepEquals(actual[j]));
            }
            if(!isFind) missingEntities.push(entities[i]);
        }
        let isPass = missingEntities.length == 0 && actual.length >= entities.length;
        return {
            message: () => isPass ? 
'pass' : 
`actual: 
[${actual.map(e => e != null ? e.toDetailString() : 'null').join('\n')}] 
must contain: 
[${missingEntities.map(e => e != null ? e.toDetailString() : 'null').join('\n')}]`,
            pass: isPass
        };
    }
});

expect.extend({
    containsEntitiesInTheSameOrder(actual, ...entities) {
        let missingEntities = [];
        for(let i = 0, lastIndex = 0; i < entities.length; ++i) {
            let isFind = false;
            for(let j = lastIndex; j < actual.length && !isFind; ++j, lastIndex = j) {
                isFind = entities[i] === actual[j] || (entities[i] != null && entities[i].deepEquals(actual[j]));
            }
            if(!isFind) missingEntities.push(entities[i]);
        }
        let isPass = missingEntities.length == 0 && actual.length >= entities.length;
        return {
            message: () => isPass ? 
'pass' : 
`actual: 
[${actual.map(e => e != null ? e.toDetailString() : 'null').join('\n')}] 
must contain: 
[${missingEntities.map(e => e != null ? e.toDetailString() : 'null').join('\n')}]`,
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