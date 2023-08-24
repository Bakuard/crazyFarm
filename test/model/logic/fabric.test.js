const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {UnknownVegetableType} = require('../../../src/code/model/exception/exceptions.js');
const {growStates} = require('../../../src/code/model/logic/growTimer.js');

const setting = {
    potato: {
        satiety: {
            alertLevel1: 10
        },
        immunity: {
            alertLevel1: 10
        },
        growTimer: {
            intervalsInSeconds: [3, 40, 40, 40, 40]
        },
        price: {
            coff: 1.5
        },
        seedProbability: {
            min: 0.8,
            max: 1
        },
        meta: {
            typeName: 'Potato'
        }
    },
    tomato: {
        satiety: {
            alertLevel1: 10
        },
        immunity: {
            alertLevel1: 10
        },
        growTimer: {
            intervalsInSeconds: [3, 40, 40, 40, 40]
        },
        price: {
            coff: 1.5
        },
        seedProbability: {
            min: 0,
            max: 0.8
        },
        meta: {
            typeName: 'Tomato'
        }
    },
    wallet: {
        fertilizerPrice: 2,
        sprayerPrice: 2,
        seedsPrice: 7
    }
};

test(`vegetablePrice(vegetableTypeName, growState):
        unknown vegetableTypeName
        => exception`,
    () => {
        let fabric = new Fabric(setting);

        expect(() => fabric.vegetablePrice('Unknown vegetable', growStates.seed)).toThrow(UnknownVegetableType);
    });

test(`vegetablePrice(vegetableTypeName, growState):
        growState == seed
        => return correct result`,
    () => {
        let fabric = new Fabric(setting);

        let price = fabric.vegetablePrice('Potato', growStates.seed).price;

        expect(price).toBe(13);
    });

test(`vegetablePrice(vegetableTypeName, growState):
        growState == sprout
        => return correct result`,
    () => {
        let fabric = new Fabric(setting);

        let price = fabric.vegetablePrice('Potato', growStates.sprout).price;

        expect(price).toBe(37);
    });

test(`vegetablePrice(vegetableTypeName, growState):
        growState == child
        => return correct result`,
    () => {
        let fabric = new Fabric(setting);

        let price = fabric.vegetablePrice('Potato', growStates.child).price;

        expect(price).toBe(61);
    });

test(`vegetablePrice(vegetableTypeName, growState):
        growState == youth
        => return correct result`,
    () => {
        let fabric = new Fabric(setting);

        let price = fabric.vegetablePrice('Potato', growStates.youth).price;

        expect(price).toBe(85);
    });

test(`vegetablePrice(vegetableTypeName, growState):
        growState == adult
        => return correct result`,
    () => {
        let fabric = new Fabric(setting);

        let price = fabric.vegetablePrice('Potato', growStates.adult).price;

        expect(price).toBe(109);
    });

test(`vegetableMeta(randomNumber):
        randomNumber match for Potato
        => returned vegetableName.typeName must be 'Potato'`,
    () => {
        let fabric = new Fabric(setting);

        let vegetableMeta = fabric.vegetableMeta(0.81);

        expect(vegetableMeta.typeName).toBe('Potato');
    });