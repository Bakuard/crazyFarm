const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');

let A, B, C, D, E = null;

beforeEach(() => {
    A = function A() {}
    B = function B() {}
    C = function C() {}
    D = function D() {}
    E = function E() {}
});

test(`getOrAssignIdForComponent(componentOrType):
        there are not registered components,
        there are not registered tags
        => return 0`,
    () => {
        let generator = new ComponentIdGenerator();

        let actual = generator.getOrAssignIdForComponent(A);

        expect(actual).toBe(0);
    });

test(`getOrAssignIdForComponent(componentOrType):
    there are not registered components,
    there are not registered tags
    call this method several times
    => return an ascending sequence of numbers`,
    () => {
        let generator = new ComponentIdGenerator();

        let actual = [];
        actual.push(generator.getOrAssignIdForComponent(A));
        actual.push(generator.getOrAssignIdForComponent(B));
        actual.push(generator.getOrAssignIdForComponent(C));
        actual.push(generator.getOrAssignIdForComponent(D));
        actual.push(generator.getOrAssignIdForComponent(E));

        expect(actual).toEqual([0, 1, 2, 3, 4]);
    });

test(`getOrAssignIdForComponent(componentOrType):
    call this method for the same component several times
    => return the same number for each calling`,
    () => {
        let generator = new ComponentIdGenerator();
        generator.getOrAssignIdForComponent(A);
        generator.getOrAssignIdForComponent(B);
        let expected = generator.getOrAssignIdForComponent(C);
        generator.getOrAssignIdForComponent(D);
        generator.getOrAssignIdForComponent(E);

        for(let i = 0; i < 100; i++) {
            let actual = generator.getOrAssignIdForComponent(C);

            expect(actual).toBe(expected);
        }
    });

test(`getOrAssignIdForComponent(componentOrType):
    call this method for componentType and then component with this type
    => return the same number for each calling`,
    () => {
        let generator = new ComponentIdGenerator();
        let expected = generator.getOrAssignIdForComponent(A);
        
        let actual = generator.getOrAssignIdForComponent(new A());

        expect(actual).toBe(expected);
    });

test(`getOrAssignIdForTag(tag):
        there are not registered components,
        there are not registered tags
        => return 0`,
    () => {
        let generator = new ComponentIdGenerator();

        let actual = generator.getOrAssignIdForTag('tag');

        expect(actual).toBe(0);
    });

test(`getOrAssignIdForTag(tag):
        there are not registered components,
        there are not registered tags
        call this method several times
        => return an ascending sequence of numbers`,
    () => {
        let generator = new ComponentIdGenerator();

        let actual = [];
        actual.push(generator.getOrAssignIdForTag('tag A'));
        actual.push(generator.getOrAssignIdForTag('tag B'));
        actual.push(generator.getOrAssignIdForTag('tag C'));
        actual.push(generator.getOrAssignIdForTag('tag D'));
        actual.push(generator.getOrAssignIdForTag('tag E'));

        expect(actual).toEqual([0, 1, 2, 3, 4]);
    });

test(`getOrAssignIdForTag(tag):
        there are registered tags,
        call this method for the same tag several times
        => return the same number for each calling`,
    () => {
        let generator = new ComponentIdGenerator();
        generator.getOrAssignIdForTag('tag A');
        generator.getOrAssignIdForTag('tag B');
        let expected = generator.getOrAssignIdForTag('tag C');
        generator.getOrAssignIdForTag('tag D');
        generator.getOrAssignIdForTag('tag E');

        for(let i = 0; i < 100; i++) {
            let actual = generator.getOrAssignIdForTag('tag C');

            expect(actual).toBe(expected);
        }
    });

test(`getOrAssignIdForTag(tag):
    there are not registered tags,
    call this method for the same tag several times
    => return the same number for each calling`,
    () => {
        let generator = new ComponentIdGenerator();
        let expected = generator.getOrAssignIdForTag('tag A');

        for(let i = 0; i < 100; i++) {
            let actual = generator.getOrAssignIdForTag('tag A');

            expect(actual).toBe(expected);
        }
    });

test(`getOrAssignIdForTag(tag) and getOrAssignIdForComponent(componentOrType):,
        there are registered components,
        there are registered tags,
        register tags and components one by one
        => return an ascending sequence of numbers`,
    () => {
        let generator = new ComponentIdGenerator();
        generator.getOrAssignIdForTag('tag A');
        generator.getOrAssignIdForTag('tag B');
        generator.getOrAssignIdForComponent(A);
        generator.getOrAssignIdForComponent(B);

        let actual = [];
        actual.push(generator.getOrAssignIdForTag('tag C'));
        actual.push(generator.getOrAssignIdForComponent(C));
        actual.push(generator.getOrAssignIdForTag('tag D'));
        actual.push(generator.getOrAssignIdForComponent(D));
        actual.push(generator.getOrAssignIdForTag('tag E'));
        actual.push(generator.getOrAssignIdForComponent(E));

        expect(actual).toEqual([4, 5, 6, 7, 8, 9]);
    });