const COLOR_MAP = {
    0: "black",
    1: "blue",
    2: "green",
    3: "red",
    4: "purple",
    5: "maroon",
    6: "cyan",
    7: "black",
    8: "pink",
}



class Cell {
    //takes a reference to it's Grid
    constructor(grid, row, col) {
        this.state = "hidden";
        this.nearbyMines = 0;
        this.containsMine = false;
        this.element = document.createElement("button");
        this.grid = grid;
        this.row = row;
        this.col = col;
    }

    reset() {
        this.state = "hidden";
        this.nearbyMines = 0;
        this.containsMine = false;
    }

    //state updating functions
    reveal() {
        this.state = "revealed";
        this.updateAppearance();

        //update grid state by passing cellInfo object to Grid.updateGameState
        const cellInfo = { hasMine: this.containsMine }
        this.grid.updateGameState(cellInfo);
    }

    flag() {
        if (this.state ==="hidden") {
            this.state = "flagged";
        } else if (this.state === "flagged") {
            this.state = "questionMark";
        } else if (this.state ==="questionMark") {
            this.state = "hidden";
        }
        
        this.updateAppearance();
    }

    placeMine() {
        this.containsMine = true;
    }

    //updates appearance of cell
    updateAppearance() {
        switch (this.state) {
            case "revealed":
                if (this.containsMine) {
                    this.element.innerText = "💣"
                } else {
                    //put number in cell
                    if (this.nearbyMines > 0) this.element.innerText = this.nearbyMines;
                    this.element.style.color = COLOR_MAP[this.nearbyMines]; 
                }

                this.element.style.backgroundColor = "grey";
                this.element.style.border = "none";
                break;
            
            case "hidden":
                this.element.innerText = "";
                this.element.style.backgroundColor = "white";
                this.element.style.border = "1px solid grey";
                this.element.style.color = "black"
                break;
            case "flagged":
                this.element.innerText = "🚩";
                break;
            case "questionMark":
                this.element.innerText = "?";
                break;
            //shouldnt reach default
            default:
                alert(`unknown appearance for state: ${this.state}`);
        }
    }
}

const gridElement = document.getElementById("game-grid");
let gridWidth = 10;
let gridHeight = 10;
let mineCount = 10;
let remainingEmptyCells = (gridWidth * gridHeight) - mineCount;
const grid = []

class Grid {
    constructor(gridWidth = 10, gridHeight = 10, mineCount = 10) {
        this.grid = []
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.mineCount = mineCount;
        this.element = document.getElementById("game-grid"); //should update this to create a new one then add to dom 
        this.state = {
            remainingEmptyCells: (this.gridWidth * this.gridHeight) - this.mineCount,
            minesFound: 0,
        }
        this.isBusy = false;

        //fill grid with cells
        for (let i = 0; i < this.gridWidth; i++) {
            const row = [];
            for (let j = 0; j < this.gridHeight; j++) {
                row.push(new Cell(this, i, j));
            }
            this.grid.push(row);
        }

        //TODO: finish after "cellClicked"
        //add eventListeners to cells
        for (let i = 0; i < this.gridWidth; i++) {
            for (let j = 0; j < this.gridWidth; j++) {
                const currCell = grid[i][j];
                const currEl = currCell.element;

                //left click
                currEl.addEventListener("click", () => {
                    cellClicked(i, j, gridWidth, gridHeight, grid);
                })

                //right click
                currEl.addEventListener("contextmenu", e => {
                    e.preventDefault();
                    currCell.flag();
                })
            }
        }
    }

    //reveals all nearby 0 cells, then checks game state for win or lose
    async bfsFindCells(r, c) {
        if (grid[r][c].state !== "hidden") return;

        //bfs
        let queue = [[[r, c]]];
        let queued = new Set();
        queued.add(`${r},${c}`);

        while (queue.length > 0) {
            const currPoints = queue.shift();
            const newLayer = [];

            //adjusted this, might break
            //reveal
            for (const [row, col] of currPoints) { 
                grid[row][col].reveal()
            }

            await sleep(100);
            //bfs add all cells
            for (const [row, col] of currPoints) {

                //iterate through curr cells neighbours
                if (grid[row][col].nearbyMines === 0) {
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            //create neighbour cell coords
                            const nr = row + dr;
                            const nc = col + dc;
                            const key = `${nr},${nc}`;

                            //check bounds of neighbour cell
                            if (nr < 0 || nr >= height || nc < 0 || nc >= width) {
                                continue;
                            }
                            if (grid[nr][nc].state !== "hidden") continue;
                            if (queued.has(key)) continue;

                            newLayer.push([nr, nc]);
                            queued.add(key);
                        }
                    }
                    
                }

            }
            if (newLayer.length > 0) queue.push(newLayer);
        }

        //check game state after bfs is done
        this.checkGameState();
    }

    //logic for what cell at this.grid[row][col] should do when clicked
    async cellClicked(row, col) {
        //if busy, do nothing
        if (this.isBusy) return;
        //if not hidden, do nothing
        if (this.grid[row][col].state !== "hidden") return;

        //cell is hidden and grid not busy. set grid to busy and reveal cells using bfs 
        this.isBusy = true;
        await this.bfsFindCells(row, col);
        this.isBusy = false;
    }

    //pass a function that takes "cell" as a parameter, calls on each cell
    forEachCell(callback) {
        for (let i = 0; i < this.gridWidth; i++) {
            for (let j = 0; j < this.gridHeight; j++) {
                callback(this.grid[i][j]);
            }
        }
    }

    addCellsToDom() {
        this.forEachCell(cell => this.element.appendChild(cell.element));
    }

    //takes an object from Cell.reveal with info needed to update game state
    updateGameState(cellInfo) {
        cellInfo.hasMine ? this.state.minesFound++ : this.state.remainingEmptyCells--;
    }

    //wins or loses game based on this.state
    checkGameState() {
        if (this.state.minesFound > 0) {
            this.loseGame();
            return "lost";
        }
        if (this.state.remainingEmptyCells === 0) {
            this.winGame();
            return "won";
        }
        return "inProgress";
    }

    //wins the game and resets
    winGame() {
        setTimeout(() => {
            alert("you win the game!")
            resetGame();
        }, 30);
    }

    //loses the game and resets
    loseGame() {
        setTimeout(() => {
            alert("You lose!")
            resetGame();
        }, 500);
    }

    placeMines() {      
        //randomly generate mine locations, avoiding duplicates by using a set
        const mines = new Set(); // "row,col"
        while (mines.size < this.mineCount) {
            const r = Math.floor(Math.random() * this.gridHeight);
            const c = Math.floor(Math.random() * this.gridWidth);
            mines.add(`${r},${c}`);
        }

        //call Cell.placeMine() for each mine
        for (const m of mines) {
            const [r, c] = m.split(",").map(Number);
            grid[r][c].placeMine();
        }
    }

    //TODO: finish
    resetGame() {
        //reset counter for remaining empty cells
        //remainingEmptyCells = (gridWidth * gridHeight) - mineCount;
        this.state.remainingEmptyCells = (this.gridWidth * this.gridHeight) - this.mineCount;

        //set all cells to hidden
        //forEachCell(grid, cell => cell.reset());
        this.forEachCell(grid, cell => cell.reset());

        //place new mines
        //placeMines(gridWidth, gridHeight, mineCount, grid);
        this.placeMines();

        //count nearby mines
        //TODO: finish after countNearbyMines function
        /*
        for (let i = 0; i < gridWidth; i++) {
            for (let j = 0; j < gridHeight; j++) {
            grid[i][j].nearbyMines = countNearbyMines(i, j, gridWidth, gridHeight, grid);
            }
        }
        */
        this.forEachCell(cell => )
        //update appearance
        forEachCell(grid, cell => cell.updateAppearance());

        //DEBUG
        //forEachCell(grid, cell => cell.state = "revealed");
        //forEachCell(grid, cell => cell.updateAppearance());
    }

}

//TODO: add functionality to checkGameState
//decrease count of remaining empty cells
function cellRevealed() {
    remainingEmptyCells -= 1;
    return checkWinGame();
}

//DONE
//check if game is won
function checkWinGame() {
    if (remainingEmptyCells === 0) {
        setTimeout(() => {
            alert("you win the game!")
            resetGame();
        }, 30);
        return true
    }
    return false
}

//DONE
// init grid with Cells
for (let row = 0; row < gridWidth; row++) {
    const gridRow = [];
    for (let col = 0; col < gridHeight; col++) {
        //Cell instance with element reference
        const cell = new Cell();

        gridRow.push(cell)
    }
    grid.push(gridRow);
}

//DONE
// add each Cell's element to dom
for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridWidth; j++) {
        gridElement.appendChild(grid[i][j].element);
    }
}

//TODO: finish after doing "cellClicked"
//add eventListeners to elements
for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridWidth; j++) {
        const currCell = grid[i][j];
        const currEl = currCell.element;

        //left click
        currEl.addEventListener("click", () => {
            cellClicked(i, j, gridWidth, gridHeight, grid);
        })

        //right click
        currEl.addEventListener("contextmenu", e => {
            e.preventDefault();
            currCell.flag();
        })
    }
}

//place mines function
function placeMines(width, height, mineCount, grid) {
    
    //randomly generate mine locations, avoiding duplicates by using a set
    const mines = new Set(); // "row,col"
    while (mines.size < mineCount) {
        const r = Math.floor(Math.random() * height);
        const c = Math.floor(Math.random() * width);
        mines.add(`${r},${c}`);
    }

    //place mines
    for (const m of mines) {
        const [r, c] = m.split(",").map(Number);
        grid[r][c].placeMine();
    }  
}
//place mines
placeMines(gridWidth, gridHeight, mineCount, grid);

//count nearby mines function
function countNearbyMines(r, c, width, height, grid) {
    let count = 0;
    //loop from -1 to 1 for delta row and delta col 
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            //skip center cell
            if (dr === 0 && dc === 0) {
                continue;
            }
            
            //create neighbour cell coords
            const nr = r + dr;
            const nc = c + dc;

            //check bounds of neighbour cell
            if (nr < 0 || nr >= height || nc < 0 || nc >= width) {
                continue;
            }
            //inc count if mine at neighbour
            if (grid[nr][nc].containsMine) {
                count += 1
            }
        }
    }
    return count;
}

//count nearby mines for each cell
for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridHeight; j++) {
        grid[i][j].nearbyMines = countNearbyMines(i, j, gridWidth, gridHeight, grid);
    }
}

// helper sleep function for animation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//TODO: finish after doing bfs
let isGridBusy = false;
//calls helper dfs and disables clicks while running
async function cellClicked(r, c, width, height, grid) {
    if (isGridBusy) return;
    if (grid[r][c].state !== "hidden") return;

    isGridBusy = true;
    await bfsEmptyNeighbours(r, c, width, height, grid);
    isGridBusy = false;
}

//helper dfs to reveal empty neighbours
async function revealEmptyNeighbours(r, c, width, height, grid) {
    if (grid[r][c].state !== "hidden") {
        return
    }

    grid[r][c].reveal();

    //dont dfs if mine
    if(grid[r][c].containsMine) return;
    
    //dfs
    if (grid[r][c].nearbyMines === 0) {
        await sleep(100);
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                //create neighbour cell coords
                const nr = r + dr;
                const nc = c + dc;

                //check bounds of neighbour cell
                if (nr < 0 || nr >= height || nc < 0 || nc >= width) {
                    continue;
                }

                //recur
                await revealEmptyNeighbours(nr, nc, width, height, grid)
            }
        }
    }
}

async function bfsEmptyNeighbours(r, c, width, height, grid) {
    if (grid[r][c].state !== "hidden") return;

    //bfs
    let queue = [[[r, c]]];
    let queued = new Set();
    queued.add(`${r},${c}`);

    while (queue.length > 0) {
        console.log("queue:", queue);
        const currPoints = queue.shift();
       
        const newLayer = [];

        //reveal
        for (const [row, col] of currPoints) { 
            if (grid[row][col].reveal()) return;
            if (grid[row][col].containsMine) return;
        }
        await sleep(100);
        //bfs add all cells
        for (const [row, col] of currPoints) {

            //iterate through curr cells neighbours
            if (grid[row][col].nearbyMines === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        //create neighbour cell coords
                        const nr = row + dr;
                        const nc = col + dc;
                        const key = `${nr},${nc}`;

                        //check bounds of neighbour cell
                        if (nr < 0 || nr >= height || nc < 0 || nc >= width) {
                            continue;
                        }
                        if (grid[nr][nc].state !== "hidden") continue;
                        if (queued.has(key)) continue;

                        newLayer.push([nr, nc]);
                        queued.add(key);
                    }
                }
                
            }

        }
        if (newLayer.length > 0) queue.push(newLayer);
    }
}

//applies func to each cell
function forEachCell(grid, func) {
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            func(grid[i][j]);
        }
    }
}

//reset game 
function resetGame(){
    //reset counter for remaining empty cells
    remainingEmptyCells = (gridWidth * gridHeight) - mineCount;

    //set all cells to hidden
    forEachCell(grid, cell => cell.reset());

    //place new mines
    placeMines(gridWidth, gridHeight, mineCount, grid);

    //count nearby mines
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
        grid[i][j].nearbyMines = countNearbyMines(i, j, gridWidth, gridHeight, grid);
        }
    }
    //update appearance
    forEachCell(grid, cell => cell.updateAppearance());

    //DEBUG
    //forEachCell(grid, cell => cell.state = "revealed");
    //forEachCell(grid, cell => cell.updateAppearance());

}

//reset game button
const testButtonEl = document.createElement("button");
testButtonEl.innerText = "reset";
testButtonEl.addEventListener("click", resetGame);
document.querySelector("main").appendChild(testButtonEl);






