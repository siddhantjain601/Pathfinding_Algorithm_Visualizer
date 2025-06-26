function aStar(grid, startNode, endNode) {
  const openSet = [startNode];
  const closedSet = [];

  startNode.distance = 0;
  startNode.heuristicDistance = manhattanDistance(startNode, endNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => (a.distance + a.heuristicDistance) - (b.distance + b.heuristicDistance));
    const currentNode = openSet.shift();

    if (currentNode === endNode) {
      return reconstructPath(endNode);
    }

    closedSet.push(currentNode);
    currentNode.isVisited = true;  // Mark as visited

    const neighbors = getNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      if (closedSet.includes(neighbor) || neighbor.isWall) {
        continue;
      }

      const tentativeDistance = currentNode.distance + 1;
      if (tentativeDistance < neighbor.distance) {
        neighbor.distance = tentativeDistance;
        neighbor.heuristicDistance = manhattanDistance(neighbor, endNode);
        neighbor.previousNode = currentNode;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [];
}


function reconstructPath(endNode) {
  const path = [];
  let currentNode = endNode;
  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return path;
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
}

function manhattanDistance(nodeOne, nodeTwo) {
  return Math.abs(nodeOne.row - nodeTwo.row) + Math.abs(nodeOne.col - nodeTwo.col);
}

export default aStar;
