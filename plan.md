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
- [ ] winning
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

# Maintenance Tasks
- [ ] create a Board class for functions that affect all Cells
- [ ] maybe use seperate js files for classes
- [ ] create a working starting point on git
- [ ] clean up unnecessary css
- [ ] clean up reset the game button (add button in html instead of js)

--------------------------------------

# TASKS
- create a working starting point on git
- implement winning the game
