'use strict'

module.exports.Disease = class Disease {
    constructor(probability, probabilityRatePerSeconds, maxHealth, declineRatePerSeconds) {
        this.probability = probability;
        this.probabilityRatePerSeconds = probabilityRatePerSeconds;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.declineRatePerSeconds = declineRatePerSeconds;
    }
};

module.exports.diseaseSystem = function diseaseSystem(groupName, world) {
    
};