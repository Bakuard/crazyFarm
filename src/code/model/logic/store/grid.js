'use strict'

module.exports.Grid = class Grid {
    static of(width, height, ...items) {
        let grid = new Grid(width, height);
        for(let i = 0; i < grid.cellsNumber() && i < items.length; i++) {
            grid.#data[i] = items[i];
        }
        return grid;
    }

    #width;
    #height;
    #data;

    constructor(width, height) {
        this.#width = width;
        this.#height = height;
        this.#data = new Array(width * height);
        this.#data.fill(null);
    }

    write(x, y, value) {
        this.#data[x + this.#width * y] = value;
    }

    get(x, y) {
        return this.#data[x + this.#width * y];
    }

    remove(x, y) {
        this.write(x, y, null);
    }

    width() {
        return this.#width;
    }

    height() {
        return this.#height;
    }

    cellsNumber() {
        return this.#width * this.#height;
    }

    fill(callback) {
        for(let x = 0; x < this.#width; x++) {
            for(let y = 0; y < this.#height; y++) {
                this.write(x, y, callback(x, y));
            }
        }
    }

    getNeigboursFor(x, y) {
        let result = [];

        for(let deltaY = -1; deltaY <= 1; deltaY++) {
            for(let deltaX = -1; deltaX <= 1; deltaX++) {
                let neighbourX = x + deltaX;
                let neighbourY = y + deltaY;
                if((neighbourX != x || neighbourY != y) && this.inBound(neighbourX, neighbourY)) {
                    result.push({
                        x: neighbourX,
                        y: neighbourY,
                        value: this.get(neighbourX, neighbourY)
                    });
                }
            }
        }

        return result;
    }

    getRandomNeigboursFor(x, y, neigboursNumber, randomGenerator) {
        let neigbours = this.getNeigboursFor(x, y);
        neigboursNumber = Math.min(neigboursNumber, neigbours.length);

        for(let i = 0; i < neigboursNumber; i++) {
            const randomIndex = Math.floor(randomGenerator() * (neigboursNumber - i) + i);
            const randomItem = neigbours[randomIndex];
            neigbours[randomIndex] = neigbours[i];
            neigbours[i] = randomItem;
        }

        return neigbours.slice(0, neigboursNumber);
    }

    inBound(x, y) {
        return x >= 0 && x < this.#width && y >= 0 && y < this.#height;
    }

    forEach(callback) {
        for(let y = 0; y < this.#height; y++) {
            for(let x = 0; x < this.#width; x++) {
                callback(x, y, this.get(x, y));
            }
        }
    }

    clone(itemCloner) {
        let grid = new Grid(this.#width, this.#height);
        this.forEach((x, y, value) => grid.write(x, y, itemCloner(value)));
        return grid;
    }

    equals(otherGrid, itemComparator) {
        let result = otherGrid.#width == this.#width && otherGrid.#height == this.#height;
        for(let i = 0; i < this.#data.length && result; i++) {
            result = itemComparator(this.#data[i], otherGrid.#data[i]);
        }
        return result;
    }

    toString(itemStringConverter) {
        let items = [];
        this.forEach((x, y, item) => items.push(`{x: ${x}, y: ${y}, item: ${itemStringConverter(item)}}`));
        return `Grid{width: ${this.#width}, height: ${this.#height}, items: [${items.join(', ')}]}`;
    }

};