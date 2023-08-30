const {Fabric} = require('../../../src/code/model/logic/fabric.js');

const setting = {
    potato: {
        seedProbability: {
            min: 0.8,
            max: 1
        },
        meta: {
            typeName: 'Potato'
        }
    },
    tomato: {
        seedProbability: {
            min: 0,
            max: 0.8
        },
        meta: {
            typeName: 'Tomato'
        }
    }
};

test(`vegetableMeta(randomNumber):
        randomNumber match for Potato
        => returned vegetableName.typeName must be 'Potato'`,
    () => {
        let fabric = new Fabric(setting);

        let vegetableMeta = fabric.vegetableMeta(0.81);

        expect(vegetableMeta.typeName).toBe('Potato');
    });