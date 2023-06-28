const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {EntityFilter} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {Entity} = require('../../../src/code/model/gameEngine/entity.js');

let A, B, C, D, E = null;
let manager = null;
beforeEach(() => {
    A = function A() {}
    B = function B() {}
    C = function C() {}
    D = function D() {}
    E = function E() {}

    manager = new EntityComponentManager();
    manager.registerComponents([A, B, C, D, E]);
});

test(`createEntity():
        all entities id have never been used
        => return entities with 0 generation`,
        () => {
            for(let i = 0; i < 100; i++) {
                let actual = manager.createEntity();

                expect(actual).toEqualEntity(new Entity(i, 0));
            }
        });

test(`createEntity():
        some entities id have already been used and deleted
        => return entities with reuse id and next generation`,
        () => {
            let entities = [];
            for(let i = 0; i < 100; i++) entities.push(manager.createEntity());
            manager.removeEntity(entities[0]);
            manager.removeEntity(entities[47]);
            manager.removeEntity(entities[72]);
            let actual1 = manager.createEntity();
            let actual2 = manager.createEntity();
            let actual3 = manager.createEntity();

            expect(actual1).toEqualEntity(new Entity(72, 1));
            expect(actual2).toEqualEntity(new Entity(47, 1));
            expect(actual3).toEqualEntity(new Entity(0, 1));
        });

test(`createEntity():
        some entity id has been used and deleted several times
        => return entity with reused id and increased generation`,
        () => {
            for(let i = 0; i < 100; i++) {
                let actual = manager.createEntity();
                manager.removeEntity(actual);

                expect(actual).toEqualEntity(new Entity(0, i));
            }
        });

test(`isAlive(entity):
        entity hasn't yet been deleted
        => return true`,
        () => {
            let entity = manager.createEntity();

            let actual = manager.isAlive(entity);

            expect(actual).toBe(true);
        });

test(`isAlive(entity):
        entity with such id has already been deleted,
        there is not new entity with same id
        => return false for deleted entity`,
        () => {
            let entity = manager.createEntity();
            manager.removeEntity(entity);

            let actual = manager.isAlive(entity);

            expect(actual).toBe(false);
        });

test(`isAlive(entity):
        entity with such id has already been deleted,
        there is new entity with same id
        => return false for delete entity`,
        () => {
            let entity = manager.createEntity();
            manager.removeEntity(entity);
            manager.createEntity();

            let actual = manager.isAlive(entity);

            expect(actual).toBe(false);
        });

test(`isAlive(entity):
        entity with such id has already been deleted,
        there is new entity with same id
        => return true for new entity`,
        () => {
            let entity = manager.createEntity();
            manager.removeEntity(entity);
            let newEntity = manager.createEntity();

            let actual = manager.isAlive(newEntity);

            expect(actual).toBe(true);
        });

test(`removeEntity(entity):
        entity has already been deleted,
        there is entity with same id
        => doesn't remove entity with same id`,
        () => {
            let entity = manager.createEntity();

            manager.removeEntity(entity);
            let newEntity = manager.createEntity();

            expect(entity.personalId).toBe(newEntity.personalId);
            expect(manager.isAlive(newEntity)).toBe(true);
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
        entityFilter is not default
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