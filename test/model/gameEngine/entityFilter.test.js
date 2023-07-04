const {EntityFilter} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const BitSet = require('bitset');

let A, B, C, D, E = null;
let generator = null;
beforeEach(() => {
    A = function A() {}
    B = function B() {}
    C = function C() {}
    D = function D() {}
    E = function E() {}

    generator = new ComponentIdGenerator();
});

function createMask(componentTypes, tags) {
    let mask = new BitSet();
    for(let componentType of componentTypes) {
        let componentTypeId = generator.getOrAssignIdForComponent(componentType);
        mask.set(componentTypeId, 1);
    }
    for(let tag of tags) {
        let tagId = generator.getOrAssignIdForTag(tag);
        mask.set(tagId, 1);
    }
    return mask;
}

test(`EntityFilter:
        mask /\ 'all components' = mask,
        |mask| = |'all components'|
        => return true`,
    () => {
        let filter = new EntityFilter(generator).all(A, B, C);
        let mask = createMask([A, B, C],[]);

        let actual = filter.isMatch(mask);

        expect(actual).toBe(true);
    });

test(`EntityFilter:
        mask /\ 'all components' = 'all components',
        |mask| > |'all components'|
        => return true`,
    () => {
        let filter = new EntityFilter(generator).all(A, B, C);
        let mask = createMask([A, B, C, D],[]);

        let actual = filter.isMatch(mask);

        expect(actual).toBe(true);
    });

test(`EntityFilter:
        mask /\ 'all components' = mask,
        |mask| < |'all components'|
        => return true`,
    () => {
        let filter = new EntityFilter(generator).all(A, B, C, D);
        let mask = createMask([A, B],[]);

        let actual = filter.isMatch(mask);

        expect(actual).toBe(false);
    });

test(`EntityFilter:
        mask /\ 'all components' != 'all components',
        mask /\ 'all components' != 'mask',
        mask /\ 'all components' is not empty,
        => return false`,
    () => {
        let filter = new EntityFilter(generator).all(A, B, C);
        let mask = createMask([B, C, D, E],[]);

        let actual = filter.isMatch(mask);

        expect(actual).toBe(false);
    });

test(`EntityFilter:
        mask /\ 'all components' is empty
        => return false`,
    () => {
        let filter = new EntityFilter(generator).all(A, B);
        let mask = createMask([C, D, E],[]);

        let actual = filter.isMatch(mask);

        expect(actual).toBe(false);
    });

test(`EntityFilter:
        mask /\ 'all components' = 'mask',
        mask /\ 'all tags' != mask AND |mask| = |'all tags'|
        => return false`,
    () => {
        let filter = new EntityFilter(generator).all(A, B).allTags('tagB', 'tagC');
        let mask = createMask([A, B],['tagA', 'tagB']);

        let actual = filter.isMatch(mask);

        expect(actual).toBe(false);
    });

test(`EntityFilter:
        mask /\ 'all components' != 'mask' AND |mask| = |'all components'|,
        mask /\ 'all tags' == mask 
        => return false`,
    () => {
        let filter = new EntityFilter(generator).all(B, C).allTags('tagA', 'tagB');
        let mask = createMask([A, B],['tagA', 'tagB']);

        let actual = filter.isMatch(mask);

        expect(actual).toBe(false);
    });

test(`EntityFilter:
        mask /\ 'all components' == 'mask',
        mask /\ 'all tags' == mask 
        => return false`,
    () => {
        let filter = new EntityFilter(generator).all(A, B).allTags('tagA', 'tagB');
        let mask = createMask([A, B],['tagA', 'tagB']);

        let actual = filter.isMatch(mask);

        expect(actual).toBe(true);
    });