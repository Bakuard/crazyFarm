const {Entity} = require('../../../src/code/model/gameEngine/entity.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');

test(`create():
        all entities id have never been used
        => return entities with 0 generation`,
        () => {
            let manager = new EntityManager();

            for(let i = 0; i < 100; i++) {
                let actual = manager.create();

                expect(actual).toEqualEntity(new Entity(i, 0));
            }
        });

test(`create():
        some entities id have already been used and deleted
        => return entities with reused id and next generation`,
        () => {
            let manager = new EntityManager();
            let entities = [];
            for(let i = 0; i < 100; i++) entities.push(manager.create());
            manager.remove(entities[0]);
            manager.remove(entities[47]);
            manager.remove(entities[72]);
            let actual1 = manager.create();
            let actual2 = manager.create();
            let actual3 = manager.create();

            expect(actual1).toEqualEntity(new Entity(72, 1));
            expect(actual2).toEqualEntity(new Entity(47, 1));
            expect(actual3).toEqualEntity(new Entity(0, 1));
        });

test(`create():
        some entity id has been used and deleted several times
        => return entity with reused id and increased generation`,
        () => {
            let manager = new EntityManager();

            for(let i = 0; i < 100; i++) {
                let actual = manager.create();
                manager.remove(actual);

                expect(actual).toEqualEntity(new Entity(0, i));
            }
        });

test(`isAlive(entity):
        entity hasn't yet been deleted
        => return true`,
        () => {
            let manager = new EntityManager();
            let entity = manager.create();

            let actual = manager.isAlive(entity);

            expect(actual).toBe(true);
        });

test(`isAlive(entity):
        entity with such id has already been deleted,
        there is not new entity with same id
        => return false for deleted entity`,
        () => {
            let manager = new EntityManager();
            let entity = manager.create();
            manager.remove(entity);

            let actual = manager.isAlive(entity);

            expect(actual).toBe(false);
        });

test(`isAlive(entity):
        entity with such id has already been deleted,
        there is new entity with same id
        => return false for delete entity`,
        () => {
            let manager = new EntityManager();
            let entity = manager.create();
            manager.remove(entity);
            manager.create();

            let actual = manager.isAlive(entity);

            expect(actual).toBe(false);
        });

test(`isAlive(entity):
        entity with such id has already been deleted,
        there is new entity with same id
        => return true for new entity`,
        () => {
            let manager = new EntityManager();
            let entity = manager.create();
            manager.remove(entity);
            let newEntity = manager.create();

            let actual = manager.isAlive(newEntity);

            expect(actual).toBe(true);
        });

test(`remove(entity):
        entity has already been deleted,
        there is entity with same id
        => doesn't remove entity with same id`,
        () => {
            let manager = new EntityManager();
            let entity = manager.create();

            manager.remove(entity);
            let newEntity = manager.create();

            expect(entity.personalId).toBe(newEntity.personalId);
            expect(manager.isAlive(newEntity)).toBe(true);
        });

test(`remove(entity):
        try remove the same entity several time
        => newEntity.generation must be equal deletedEntity.generation + 1`,
        () => {
            let manager = new EntityManager();
            let entity = manager.create();

            for(let i = 0; i < 100; i++) manager.remove(entity);
            let newEntity = manager.create();

            expect(newEntity.generation).toBe(entity.generation + 1);
        });