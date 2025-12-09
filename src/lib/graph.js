/**
 * Generic Graph Data Structure
 * Adjacency List implementation
 */
export class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(source, destination, weight = 1, type = 'generic') {
    if (!this.adjacencyList.has(source)) {
      this.addVertex(source);
    }
    if (!this.adjacencyList.has(destination)) {
      this.addVertex(destination);
    }
    this.adjacencyList.get(source).push({ node: destination, weight, type });
  }

  getNeighbors(vertex) {
    return this.adjacencyList.get(vertex) || [];
  }

  /**
   * Breadth-First Search to find nodes within a certain distance
   * @param {string} startNode - Starting node ID
   * @param {number} maxDepth - Maximum distance to traverse
   * @returns {Map} - Map of visited nodes and their scores/distances
   */
  bfs(startNode, maxDepth = 2) {
    const visited = new Map(); // node -> score
    const queue = [{ node: startNode, depth: 0, weight: 1 }];

    visited.set(startNode, 1);

    while (queue.length > 0) {
      const { node, depth, weight } = queue.shift();

      if (depth >= maxDepth) continue;

      const neighbors = this.getNeighbors(node);
      for (const neighbor of neighbors) {
        // Decay weight as we go deeper
        const newWeight = weight * 0.5 * neighbor.weight; 
        
        if (!visited.has(neighbor.node)) {
          visited.set(neighbor.node, newWeight);
          queue.push({ node: neighbor.node, depth: depth + 1, weight: newWeight });
        } else {
          // Accumulate score if multiple paths lead here
          visited.set(neighbor.node, visited.get(neighbor.node) + newWeight);
        }
      }
    }
    return visited;
  }
}
