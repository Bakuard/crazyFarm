const {EntityFilter} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const BitSet = require('bitset');

let A, B, C, D, E = null;
beforeEach(() => {
    A = function A() {}
    B = function B() {}
    C = function C() {}
    D = function D() {}
    E = function E() {}

    let manager = new EntityComponentManager(new EntityManager());
    manager.registerComponents([A, B, C, D, E]);
});

function createMask(...componentTypes) {
    let mask = new BitSet();
    for(let componentType of componentTypes) {
        mask.set(componentType.prototype.componentTypeId, 1);
    }
    return mask;
}

test(`EventFilter:
        intersect(checking set, 'all' set) == checking set,
        power(checking set) == power('all' set)
        => return true`,
        () => {
            let filter = new EntityFilter().all(A, B, C);
            let mask = createMask(A, B, C);

            let actual = filter.isMatch(mask);

            expect(actual).toBe(true);
        });

test(`EventFilter:
intersect(checking set, 'all' set) == 'all' set,
        power(checking set) > power('all' set)
        => return true`,
        () => {
            let filter = new EntityFilter().all(A, B, C);
            let mask = createMask(A, B, C, D);

            let actual = filter.isMatch(mask);

            expect(actual).toBe(true);
        });

test(`EventFilter:
        intersect(checking set, 'all' set) == checking set,
        power(checking set) < power('all' set)
        => return true`,
        () => {
            let filter = new EntityFilter().all(A, B, C, D);
            let mask = createMask(A, B);

            let actual = filter.isMatch(mask);

            expect(actual).toBe(false);
        });

test(`EventFilter:
        intersect(checking set, 'all' set) != 'all' set,
        intersect(checking set, 'all' set) != checking set,
        intersect(checking set, 'all' set) is not empty
        => return false`,
        () => {
            let filter = new EntityFilter().all(A, B, C);
            let mask = createMask(B, C, D, E);

            let actual = filter.isMatch(mask);

            expect(actual).toBe(false);
        });

test(`EventFilter:
        intersect(checking set, 'all' set) is empty
        => return false`,
        () => {
            let filter = new EntityFilter().all(A, B);
            let mask = createMask(C, D, E);

            let actual = filter.isMatch(mask);

            expect(actual).toBe(false);
        });