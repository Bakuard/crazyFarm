expect.extend({
    toEqualEntity(actual, entity) {
        let isPass = actual.equals(entity);
        return {
            message: () => isPass ? 'pass' : `expected=${entity}, actual=${actual}`,
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