


class Cell {
    //takes a reference to its Grid
    constructor(grid, row, col) {
        this.state = "hidden";
        this.nearbyMines = 0;
        this.containsMine = false;

        this.element = document.createElement("button");
        this.grid = grid;
        this.row = row;
        this.col = col;
    }

    //state updating functions
    reset() {
        this.state = "hidden";
        this.nearbyMines = 0;
        this.containsMine = false;
    }

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
                console.log(`unknown appearance for Cell state: ${this.state}`);
        }
    }
}

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
                const currCell = this.grid[i][j];
                const currEl = currCell.element;

                //left click
                currEl.addEventListener("click", () => {
                    this.cellClicked(i, j);
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
        if (this.grid[r][c].state !== "hidden") return;

        //bfs
        let queue = [[[r, c]]];
        let queued = new Set();
        queued.add(`${r},${c}`);

        while (queue.length > 0) {
            const currPoints = queue.shift();
            const newLayer = [];

            //reveal current layer
            for (const [row, col] of currPoints) { 
                this.grid[row][col].reveal()
            }

            //dont search if initial cell had a mine
            if (this.grid[r][c].containsMine) break; //break so can check game state after loop!


            await sleep(100);
            //bfs add all cells
            for (const [row, col] of currPoints) {

                //iterate through curr cells neighbours
                if (this.grid[row][col].nearbyMines === 0) {
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            //create neighbour cell coords
                            const nr = row + dr;
                            const nc = col + dc;
                            const key = `${nr},${nc}`;

                            //check bounds of neighbour cell
                            if (nr < 0 || nr >= this.gridHeight|| nc < 0 || nc >= this.gridWidth) {
                                continue;
                            }
                            if (this.grid[nr][nc].state !== "hidden") continue;
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
            this.resetGame();
        }, 30);
    }

    //loses the game and resets
    loseGame() {
        setTimeout(() => {
            alert("You lose!")
            this.resetGame();
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
            this.grid[r][c].placeMine();
        }
    }

    countNearbyMines(r, c) {
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
                if (nr < 0 || nr >= this.gridHeight || nc < 0 || nc >= this.gridWidth) {
                    continue;
                }
                //inc count if mine at neighbour
                if (this.grid[nr][nc].containsMine) {
                    count += 1
                }
            }
        }
        return count;
    }

    resetGame() {
        //reset game state
        this.state.remainingEmptyCells = (this.gridWidth * this.gridHeight) - this.mineCount;
        this.state.minesFound = 0;

        //set all cells to hidden
        this.forEachCell(cell => cell.reset());

        //place new mines
        this.placeMines();

        //count nearby mines
        //OPTIONAL TODO: turn callback into a "updateCellNearbyMines" method or something
        this.forEachCell(cell => cell.nearbyMines = this.countNearbyMines(cell.row, cell.col))

        //update appearance
        this.forEachCell(cell => cell.updateAppearance());


    }
}

// helper sleep function for animation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const GAME_VALUES = {
    gridHeight: 10,
    gridWidth: 10,
    numMines: 10
}

//could put this into Grid and cells access from there
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

//DRIVER
const grid = new Grid(GAME_VALUES.gridHeight, GAME_VALUES.gridWidth, GAME_VALUES.numMines);

// add each Cell's element to dom
grid.addCellsToDom();

//setup game
grid.resetGame();


//OPTIONAL: add different searches to grid, user can choose which one they want
//OLD: helper dfs to reveal empty neighbours
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

//reset game button
const testButtonEl = document.createElement("button");
testButtonEl.innerText = "Reset";
testButtonEl.addEventListener("click", grid.resetGame.bind(grid));
document.querySelector("main").appendChild(testButtonEl);
testButtonEl.style.padding = "5px";
testButtonEl.style.marginTop= "5px";






