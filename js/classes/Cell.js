export default class Cell {
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
                    this.element.style.color = this.grid.constructor.COLOR_MAP[this.nearbyMines]; 
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