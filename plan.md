# One Sentence Goal
A browser minesweeper clone

# Core Loop
- click and reveal cells
- flag cells
- win/lose
- reset the game

# Minimum Features
- [x] generate a grid
- [x] randomly place mines 
- [x] make each cell know how many mines near it
- [x] reveal logic for spots with 0 nearby mines
- [x] losing
- [x] winning
- [x] restarting the game
- [x] simple ui

# Later Features
- changing the size of the game (difficulty prebuilt, or custom dimensions)
- reveal animations (switch from dfs to bfs)
- clean ui, themes
- hiscores
- solver (might be difficult to implement)

# Known Issues
- [low] losing doesnt lock player out from clicking, might cause weird effects
- [med] question or flag state affects empty reveal

# Maintenance Tasks
- create a Board class for functions that affect all Cells
- maybe use seperate js files for classes
- clean up unnecessary css
- clean up reset the game button (add button in html instead of js)
- refactor cell reseting (update appearance should be called in class method probably)
- make cell class more maintainable by adding properties for appearance, instead of all being done in updateAppearance()
- implement debug tools for development

--------------------------------------

# TASKS
- implement winning the game
    - all tiles searched except for ones with mines
    - on each reveal, check if win game
    - board level method, needs state of all cells
        - more efficient: decrease a counter. cell would need to be passed board then?
        - since no board class yet i guess ill decrease a global counter
