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

//TODO: put this in html and css
//reset game button
const testButtonEl = document.createElement("button");
testButtonEl.innerText = "Reset";
testButtonEl.addEventListener("click", grid.resetGame.bind(grid));
document.querySelector("main").appendChild(testButtonEl);
testButtonEl.style.padding = "5px";
testButtonEl.style.marginTop= "5px";






