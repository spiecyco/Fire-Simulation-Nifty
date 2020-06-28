// Made by Richard Gao and Dylan Lee

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const DIMENSIONS = { x: 17, y: 17 };
const CELL_SIZE = 40;
canvas.width = DIMENSIONS.x * CELL_SIZE;
canvas.height = DIMENSIONS.y * CELL_SIZE;
const TREE = 1;
const EMPTY = 0;
const BURNING = 2;
const BORDER = 4;
const probC = 0.2;
const probTree = 0.9;
const probBurning = 0.05;
const probLightning = 0.2;
const probGrow = 0.2;
const turnsToBurn = 1;

class Cell {
	constructor(status, probCatch, burnCounter) {
		this._status = status;
		this._probCatch = probCatch;
		this._burnCounter = burnCounter;
	}
	get status() {
		return this._status;
	}
	get probCatch() {
		return this._probCatch;
	}
	get burnCounter() {
		return this._burnCounter;
	}

	set status(s) {
		this._status = s;
	}
	set probCatch(p) {
		this._probCatch = p;
	}
	set burnCounter(c) {
		this._burnCounter = c;
	}
}

// Initialize the grid array
let grid = (() => {
	let res = [];

	for (let i = 0; i < DIMENSIONS.x; i++) {
		res.push([]);
	}
	for (let i = 0; i < DIMENSIONS.y; i++) {
		for (let j = 0; j < DIMENSIONS.x; j++) {
			if (
				i === 0 ||
				j === 0 ||
				i === DIMENSIONS.y - 1 ||
				j === DIMENSIONS.x - 1
			) {
				res[i].push(new Cell(BORDER, 0));
			} else {
				if (Math.random() < probTree) {
					if (Math.random() < probBurning) {
						res[i].push(new Cell(BURNING, 0, 0));
					} else {
						res[i].push(new Cell(TREE, 0, 0));
					}
				} else {
					res[i].push(new Cell(EMPTY, 0, 0));
				}
			}
		}
	}
	// res[Math.floor(DIMENSIONS.x / 2)][Math.floor(DIMENSIONS.y / 2)].status = BURNING;

	return res;
})();

function draw() {
	for (i = 0; i < DIMENSIONS.y; i++) {
		for (j = 0; j < DIMENSIONS.x; j++) {
			if (grid[i][j].status === TREE) {
				ctx.fillStyle = 'green';
			} else if (grid[i][j].status === EMPTY || grid[i][j].status === BORDER) {
				ctx.fillStyle = 'yellow';
			} else if (grid[i][j].status === BURNING) {
				ctx.fillStyle = 'brown';
			}
			ctx.strokeRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);

			ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
		}
	}
}

function update() {
	for (let i = 0; i < DIMENSIONS.y; i++) {
		for (let j = 0; j < DIMENSIONS.x; j++) {
			if (grid[i][j].status === BURNING) {
				// Apply burn spread
				if (grid[i + 1][j].status !== EMPTY) {
					grid[i + 1][j].probCatch = probC;
				}
				if (grid[i - 1][j].status !== EMPTY) {
					grid[i - 1][j].probCatch = probC;
				}
				if (grid[i][j + 1].status !== EMPTY) {
					grid[i][j + 1].probCatch = probC;
				}
				if (grid[i][j - 1].status !== EMPTY) {
					grid[i][j - 1].probCatch = probC;
				}
			}
		}
	}

	// Lightning Strike
	grid.forEach(cellY => {
		cellY.forEach(cellX => {
			if (
				Math.random() < probLightning &&
				cellX.probCatch === 0 &&
				cellX.status === TREE
			) {
				cellX.probCatch = probC;
			}
		});
	});

	// Burning trees go empty
	grid.forEach(cellY => {
		cellY.forEach(cellX => {
			if (cellX.status === BURNING && cellX.burnCounter === turnsToBurn) {
				cellX.status = EMPTY;
				cellX.probCatch = 0;
			} else if (cellX.status === BURNING) {
				cellX.burnCounter++;
			}
		});
	});

	// Catch fire
	grid.forEach(cellY => {
		cellY.forEach(cellX => {
			if (willBurn(cellX)) {
				cellX.status = BURNING;
				cellX.burnCounter++;
			}
		});
	});
	draw();

	// Tree grows back

	grid.forEach(cellY => {
		cellY.forEach(cellX => {
			if (Math.random() < probGrow && cellX.status === EMPTY) {
				cellX.status = TREE;
				cellX.burnCounter = 0;
				cellX.probCatch = 0;
			}
		});
	});

	draw();
}

const timeStep = x => {
	for (let i = 0; i < x; i++) {
		update();
	}
};

const willBurn = cell => {
	if (Math.random() < cell.probCatch && cell.status === TREE) {
		return true;
	} else {
		return false;
	}
};

document.querySelector('.update').addEventListener('click', () => {
	// let step = parseInt(document.querySelector(".step").nodeValue);
	timeStep(1);
});

draw();

let toggle = 0;
let auto;
document.querySelector('#auto').addEventListener('click', () => {
	if ((toggle % 2) === 0) {
		auto = setInterval(update, 100);
	} else {
		clearInterval(auto);
	}
	toggle++;
});
