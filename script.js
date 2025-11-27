import Grid from "./js/classes/Grid.js";

const GAME_VALUES = {
    gridHeight: 10,
    gridWidth: 10,
    numMines: 10
}

//DRIVER
//init grid
const grid = new Grid(GAME_VALUES.gridHeight, GAME_VALUES.gridWidth, GAME_VALUES.numMines);

// add each Cell's element to dom
grid.addCellsToDom();

//setup game
grid.resetGame();

//add eventlisteners to ui
const resetButton = document.getElementById("reset-btn")
resetButton.addEventListener("click", grid.resetGame.bind(grid));







