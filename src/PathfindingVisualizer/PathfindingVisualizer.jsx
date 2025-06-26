// PathfindingVisualizer.jsx
import React, { Component } from 'react';
import Node from './Node/Node';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import { astar, getNodesInShortestPathOrderAStar } from '../algorithms/aStar';
import { breadthFirstSearch, getNodesInShortestPathOrderBFS } from '../algorithms/bfs';
import { dfs, getNodesInShortestPathOrderDFS } from '../algorithms/dfs';
import './PathfindingVisualizer.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

// Mode constants
const MODES = {
  NONE: 'none',
  START: 'start',
  END: 'end',
  WALL: 'wall'
};

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      isRunning: false,
      currentMode: MODES.NONE,
      startNodeRow: START_NODE_ROW,
      startNodeCol: START_NODE_COL,
      finishNodeRow: FINISH_NODE_ROW,
      finishNodeCol: FINISH_NODE_COL,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
  }

  // Mode selection methods
  setMode(mode) {
    if (!this.state.isRunning) {
      this.setState({ currentMode: mode });
    }
  }

  // Enhanced mouse handlers for mode-based interaction
  handleMouseDown(row, col) {
    if (!this.state.isRunning) {
      const { currentMode } = this.state;
      
      // If a path is showing, clear it first
      if (!this.isGridClear()) {
        this.clearPath();
      }

      switch (currentMode) {
        case MODES.START:
          this.placeStartNode(row, col);
          break;
        case MODES.END:
          this.placeEndNode(row, col);
          break;
        case MODES.WALL:
          this.toggleWall(row, col);
          this.setState({ mouseIsPressed: true });
          break;
        default:
          // Default behavior - drag nodes or create walls
          this.handleDefaultMouseDown(row, col);
          break;
      }
    }
  }

  handleDefaultMouseDown(row, col) {
    const nodeElement = document.getElementById(`node-${row}-${col}`);
    const nodeClass = nodeElement.className;

    if (nodeClass === 'node node-start') {
      this.setState({
        mouseIsPressed: true,
        currentMode: MODES.START,
      });
    } else if (nodeClass === 'node node-finish') {
      this.setState({
        mouseIsPressed: true,
        currentMode: MODES.END,
      });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({
        grid: newGrid,
        mouseIsPressed: true,
        currentMode: MODES.WALL,
      });
    }
  }

  placeStartNode(row, col) {
    const { grid, startNodeRow, startNodeCol } = this.state;
    const node = grid[row][col];
    
    // Don't place on walls or finish node
    if (node.isWall || node.isFinish) return;

    // Clear previous start node
    const prevStartNode = grid[startNodeRow][startNodeCol];
    prevStartNode.isStart = false;
    document.getElementById(`node-${startNodeRow}-${startNodeCol}`).className = 'node';

    // Set new start node
    node.isStart = true;
    document.getElementById(`node-${row}-${col}`).className = 'node node-start';

    // Update grid and state
    const newGrid = grid.slice();
    newGrid[startNodeRow][startNodeCol] = prevStartNode;
    newGrid[row][col] = node;

    this.setState({
      grid: newGrid,
      startNodeRow: row,
      startNodeCol: col,
    });
  }

  placeEndNode(row, col) {
    const { grid, finishNodeRow, finishNodeCol } = this.state;
    const node = grid[row][col];
    
    // Don't place on walls or start node
    if (node.isWall || node.isStart) return;

    // Clear previous finish node
    const prevFinishNode = grid[finishNodeRow][finishNodeCol];
    prevFinishNode.isFinish = false;
    document.getElementById(`node-${finishNodeRow}-${finishNodeCol}`).className = 'node';

    // Set new finish node
    node.isFinish = true;
    document.getElementById(`node-${row}-${col}`).className = 'node node-finish';

    // Update grid and state
    const newGrid = grid.slice();
    newGrid[finishNodeRow][finishNodeCol] = prevFinishNode;
    newGrid[row][col] = node;

    this.setState({
      grid: newGrid,
      finishNodeRow: row,
      finishNodeCol: col,
    });
  }

  toggleWall(row, col) {
    const { grid } = this.state;
    const node = grid[row][col];
    
    // Don't place walls on start or finish nodes
    if (node.isStart || node.isFinish) return;

    const newGrid = getNewGridWithWallToggled(grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseEnter(row, col) {
    if (!this.state.isRunning && this.state.mouseIsPressed) {
      const { currentMode } = this.state;
      
      if (currentMode === MODES.WALL) {
        this.toggleWall(row, col);
      } else if (currentMode === MODES.START) {
        this.placeStartNode(row, col);
      } else if (currentMode === MODES.END) {
        this.placeEndNode(row, col);
      }
    }
  }

  handleMouseUp() {
    if (!this.state.isRunning) {
      this.setState({
        mouseIsPressed: false,
      });
    }
  }

  isGridClear() {
    for (const row of this.state.grid) {
      for (const node of row) {
        const nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`,
        ).className;
        if (
          nodeClassName !== 'node' &&
          nodeClassName !== 'node node-start' &&
          nodeClassName !== 'node node-finish'
        ) {
          return false;
        }
      }
    }
    return true;
  }

  clearGrid() {
    if (!this.state.isRunning) {
      const newGrid = this.state.grid.slice();
      for (const row of newGrid) {
        for (const node of row) {
          let nodeElement = document.getElementById(
            `node-${node.row}-${node.col}`,
          );
          if (
            nodeElement.className !== 'node node-start' &&
            nodeElement.className !== 'node node-finish'
          ) {
            nodeElement.className = 'node';
            node.isWall = false;
          }
          // Reset all algorithm-specific properties for all nodes
          node.isVisited = false;
          node.distance = Infinity;
          node.previousNode = null;
          // A* specific properties
          node.heuristicDistance = 0;
          node.totalDistance = Infinity;
        }
      }
      this.setState({ 
        grid: newGrid,
        currentMode: MODES.NONE 
      });
    }
  }

  clearWalls() {
    if (!this.state.isRunning) {
      const newGrid = this.state.grid.slice();
      for (const row of newGrid) {
        for (const node of row) {
          let nodeElement = document.getElementById(
            `node-${node.row}-${node.col}`,
          );
          if (nodeElement.className === 'node node-wall') {
            nodeElement.className = 'node';
            node.isWall = false;
          }
        }
      }
      this.setState({ grid: newGrid });
    }
  }

  clearPath() {
    if (!this.state.isRunning) {
      const newGrid = this.state.grid.slice();
      for (const row of newGrid) {
        for (const node of row) {
          let nodeElement = document.getElementById(
            `node-${node.row}-${node.col}`,
          );
          if (
            nodeElement.className !== 'node node-start' &&
            nodeElement.className !== 'node node-finish' &&
            nodeElement.className !== 'node node-wall'
          ) {
            nodeElement.className = 'node';
          }
          // Reset all algorithm-specific properties
          node.isVisited = false;
          node.distance = Infinity;
          node.previousNode = null;
          // A* specific properties
          node.heuristicDistance = 0;
          node.totalDistance = Infinity;
        }
      }
      this.setState({ grid: newGrid });
    }
  }

  resetGrid() {
    if (!this.state.isRunning) {
      const grid = getInitialGrid();
      this.setState({ 
        grid,
        startNodeRow: START_NODE_ROW,
        startNodeCol: START_NODE_COL,
        finishNodeRow: FINISH_NODE_ROW,
        finishNodeCol: FINISH_NODE_COL,
        currentMode: MODES.NONE
      });
    }
  }

  visualize(algo) {
    if (!this.state.isRunning) {
      this.clearPath();
      this.toggleIsRunning();
      const { grid, startNodeRow, startNodeCol, finishNodeRow, finishNodeCol } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      
      let visitedNodesInOrder;
      switch (algo) {
        case 'Dijkstra':
          visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
          break;
        case 'AStar':
          visitedNodesInOrder = astar(grid, startNode, finishNode);
          break;
        case 'BFS':
          visitedNodesInOrder = breadthFirstSearch(grid, startNode, finishNode);
          break;
        case 'DFS':
          visitedNodesInOrder = dfs(grid, startNode, finishNode);
          break;
        default:
          break;
      }
      this.animateAlgorithm(visitedNodesInOrder, finishNode, algo);
    }
  }

  animateAlgorithm(visitedNodesInOrder, finishNode, algo) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(finishNode, algo);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        if (nodeElement.className !== 'node node-start' && nodeElement.className !== 'node node-finish') {
          nodeElement.className = 'node node-visited';
        }
      }, 10 * i);
    }
  }

  animateShortestPath(finishNode, algo) {
    let nodesInShortestPathOrder;
    switch (algo) {
      case 'Dijkstra':
        nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        break;
      case 'AStar':
        nodesInShortestPathOrder = getNodesInShortestPathOrderAStar(finishNode);
        break;
      case 'BFS':
        nodesInShortestPathOrder = getNodesInShortestPathOrderBFS(finishNode);
        break;
      case 'DFS':
        nodesInShortestPathOrder = getNodesInShortestPathOrderDFS(finishNode);
        break;
      default:
        break;
    }
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        if (nodeElement.className !== 'node node-start' && nodeElement.className !== 'node node-finish') {
          nodeElement.className = 'node node-shortest-path';
        }
      }, 50 * i);
    }
    this.toggleIsRunning();
  }

  toggleIsRunning() {
    this.setState({ isRunning: !this.state.isRunning });
  }

  render() {
    const { grid, mouseIsPressed, currentMode, isRunning } = this.state;
    
    return (
      <>
        <nav className="navbar">
          <div className="nav-title">
            <h1>Pathfinding Visualizer</h1>
          </div>
          
          {/* Mode Selection Buttons */}
          <div className="mode-selection">
            <h3>Selection Mode:</h3>
            <div className="mode-buttons">
              <button
                type="button"
                className={`mode-btn ${currentMode === MODES.NONE ? 'active' : ''}`}
                onClick={() => this.setMode(MODES.NONE)}
                disabled={isRunning}
              >
                🖱️ Move
              </button>
              <button
                type="button"
                className={`mode-btn ${currentMode === MODES.START ? 'active' : ''}`}
                onClick={() => this.setMode(MODES.START)}
                disabled={isRunning}
              >
                🟢 Start
              </button>
              <button
                type="button"
                className={`mode-btn ${currentMode === MODES.END ? 'active' : ''}`}
                onClick={() => this.setMode(MODES.END)}
                disabled={isRunning}
              >
                🔴 End
              </button>
              <button
                type="button"
                className={`mode-btn ${currentMode === MODES.WALL ? 'active' : ''}`}
                onClick={() => this.setMode(MODES.WALL)}
                disabled={isRunning}
              >
                ⬛ Wall
              </button>
            </div>
          </div>

          {/* Algorithm Buttons */}
          <div className="nav-buttons">
            <button
              type="button"
              className="btn algorithm-btn"
              onClick={() => this.visualize('Dijkstra')}
              disabled={isRunning}
            >
              Dijkstra's
            </button>
            <button
              type="button"
              className="btn algorithm-btn"
              onClick={() => this.visualize('AStar')}
              disabled={isRunning}
            >
              A*
            </button>
            <button
              type="button"
              className="btn algorithm-btn"
              onClick={() => this.visualize('BFS')}
              disabled={isRunning}
            >
              BFS
            </button>
            <button
              type="button"
              className="btn algorithm-btn"
              onClick={() => this.visualize('DFS')}
              disabled={isRunning}
            >
              DFS
            </button>
          </div>

          {/* Control Buttons */}
          <div className="control-buttons">
            <button
              type="button"
              className="btn control-btn"
              onClick={() => this.clearPath()}
              disabled={isRunning}
            >
              Clear Path
            </button>
            <button
              type="button"
              className="btn control-btn"
              onClick={() => this.clearWalls()}
              disabled={isRunning}
            >
              Clear Walls
            </button>
            <button
              type="button"
              className="btn control-btn"
              onClick={() => this.resetGrid()}
              disabled={isRunning}
            >
              Reset Grid
            </button>
          </div>
        </nav>

        {/* Instructions */}
        <div className="instructions">
          <p>
            {currentMode === MODES.NONE && "🖱️ Drag nodes to move them, or click and drag to create walls"}
            {currentMode === MODES.START && "🟢 Click on any square to place the start node"}
            {currentMode === MODES.END && "🔴 Click on any square to place the end node"}
            {currentMode === MODES.WALL && "⬛ Click on squares to toggle walls on/off"}
          </p>
        </div>

        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx} className="grid-row">
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="legend">
          <div className="legend-item">
            <div className="node node-start"></div>
            <span>Start Node</span>
          </div>
          <div className="legend-item">
            <div className="node node-finish"></div>
            <span>Target Node</span>
          </div>
          <div className="legend-item">
            <div className="node node-wall"></div>
            <span>Wall Node</span>
          </div>
          <div className="legend-item">
            <div className="node node-visited"></div>
            <span>Visited Node</span>
          </div>
          <div className="legend-item">
            <div className="node node-shortest-path"></div>
            <span>Shortest Path</span>
          </div>
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    // A* specific properties
    heuristicDistance: 0,
    totalDistance: Infinity,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};