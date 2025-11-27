import Grid from "./js/classes/Grid.js";

let GAME_VALUES = {
    gridHeight: 10,
    gridWidth: 10,
    numMines: 10
}



function setGameValues(gridHeight, gridWidth, numMines) {
    GAME_VALUES.gridHeight = gridHeight;
    GAME_VALUES.gridWidth = gridWidth;
    GAME_VALUES.numMines = numMines;
}

function startGame() {
    //DRIVER
    //init grid
    //TODO: prob should just update old board instead of creating new ones each game
    const grid = new Grid(GAME_VALUES.gridHeight, GAME_VALUES.gridWidth, GAME_VALUES.numMines); 

    // add each Cell's element to dom
    grid.addCellsToDom();

    //setup game
    grid.resetGame();

    //TODO: figure out how to deal with grid reference in reset btn
    const resetButton = document.getElementById("reset-btn")
    resetButton.addEventListener("click", grid.resetGame.bind(grid));
}


startGame();

//add eventlisteners to ui
const difficultySelect = document.getElementById("difficulty-select");
difficultySelect.addEventListener("change", (e) => {
    //reset css
    const gameGrid = document.getElementById("game-grid"); 
    gameGrid.classList.remove("game-grid-easy", "game-grid-medium", "game-grid-hard")


    //remove old board
    gameGrid.innerHTML = ""

    //set game values and css
    switch (e.target.value) {
        case "easy":
            setGameValues(10, 10, 10);
            gameGrid.classList.add("game-grid-easy");
            document.querySelector(".game-options").style.width = "400px"; //jank temp fix

            break;
        case "medium":
            setGameValues(16, 16, 40);
            gameGrid.classList.add("game-grid-medium");
            document.querySelector(".game-options").style.width = "640px"; //jank temp fix

            break;
        case "hard":
            setGameValues(16, 30, 99);
            gameGrid.classList.add("game-grid-hard");
            document.querySelector(".game-options").style.width = "1200px"; //jank temp fix
            break;
    }

    startGame();

})







