// ==========================================
// MAZE SOLVER
// BFS + DFS
// ==========================================

let maze = [];

let rows = 15;
let cols = 20;

let start = {
    row: 0,
    col: 0
};

let end = {
    row: rows - 1,
    col: cols - 1
};

let solving = false;


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    createMaze();
});


// ==========================================
// CREATE MAZE
// ==========================================

function createMaze() {

    rows = parseInt(
        document.getElementById("rows").value
    );

    cols = parseInt(
        document.getElementById("cols").value
    );

    if (rows < 5 || cols < 5) {
        alert("Minimum maze size is 5 × 5");
        return;
    }

    if (rows > 30 || cols > 40) {
        alert("Maximum maze size is 30 × 40");
        return;
    }

    start = {
        row: 0,
        col: 0
    };

    end = {
        row: rows - 1,
        col: cols - 1
    };

    generateMaze();
}


// ==========================================
// GENERATE RANDOM MAZE
// ==========================================

function generateMaze() {

    clearPath();

    maze = [];

    for (let r = 0; r < rows; r++) {

        maze[r] = [];

        for (let c = 0; c < cols; c++) {

            maze[r][c] =
                Math.random() < 0.25 ? 1 : 0;

        }
    }


    // Make sure Start and End are free

    maze[start.row][start.col] = 0;

    maze[end.row][end.col] = 0;


    // Create a guaranteed basic path

    let r = 0;
    let c = 0;

    while (r < rows - 1 || c < cols - 1) {

        maze[r][c] = 0;

        if (r === rows - 1) {

            c++;

        } else if (c === cols - 1) {

            r++;

        } else if (Math.random() < 0.5) {

            c++;

        } else {

            r++;

        }

    }

    maze[end.row][end.col] = 0;

    drawMaze();

    resetStats();
}


// ==========================================
// DRAW MAZE
// ==========================================

function drawMaze() {

    const mazeElement =
        document.getElementById("maze");

    mazeElement.innerHTML = "";

    mazeElement.style.gridTemplateColumns =
        `repeat(${cols}, 25px)`;


    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            const cell =
                document.createElement("div");

            cell.classList.add("cell");

            cell.id =
                `cell-${r}-${c}`;


            if (maze[r][c] === 1) {
                cell.classList.add("wall");
            }


            if (
                r === start.row &&
                c === start.col
            ) {

                cell.classList.add("start");

            }


            if (
                r === end.row &&
                c === end.col
            ) {

                cell.classList.add("end");

            }


            mazeElement.appendChild(cell);

        }

    }

}


// ==========================================
// SOLVE MAZE
// ==========================================

async function solveMaze(algorithm) {

    if (solving) {
        return;
    }

    solving = true;

    clearPath();

    const startTime = performance.now();

    let result;


    if (algorithm === "BFS") {

        result = bfs();

    } else {

        result = dfs();

    }


    document.getElementById("algorithm")
        .textContent = algorithm;


    document.getElementById("visited")
        .textContent = result.visited;


    const endTime = performance.now();

    document.getElementById("time")
        .textContent =
        `${Math.round(endTime - startTime)} ms`;


    // Animate visited cells

    await animateVisited(result.visitedCells);


    if (result.path.length > 0) {

        await animatePath(result.path);

        document.getElementById("steps")
            .textContent =
            result.path.length - 1;

    } else {

        alert("No path found!");

        document.getElementById("steps")
            .textContent = "0";

    }


    solving = false;
}


// ==========================================
// BFS
// ==========================================

function bfs() {

    const queue = [];

    const visited =
        Array.from(
            { length: rows },
            () => Array(cols).fill(false)
        );


    const parent =
        Array.from(
            { length: rows },
            () => Array(cols).fill(null)
        );


    const visitedCells = [];


    queue.push(start);

    visited[start.row][start.col] = true;


    while (queue.length > 0) {

        const current =
            queue.shift();


        visitedCells.push(current);


        if (
            current.row === end.row &&
            current.col === end.col
        ) {

            break;

        }


        const neighbors =
            getNeighbors(current);


        for (const next of neighbors) {

            if (
                !visited[next.row][next.col] &&
                maze[next.row][next.col] === 0
            ) {

                visited[next.row][next.col] = true;

                parent[next.row][next.col] =
                    current;

                queue.push(next);

            }

        }

    }


    const path =
        reconstructPath(parent);


    return {
        path: path,
        visited: visitedCells.length,
        visitedCells: visitedCells
    };

}


// ==========================================
// DFS
// ==========================================

function dfs() {

    const stack = [];

    const visited =
        Array.from(
            { length: rows },
            () => Array(cols).fill(false)
        );


    const parent =
        Array.from(
            { length: rows },
            () => Array(cols).fill(null)
        );


    const visitedCells = [];


    stack.push(start);


    while (stack.length > 0) {

        const current =
            stack.pop();


        if (
            visited[current.row][current.col]
        ) {

            continue;

        }


        visited[current.row][current.col] = true;

        visitedCells.push(current);


        if (
            current.row === end.row &&
            current.col === end.col
        ) {

            break;

        }


        const neighbors =
            getNeighbors(current);


        // Reverse to create natural movement

        neighbors.reverse();


        for (const next of neighbors) {

            if (
                !visited[next.row][next.col] &&
                maze[next.row][next.col] === 0
            ) {

                if (
                    parent[next.row][next.col] === null
                ) {

                    parent[next.row][next.col] =
                        current;

                }

                stack.push(next);

            }

        }

    }


    const path =
        reconstructPath(parent);


    return {
        path: path,
        visited: visitedCells.length,
        visitedCells: visitedCells
    };

}


// ==========================================
// GET NEIGHBORS
// ==========================================

function getNeighbors(cell) {

    const directions = [

        { row: -1, col: 0 },

        { row: 1, col: 0 },

        { row: 0, col: -1 },

        { row: 0, col: 1 }

    ];


    const neighbors = [];


    for (const direction of directions) {

        const newRow =
            cell.row + direction.row;

        const newCol =
            cell.col + direction.col;


        if (
            newRow >= 0 &&
            newRow < rows &&
            newCol >= 0 &&
            newCol < cols
        ) {

            neighbors.push({
                row: newRow,
                col: newCol
            });

        }

    }


    return neighbors;

}


// ==========================================
// RECONSTRUCT PATH
// ==========================================

function reconstructPath(parent) {

    const path = [];

    let current = {
        row: end.row,
        col: end.col
    };


    // End is unreachable

    if (
        current.row !== start.row ||
        current.col !== start.col
    ) {

        if (
            parent[current.row][current.col] === null
        ) {

            return [];

        }

    }


    while (current !== null) {

        path.push(current);

        if (
            current.row === start.row &&
            current.col === start.col
        ) {

            break;

        }

        current =
            parent[current.row][current.col];

    }


    path.reverse();

    return path;

}


// ==========================================
// ANIMATE VISITED CELLS
// ==========================================

function animateVisited(cells) {

    return new Promise(resolve => {

        let index = 0;

        const interval =
            setInterval(() => {

                if (index >= cells.length) {

                    clearInterval(interval);

                    resolve();

                    return;

                }


                const cell =
                    cells[index];


                if (
                    !(
                        cell.row === start.row &&
                        cell.col === start.col
                    ) &&
                    !(
                        cell.row === end.row &&
                        cell.col === end.col
                    )
                ) {

                    const element =
                        document.getElementById(
                            `cell-${cell.row}-${cell.col}`
                        );


                    if (element) {
                        element.classList.add("visited");
                    }

                }


                index++;

            }, 15);

    });

}


// ==========================================
// ANIMATE PATH
// ==========================================

function animatePath(path) {

    return new Promise(resolve => {

        let index = 0;

        const interval =
            setInterval(() => {

                if (index >= path.length) {

                    clearInterval(interval);

                    resolve();

                    return;

                }


                const cell =
                    path[index];


                const element =
                    document.getElementById(
                        `cell-${cell.row}-${cell.col}`
                    );


                if (
                    element &&
                    !element.classList.contains("start") &&
                    !element.classList.contains("end")
                ) {

                    element.classList.remove("visited");

                    element.classList.add("path");

                }


                index++;

            }, 50);

    });

}


// ==========================================
// CLEAR PATH
// ==========================================

function clearPath() {

    clearInterval();

    document
        .querySelectorAll(".visited, .path")
        .forEach(cell => {

            cell.classList.remove("visited");

            cell.classList.remove("path");

        });


    document.getElementById("steps")
        .textContent = "0";

    document.getElementById("visited")
        .textContent = "0";

    document.getElementById("algorithm")
        .textContent = "-";

    document.getElementById("time")
        .textContent = "0 ms";

}


// ==========================================
// RESET STATISTICS
// ==========================================

function resetStats() {

    document.getElementById("steps")
        .textContent = "0";

    document.getElementById("visited")
        .textContent = "0";

    document.getElementById("algorithm")
        .textContent = "-";

    document.getElementById("time")
        .textContent = "0 ms";

}