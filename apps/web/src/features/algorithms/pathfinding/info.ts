export type PathAlgo = 'bfs' | 'dfs' | 'dijkstra' | 'astar';

export const PATH_INFO: Record<PathAlgo, { name: string; desc: string; time: string; useFor: string; intro: string }> = {
  "bfs": {
    "name": "Breadth-First Search",
    "desc": "Explores level by level using a queue. Finds the shortest path by number of edges in an unweighted graph. It ignores weights.",
    "time": "O(V + E)",
    "useFor": "Shortest path in a grid or unweighted graph, level order, \"minimum steps\", multi-source spreading (Rotting Oranges).",
    "intro": "**BFS** explores in rings: first every cell 1 step from the start, then every cell 2 steps away, and so on. It keeps a **queue** (first in, first out). Because it goes ring by ring, the first time it reaches the end is a shortest path."
  },
  "dfs": {
    "name": "Depth-First Search",
    "desc": "Goes as deep as possible before backtracking, using a stack or recursion. It does not find shortest paths, as you can see here.",
    "time": "O(V + E)",
    "useFor": "Connected components, cycle detection, topological sort, backtracking, flood fill (Number of Islands).",
    "intro": "**DFS** picks one direction and keeps going as far as it can, backing up only at dead ends. It keeps a **stack** (last in, first out). It finds a path, but usually not the shortest one."
  },
  "dijkstra": {
    "name": "Dijkstra",
    "desc": "Always expands the closest unvisited node using a min-heap. Gives the shortest path when all weights are non-negative.",
    "time": "O((V + E) log V)",
    "useFor": "Network delay time, cheapest route, any weighted shortest-path problem with non-negative weights.",
    "intro": "**Dijkstra** always expands the cell with the smallest total cost from the start so far, using a priority queue. Brown cells cost 5 to enter, so it goes around them when that is cheaper."
  },
  "astar": {
    "name": "A* Search",
    "desc": "Dijkstra plus a heuristic (here Manhattan distance to the goal) that steers the search toward the target. It visits far fewer nodes.",
    "time": "O(E log V) worst case",
    "useFor": "Games and maps. In interviews, mention it as an optimisation over Dijkstra when you have a target.",
    "intro": "**A*** is Dijkstra plus a guess: it prefers cells that are cheap so far *and* look close to the end. That focus means it visits far fewer cells."
  }
};

export const PATH_CODE: Record<PathAlgo, string[]> = {
  "bfs": [
    "queue = [start], mark start as seen",
    "while the queue is not empty:",
    "  node = take from the front of the queue",
    "  if node == end: done",
    "  for each neighbor not seen yet:",
    "    mark it seen, remember it came from node",
    "    add it to the back of the queue"
  ],
  "dfs": [
    "stack = [start]",
    "while the stack is not empty:",
    "  node = take from the top of the stack",
    "  if node == end: done",
    "  if node was visited already: skip it",
    "  mark node visited",
    "  push its unvisited neighbors onto the stack"
  ],
  "dijkstra": [
    "dist[start] = 0, heap = [(0, start)]",
    "while the heap is not empty:",
    "  node = the unvisited cell with the smallest dist",
    "  if node == end: done",
    "  for each neighbor:",
    "    d = dist[node] + cost of entering neighbor",
    "    if d < dist[neighbor]: dist[neighbor] = d, push it"
  ],
  "astar": [
    "g[start] = 0, heap = [(estimate(start), start)]",
    "while the heap is not empty:",
    "  node = cell with smallest g + estimate to end",
    "  if node == end: done",
    "  for each neighbor:",
    "    d = g[node] + cost of entering neighbor",
    "    if d < g[neighbor]: g[neighbor] = d, push it"
  ]
};
