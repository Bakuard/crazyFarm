const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {EntityFilter} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {Entity} = require('../../../src/code/model/gameEngine/entity.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');

let A, B, C, D, E = null;
let manager = null;
beforeEach(() => {
    A = function A() {}
    B = function B() {}
    C = function C() {}
    D = function D() {}
    E = function E() {}

    manager = new EntityComponentManager(new EntityManager());
    manager.registerComponents([A, B, C, D, E]);
});

test(`bindEntity(entity) and select(entityFilter):
        entity is not alive,
        try to bind entity
        => select shouldn't return this entity (doesn't bind entity)`,
        () => {
            let entity = manager.createEntity();
            entity.put(new A(), new B(), new C());
            manager.removeEntity(entity);

            manager.bindEntity(entity); //try to bind dead entity
            let filter = new EntityFilter().all(A, B, C);
            let generator = manager.select(filter);
            let actual = generator.next();

            expect(actual.done).toBe(true);
            expect(actual.value).not.toBeDefined();
        });

test(`bindEntity(entity) and select(entityFilter):
        entity is alive,
        try to bind entity
        => select should return this entity (bind entity)`,
        () => {
            let entity = manager.createEntity();
            entity.put(new A(), new B(), new C());

            manager.bindEntity(entity); //try to bind alive entity
            let filter = new EntityFilter().all(A, B, C);
            let generator = manager.select(filter);
            let actual = generator.next();

            expect(actual.done).toBe(false);
            expect(actual.value).toEqualEntity(entity);
        });

test(`bindEntity(entity) and select(entityFilter):
        select by filter with different components type set
        => select shouldn't return this entity (bind entity)`,
        () => {
            let entity = manager.createEntity();
            entity.put(new A(), new B(), new C());
            manager.bindEntity(entity); 

            let filter = new EntityFilter().all(A, D);
            let generator = manager.select(filter);
            let actual = generator.next();

            expect(actual.done).toBe(true);
            expect(actual.value).not.toBeDefined();
        });

test(`bindEntity(entity) and select(entityFilter):
        find all entities with matched components type set`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(new A(), new B(), new C());
            entity2.put(new A(), new C());
            entity3.put(new A(), new B(), new C(), new D());
            manager.bindEntity(entity1); 
            manager.bindEntity(entity2); 
            manager.bindEntity(entity3); 
            manager.bindEntity(entity4);

            let filter = new EntityFilter().all(A, B, C);
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).containsEntities(entity1, entity3);
        });

test(`bindEntity(entity) and select(entityFilter):
        use default entityFilter
        => find all enitties in componentManager`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(new A(), new B(), new C());
            entity2.put(new A(), new C());
            entity3.put(new A(), new B(), new C(), new D());
            manager.bindEntity(entity1); 
            manager.bindEntity(entity2); 
            manager.bindEntity(entity3); 
            manager.bindEntity(entity4);

            let filter = new EntityFilter();
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).containsEntities(entity1, entity2, entity3, entity4);
        });

test(`bindEntity(entity) and select(entityFilter):
        entityFilter requires some components
        => select doesn't return empty entities`,
        () => {
            let emptyEntity1 = manager.createEntity();
            let emptyEntity2 = manager.createEntity();
            let emptyEntity3 = manager.createEntity();
            let emptyEntity4 = manager.createEntity();
            manager.bindEntity(emptyEntity1); 
            manager.bindEntity(emptyEntity2); 
            manager.bindEntity(emptyEntity3); 
            manager.bindEntity(emptyEntity4);

            let filter = new EntityFilter().all(A, B, C).none(D);
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).toHaveLength(0);
        });

test(`select(entityFilter):
        entities were never bound
        => select doesn't return such entities`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            entity1.put(new A(), new B(), new C());
            entity2.put(new A(), new C());
            entity3.put(new A(), new B(), new C(), new D());

            let filter = new EntityFilter().all(A, B, C).none(D);
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).toHaveLength(0);
        });

test(`bindEntity(entity) and select(entityFilter):
        entities haven't any components
        => select such entities with default filter`,
        () => {
            let entity1 = manager.createEntity();
            let entity2 = manager.createEntity();
            let entity3 = manager.createEntity();
            let entity4 = manager.createEntity();
            manager.bindEntity(entity1); 
            manager.bindEntity(entity2); 
            manager.bindEntity(entity3); 
            manager.bindEntity(entity4);

            let filter = new EntityFilter();
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).containsEntities(entity1, entity2, entity3, entity4);
        });