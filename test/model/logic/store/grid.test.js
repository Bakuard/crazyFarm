const {Grid} = require('../../../../src/code/model/logic/store/grid.js');

describe.each([
    {x: 10, y: 10, gridWidth: 15, gridHeight: 22, inBound: true},

    {x: 0, y: 10, gridWidth: 15, gridHeight: 22, inBound: true},
    {x: 10, y: 0, gridWidth: 15, gridHeight: 22, inBound: true},
    {x: 14, y: 10, gridWidth: 15, gridHeight: 22, inBound: true},
    {x: 10, y: 21, gridWidth: 15, gridHeight: 22, inBound: true},

    {x: -1, y: 10, gridWidth: 15, gridHeight: 22, inBound: false},
    {x: 10, y: -1, gridWidth: 15, gridHeight: 22, inBound: false},
    {x: 15, y: 10, gridWidth: 15, gridHeight: 22, inBound: false},
    {x: 10, y: 22, gridWidth: 15, gridHeight: 22, inBound: false},

    {x: 0, y: 0, gridWidth: 0, gridHeight: 0, inBound: false}
])(`inBound(x, y):`,
    ({x, y, gridWidth, gridHeight, inBound}) => {
        test(`x ${x}, y ${y}, gridWidth ${gridWidth},gridHeight ${gridHeight}
              => expected return result ${inBound}`,
        () => {
            let grid = new Grid(gridWidth, gridHeight);

            expect(grid.inBound(x, y)).toBe(inBound);
        });
    }
);

describe.each([
    {
        x: 10, 
        y: 10, 
        gridWidth: 20, 
        gridHeight: 15, 
        expectResult: ['9|9',  '10|9',  '11|9',
                       '9|10',          '11|10',
                       '9|11', '10|11', '11|11']
    },
    {
        x: 0, 
        y: 0, 
        gridWidth: 20, 
        gridHeight: 15, 
        expectResult: [       '1|0',
                       '0|1', '1|1']
    },
    {
        x: 19, 
        y: 14, 
        gridWidth: 20, 
        gridHeight: 15, 
        expectResult: ['18|13', '19|13',
                       '18|14']
    }
])(`getNeigboursFor(x, y):`,
    ({x, y, gridWidth, gridHeight, expectResult}) => {
        test(`x ${x}, 
              y ${y}, 
              gridWidth ${gridWidth}, 
              gridHeight ${gridHeight}
              => expected return result ${expectResult}`,
        () => {
            let grid = new Grid(gridWidth, gridHeight);
            grid.fill((currentX, currentY) => currentX + '|' + currentY);

            let actual = grid.getNeigboursFor(x, y).map(cell => cell.value);

            expect(actual).toEqual(expectResult);
        });
    }
);

describe.each([
    {
        x: 10, 
        y: 10, 
        gridWidth: 20, 
        gridHeight: 15, 
        neigboursNumber: 4,
        randomValues: [0.1, 0.9, 0.2, 0.9],
        expectResult: ['9|9', '9|10', '11|9', '10|9']
    },
    {
        x: 10, 
        y: 10, 
        gridWidth: 20, 
        gridHeight: 15, 
        neigboursNumber: 8,
        randomValues: [0.2, 0.4, 0.9, 0.5, 0.1, 0.3, 0.7, 0.5],
        expectResult: ['10|9','9|10','11|11','9|11','11|10','9|9','11|9','10|11']
    },
    {
        x: 10, 
        y: 10, 
        gridWidth: 20, 
        gridHeight: 15, 
        neigboursNumber: 9,
        randomValues: [0.2, 0.4, 0.9, 0.5, 0.1, 0.3, 0.7, 0.5],
        expectResult: ['10|9','9|10','11|11','9|11','11|10','9|9','11|9','10|11']
    },
    {
        x: 10, 
        y: 10, 
        gridWidth: 20, 
        gridHeight: 15, 
        neigboursNumber: 0,
        randomValues: [0.2, 0.4, 0.9, 0.5, 0.1, 0.3, 0.7, 0.5],
        expectResult: []
    }
])(`getRandomNeigboursFor(x, y, neigboursNumber, randomGenerator):`,
    ({x, y, gridWidth, gridHeight, neigboursNumber, randomValues, expectResult}) => {
        test(`x ${x}, 
              y ${y}, 
              gridWidth ${gridWidth}, 
              gridHeight ${gridHeight}, 
              neigboursNumber ${neigboursNumber}, 
              randomValues ${randomValues}
              => expected return result ${expectResult}`,
        () => {
            let randomGenerator = () => {
                if(!randomGenerator.index) randomGenerator.index = 0;
                return randomValues[randomGenerator.index++];
            }
            let grid = new Grid(gridWidth, gridHeight);
            grid.fill((currentX, currentY) => currentX + '|' + currentY);

            let actual = grid.getRandomNeigboursFor(x, y, neigboursNumber, randomGenerator).map(cell => cell.value);

            expect(actual).toEqual(expectResult);
        });
    }
);

test(`clone(itemCloner) and equal(otherGrid, itemComparator):
        => cloned grid must be equal to original`,
() => {
    let grid = new Grid(10, 5);
    grid.fill((x, y) => { return {x, y}});

    let copy = grid.map((x, y, item) => { return {x, y}});
    let actual = grid.equals(copy, (a, b) => a.x == b.x && a.y == b.y);

    expect(actual).toBe(true);
});
