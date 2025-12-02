import Cell from "./Cell.js";

export default class Grid {
    static COLOR_MAP = {
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

    constructor(gridHeight = 10, gridWidth = 10, mineCount = 10) {
        this.grid = []
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.mineCount = mineCount;
        this.flagCount = 0;
        this.element = document.getElementById("game-grid"); //should update this to create a new one then add to dom maybe
        this.state = {
            remainingEmptyCells: (this.gridWidth * this.gridHeight) - this.mineCount,
            minesFound: 0,
        }
        this.isBusy = false;

        //fill grid with cells
        for (let r = 0; r < this.gridHeight; r++) {
            const row = [];
            for (let c = 0; c < this.gridWidth; c++) {
                row.push(new Cell(this, r, c));
            }
            this.grid.push(row);
        }

        //add eventListeners to cells
        for (let r = 0; r < this.gridHeight; r++) {
            for (let c = 0; c < this.gridWidth; c++) {
                const currCell = this.grid[r][c];
                const currEl = currCell.element;

                //left click
                currEl.addEventListener("click", () => {
                    this.cellClicked(r, c);
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

        //layered bfs
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


            await this.sleep(100);
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
        for (let r = 0; r < this.gridHeight; r++) {
            for (let c = 0; c < this.gridWidth; c++) {
                callback(this.grid[r][c]);
            }
        }
    }

    addCellsToDom() {
        this.forEachCell(cell => this.element.appendChild(cell.element));
    }

    //takes a cellInfo object from Cell.reveal with info needed to update game state
    onCellRevealed(cellInfo) {
        cellInfo.hasMine ? this.state.minesFound++ : this.state.remainingEmptyCells--;
    }


    onFlagStateChanged(cellNewState) {
        if (cellNewState === "flagged") {
            this.flagCount += 1;
        } else if (cellNewState === "questionMark") {
            this.flagCount -= 1;
        }

        //Grid should probably not update ui but oh well
        document.getElementById("mine-counter").innerText = `💣: ${this.mineCount - this.flagCount}`
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
            alert("You win! Play again?")
            this.resetGame();
        }, 30);
    }

    //loses the game and resets
    loseGame() {
        setTimeout(() => {
            alert("You lose! Play again?")
            this.resetGame();
        }, 30);
    }

    //randomly places mines 
    placeMines() {      
        //randomly generate mine locations, avoiding duplicates by using a set
        const mines = new Set(); // "row,col"
        while (mines.size < this.mineCount) {
            const r = Math.floor(Math.random() * this.gridHeight);
            const c = Math.floor(Math.random() * this.gridWidth);
            mines.add(`${r},${c}`);
        }

        //place mines
        for (const m of mines) {
            const [r, c] = m.split(",").map(Number);
            this.grid[r][c].placeMine();
        }
    }

    //returns number of nearby mines at grid[r][c]
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
        //disable reset while searching
        if (this.isBusy) return;

        //reset game state
        this.state.remainingEmptyCells = (this.gridWidth * this.gridHeight) - this.mineCount;
        this.state.minesFound = 0;
        this.flagCount = 0;

        //set all cells to hidden
        this.forEachCell(cell => cell.reset());

        //place new mines
        this.placeMines();

        //count nearby mines
        //OPTIONAL TODO: turn callback into a "updateCellNearbyMines" method or something
        this.forEachCell(cell => cell.nearbyMines = this.countNearbyMines(cell.row, cell.col))

        //update appearance
        this.forEachCell(cell => cell.updateAppearance());

        //Grid should probably not update ui but oh well
        document.getElementById("mine-counter").innerText = `💣: ${this.mineCount}`
    }

    //helper function for reveal animation
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }   
}