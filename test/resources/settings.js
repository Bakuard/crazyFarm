'use strict'

module.exports.settings = {
    potato: {
        ghost: {
            timeInMillis: 10000
        },
        immunity: {
            max: 60,
            alertLevel1: 30,
            declineRatePerSeconds: 1,
            probability: 0.2
        },
        satiety: {
            max: 60,
            alertLevel1: 30,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 60,
            alertLevel1: 30,
            declineRatePerSeconds: 1
        },
        price: {
            coff: 1.5
        },
        seedProbability: {
            min: 0,
            max: 0.7
        },
        meta: {
            typeName: 'Potato'
        },
        vegetableState: {
            seedDetail: {
                intervalInSecond: 3,
                lifeCyleState: 'seed'
            },
            sproutDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'sprout'
            },
            chidlDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'child'
            },
            youthDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'youth'
            }
        }
    },
    tomato: {
        explosion: {
            neighboursNumber: {
                child: 1,
                youth: 3,
                adult: 6
            },
            timeInMillis: 1001
        },
        immunity: {
            max: 60,
            alertLevel1: 30,
            declineRatePerSeconds: 1,
            probability: 0.2
        },
        satiety: {
            max: 60,
            alertLevel1: 30,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 60,
            alertLevel1: 30,
            declineRatePerSeconds: 1
        },
        price: {
            coff: 2
        },
        seedProbability: {
            min: 0.7,
            max: 1
        },
        meta: {
            typeName: 'Tomato'
        },
        vegetableState: {
            seedDetail: {
                intervalInSecond: 3,
                lifeCyleState: 'seed'
            },
            sproutDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'sprout'
            },
            chidlDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'child'
            },
            youthDetail: {
                intervalInSecond: 40,
                lifeCyleState: 'youth'
            }
        }
    },
    wallet: {
        sum: 20,
        fertilizerPrice: 2,
        sprayerPrice: 2,
        seedsPrice: 3
    },
    grid: {
        width: 4,
        height: 3
    }
};