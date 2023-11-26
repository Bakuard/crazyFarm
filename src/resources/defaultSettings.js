'use strict'

const defaultSettings = {
    potato: {
        ghost: {
            timeInMillis: 180000
        },
        immunity: {
            max: 90,
            alarmLevel1: 45,
            declineRatePerSeconds: 1,
            probability: 0.005
        },
        satiety: {
            max: 50,
            alarmLevel1: 25,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 60,
            alarmLevel1: 30,
            declineRatePerSeconds: 1
        },
        price: {
            coff: 0.7001
        },
        seedProbability: {
            min: 0,
            max: 0.55
        },
        meta: {
            typeName: 'Potato'
        },
        vegetableState: {
            seedInterval: 1,
            sproutInterval: 70,
            childInterval: 90,
            youthInterval: 120
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
            max: 100,
            alarmLevel1: 50,
            declineRatePerSeconds: 1,
            probability: 0.005
        },
        satiety: {
            max: 55,
            alarmLevel1: 30,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 60,
            alarmLevel1: 28,
            declineRatePerSeconds: 1
        },
        price: {
            coff: 0.701
        },
        seedProbability: {
            min: 0.55,
            max: 0.9
        },
        meta: {
            typeName: 'Tomato'
        },
        vegetableState: {
            seedInterval: 1,
            sproutInterval: 70,
            childInterval: 90,
            youthInterval: 120
        }
    },
    onion: {
        healer: {
            cellNumberForChild: 1,
            cellNumberForYouth: 2,
            cellNumberForAdult: 3,
            cellNumberForDeath: 3
        },
        immunity: {
            max: 95,
            alarmLevel1: 47,
            declineRatePerSeconds: 1,
            probability: 0.005
        },
        satiety: {
            max: 65,
            alarmLevel1: 33,
            declineRatePerSeconds: 1
        },
        thirst: {
            max: 60,
            alarmLevel1: 30,
            declineRatePerSeconds: 1
        },
        price: {
            coff: 0.7005
        },
        seedProbability: {
            min: 0.9,
            max: 1
        },
        meta: {
            typeName: 'Onion'
        },
        vegetableState: {
            seedInterval: 1,
            sproutInterval: 70,
            childInterval: 90,
            youthInterval: 120
        }
    },
    wallet: {
        sum: 100,
        fertilizerPrice: 1,
        sprayerPrice: 9,
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
        version: 1,
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
                sproutInterval: 3,
                childInterval: 6,
                youthInterval: 6
            }
        }
    }
};
module.exports.defaultSettings = defaultSettings;