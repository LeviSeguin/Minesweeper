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
    constructor(element) {
        this.state = "hidden";
        this.nearbyMines = 0;
        this.containsMine = false;
        this.element = element;
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
        if (this.containsMine) {
            //TODO: lose the game
                //setTimeout(() => {alert("You lose!")}, 50);
        }
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
                break;
            case "flagged":
                this.element.innerText = "🚩";
                break;
            case "questionMark":
                this.element.innerText = "?";
                break;
            default:
                alert(`unknown appearance for state: ${this.state}`);
        }
    }
}

const gridElement = document.getElementById("game-grid");
let gridWidth = 10;
let gridHeight = 10;
let mineCount = 10;
const grid = []

// init grid with Cells
for (let row = 0; row < gridWidth; row++) {
    const gridRow = [];
    for (let col = 0; col < gridHeight; col++) {
        //Cell instance with element reference
        const newCellElement = document.createElement("button");
        const cell = new Cell(newCellElement);

        gridRow.push(cell)
    }
    grid.push(gridRow);
}

// add each Cell's element to dom
for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridWidth; j++) {
        gridElement.appendChild(grid[i][j].element);
    }
}

//add eventListeners to elements
for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridWidth; j++) {
        const currCell = grid[i][j];
        const currEl = currCell.element;

        //left click
        currEl.addEventListener("click", () => {
            revealEmptyNeighbours(i, j, gridWidth, gridHeight, grid);
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

//TODO: implement async bfs isntead of jank setTimeout
//function to dfs reveal empty neighbours
function revealEmptyNeighbours(r, c, width, height, grid) {
    if (grid[r][c].state !== "hidden") {
        return
    }

    grid[r][c].reveal();

    //dont dfs if mine
    if(grid[r][c].containsMine) return;

    //dfs
    if (grid[r][c].nearbyMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                //create neighbour cell coords
                const nr = r + dr;
                const nc = c + dc;

                //check bounds of neighbour cell
                if (nr < 0 || nr >= height || nc < 0 || nc >= width) {
                    continue;
                }
                setTimeout(() => {revealEmptyNeighbours(nr, nc, width, height, grid)}, 150);
                
            }
        }
    }
}

//TODO: forEachCell function
//TODO: consider creating a board class

function forEachCell(grid, func) {
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            func(grid[i][j]);
        }
    }
}

//reset game 
function resetGame(){
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
}

//testing reset game
const testButtonEl = document.createElement("button");
testButtonEl.innerText = "reset";
testButtonEl.addEventListener("click", resetGame);
document.querySelector("main").appendChild(testButtonEl);






