# Pathfinding Visualizer

Pathfinding Visualizer is a web-based tool for visualizing various pathfinding algorithms. It allows users to draw walls and set start and end points to see how different algorithms find the shortest path.

## Features

- Visualize popular pathfinding algorithms like Dijkstra and A*.
- Interactive grid where users can create walls and move start/end points.
- Create any type of maze you want by clicking and dragging your mouse over the nodes.
- Real-time visualization of algorithm execution.

## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)

## Usage

### Interacting with the Grid

- **Draw Walls**: Click and drag on the grid to create walls.
- **Move Start/End Points**: Click and drag the start (green) or end (red) nodes to reposition them.

### Visualizing Algorithms

1. **Select Algorithm**: Use the dropdown menu to select the pathfinding algorithm (Dijkstra, A* or BFS).
2. **Run Algorithm**: Click the "Visualize Algorithm" button to start the visualization.


## Project Structure

- **src/PathfindingVisualizer**: Main visualizer component and related logic.
- **src/algorithms**: Pathfinding algorithm implementations.
- **src/Node**: Node component representing each grid cell.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/pathfinding-visualizer.git
    cd pathfinding-visualizer
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm start
    ```

    The app will be available at `http://localhost:3000`.

## Acknowledgements

- [React](https://reactjs.org/)
- [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
- [A* Algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm)
- [Breadth-First Search (BFS)](https://en.wikipedia.org/wiki/Breadth-first_search)
