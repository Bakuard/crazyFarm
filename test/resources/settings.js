'use strict'

module.exports.settings = {
    potato: {
        ghost: {
            timeInMillis: 10000
        },
        immunity: {
            max: 60,
            alarmLevel1: 30,
            declineRatePerSeconds: 1,
            probability: 0.2
        },
        satiety: {
            max: 60,
            alarmLevel1: 30,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 60,
            alarmLevel1: 30,
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
            seedInterval: 3,
            sproutInterval: 100,
            childInterval: 100,
            youthInterval: 100
        }
    },
    tomato: {
        explosion: {
            neighboursNumber: {
                child: 8,
                youth: 8,
                adult: 8
            },
            timeInMillis: 1001
        },
        immunity: {
            max: 60,
            alarmLevel1: 30,
            declineRatePerSeconds: 1,
            probability: 0.2
        },
        satiety: {
            max: 60,
            alarmLevel1: 30,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 60,
            alarmLevel1: 30,
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
            seedInterval: 3,
            sproutInterval: 100,
            childInterval: 100,
            youthInterval: 100
        }
    },
    wallet: {
        sum: 200,
        fertilizerPrice: 2,
        sprayerPrice: 2,
        seedsPrice: 3
    },
    grid: {
        width: 4,
        height: 3
    },
    gameLoop: {
        frameDurationInMillis: 100
    },
    tutorial: {
        activeCell: {
            x: 1,
            y: 0
        },
        vegetable: {
            meta: {
                typeName: 'Potato'
            },
            immunity: {
                max: 4,
                alarmLevel1: 2,
                declineRatePerSeconds: 1,
                probability: 1
            },
            satiety: {
                max: 4,
                alarmLevel1: 2,
                declineRatePerSeconds: 1
            },
            thirst: {
                max: 4,
                alarmLevel1: 2,
                declineRatePerSeconds: 1
            },
            vegetableState: {
                seedInterval: 1,
                sproutInterval: 6,
                childInterval: 6,
                youthInterval: 6
            }
        }
    }
}; 
