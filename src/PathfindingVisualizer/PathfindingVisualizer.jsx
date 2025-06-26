import React, { useState, useEffect } from 'react';
import { dijkstra } from '../algorithms/dijkstra';
import  aStar  from '../algorithms/aStar';
import { bfs } from '../algorithms/bfs';
import Node from './Node/Node'; // Assume you have a Node component for rendering each grid cell
import './PathfindingVisualizer.css';

const PathfindingVisualizer = ({ algorithm, startRow, startCol, endRow, endCol }) => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);

  useEffect(() => {
    const initialGrid = getInitialGrid();
    setGrid(initialGrid);
  }, []);

  const handleMouseDown = (row, col) => {
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const visualizeAlgorithm = () => {
    const startNode = grid[startRow][startCol];
    const endNode = grid[endRow][endCol];
    let path = [];

    switch (algorithm) {
      case 'dijkstra':
        path = dijkstra(grid, startNode, endNode);
        break;
      case 'aStar':
        path = aStar(grid, startNode, endNode);
        break;
      case 'bfs':
        path = bfs(grid, startNode, endNode);
        break;
      default:
        break;
    }

    const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);
    animateAlgorithm(path, nodesInShortestPathOrder);
  };

  const animateAlgorithm = (visitedNodesInOrder, nodesInShortestPathOrder) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if ((node.row === startRow && node.col === startCol) || (node.row === endRow && node.col === endCol)) {
          return;
        }
        document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';
      }, 10 * i);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        // if ((node.row === startRow && node.col === startCol) || (node.row === endRow && node.col === endCol)) {
        //   return;
        // }
        document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path';
      }, 50 * i);
    }
  };

  return (
    <>
      <div className="visualize-button-container">
        <button className="butt" onClick={() => visualizeAlgorithm()}>
          Visualize {algorithm.charAt(0).toUpperCase() + algorithm.slice(1)}
        </button>
      </div>
      <div className="grid">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="grid-row">
            {row.map((node, nodeIdx) => (
              <Node
                key={nodeIdx}
                col={node.col}
                row={node.row}
                isStart={node.row === startRow && node.col === startCol}
                isFinish={node.row === endRow && node.col === endCol}
                isWall={node.isWall}
                onMouseDown={(row, col) => handleMouseDown(row, col)}
                onMouseEnter={(row, col) => handleMouseEnter(row, col)}
                onMouseUp={() => handleMouseUp()}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 27; row++) {
    const currentRow = [];
    for (let col = 0; col < 64; col++) {
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
    isStart: false,
    isFinish: false,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
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

const getNodesInShortestPathOrder = (finishNode) => {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
};

export default PathfindingVisualizer;
