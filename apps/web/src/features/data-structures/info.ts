/** Descriptions, complexity and tips shown beside each data structure. */
export const DS_INFO = {
  "stack": {
    "name": "Stack",
    "hint": "LIFO: the last item in is the first one out.",
    "desc": "Last-In-First-Out. Think of a pile of plates or the browser back button. The call stack is also how recursion works under the hood.",
    "complexity": [
      [
        "push",
        "O(1)"
      ],
      [
        "pop",
        "O(1)"
      ],
      [
        "peek",
        "O(1)"
      ],
      [
        "search",
        "O(n)"
      ]
    ],
    "tips": [
      "Matching brackets and parsing expressions → stack",
      "\"Next greater element\" → monotonic stack",
      "Any recursive DFS can be rewritten with an explicit stack"
    ],
    "practice": [
      "Valid Parentheses",
      "Min Stack",
      "Daily Temperatures",
      "Largest Rectangle in Histogram"
    ]
  },
  "queue": {
    "name": "Queue",
    "hint": "FIFO: items leave in the order they arrived.",
    "desc": "First-In-First-Out. Used for BFS, task scheduling, buffering, and message queues in system design.",
    "complexity": [
      [
        "enqueue",
        "O(1)"
      ],
      [
        "dequeue",
        "O(1)*"
      ],
      [
        "front",
        "O(1)"
      ],
      [
        "search",
        "O(n)"
      ]
    ],
    "tips": [
      "* Use a deque or circular buffer. In JS, array.shift() is O(n)",
      "BFS on graphs and grids always uses a queue",
      "Monotonic deque gives O(n) sliding-window max"
    ],
    "practice": [
      "Implement Queue using Stacks",
      "Number of Islands (BFS)",
      "Rotting Oranges",
      "Sliding Window Maximum"
    ]
  },
  "ll": {
    "name": "Linked List",
    "hint": "Try **reverse**. It's one of the most frequently asked linked-list questions.",
    "desc": "Nodes connected by pointers. Insert and delete are O(1) once you have the node, but there is no random access.",
    "complexity": [
      [
        "access i-th",
        "O(n)"
      ],
      [
        "insert head",
        "O(1)"
      ],
      [
        "insert tail",
        "O(n) / O(1) with tail ptr"
      ],
      [
        "delete (given node)",
        "O(1)"
      ],
      [
        "search",
        "O(n)"
      ]
    ],
    "tips": [
      "Use a dummy head node to remove edge cases",
      "Fast and slow pointers: cycle detection, finding the middle",
      "Draw the pointers before writing the code"
    ],
    "practice": [
      "Reverse Linked List",
      "Merge Two Sorted Lists",
      "Linked List Cycle",
      "LRU Cache (hash map + doubly linked list)"
    ]
  },
  "bst": {
    "name": "Binary Search Tree",
    "hint": "Left subtree < node < right subtree. An inorder traversal returns the values sorted.",
    "desc": "Every node is greater than all values in its left subtree and less than all values in its right subtree. Balanced variants (AVL, Red-Black) guarantee O(log n).",
    "complexity": [
      [
        "search",
        "O(log n) avg / O(n) worst"
      ],
      [
        "insert",
        "O(log n) avg"
      ],
      [
        "delete",
        "O(log n) avg"
      ],
      [
        "traversal",
        "O(n)"
      ]
    ],
    "tips": [
      "Most tree problems are \"recurse left, recurse right, combine the results\"",
      "Validate a BST by passing (min, max) bounds down the tree",
      "Level order traversal → BFS with a queue, one level at a time"
    ],
    "practice": [
      "Validate Binary Search Tree",
      "Kth Smallest Element in a BST",
      "Lowest Common Ancestor",
      "Binary Tree Level Order Traversal"
    ]
  },
  "heap": {
    "name": "Min-Heap",
    "hint": "A complete binary tree stored in an array. Parent of i is `(i-1)/2`, children are `2i+1` and `2i+2`.",
    "desc": "A priority queue. The smallest item is always at the root. It is stored as a plain array, and the tree is only a way of looking at it.",
    "complexity": [
      [
        "peek min",
        "O(1)"
      ],
      [
        "insert (sift up)",
        "O(log n)"
      ],
      [
        "extract-min (sift down)",
        "O(log n)"
      ],
      [
        "build heap",
        "O(n)"
      ]
    ],
    "tips": [
      "\"Top K\" or \"K-th largest\" → a heap of size K",
      "Merging K sorted lists → min-heap of the list heads",
      "Running median → two heaps (a max-heap and a min-heap)",
      "Dijkstra uses a min-heap"
    ],
    "practice": [
      "Kth Largest Element in an Array",
      "Top K Frequent Elements",
      "Merge k Sorted Lists",
      "Find Median from Data Stream"
    ]
  },
  "hash": {
    "name": "Hash Table",
    "hint": "Keys are hashed into buckets. When two keys land in the same bucket (a collision), they are chained in a list.",
    "desc": "Maps keys to values in O(1) on average. A hash function picks the bucket. Collisions are handled by chaining (shown here) or open addressing.",
    "complexity": [
      [
        "get / put / delete",
        "O(1) avg"
      ],
      [
        "worst case (all collide)",
        "O(n)"
      ],
      [
        "resize",
        "O(n), amortized O(1)"
      ]
    ],
    "tips": [
      "Most of the time, the brute force fix is \"add a hash map\"",
      "Two Sum, anagram grouping, frequency counting",
      "Resize when the load factor goes above ~0.75",
      "Hash set for O(1) \"have I seen this?\" checks"
    ],
    "practice": [
      "Two Sum",
      "Group Anagrams",
      "Longest Consecutive Sequence",
      "Subarray Sum Equals K"
    ]
  }
} as const;

/** Pseudocode shown next to each operation. */
export const DS_CODE = {
  "stack": {
    "push": [
      "push(x):",
      "  if the stack is full: error \"overflow\"",
      "  put x on top",
      "  the top is now x"
    ],
    "pop": [
      "pop():",
      "  if the stack is empty: error \"underflow\"",
      "  x = the item on top",
      "  remove the top item",
      "  return x"
    ],
    "peek": [
      "peek():",
      "  return the item on top (nothing is removed)"
    ]
  },
  "queue": {
    "enq": [
      "enqueue(x):",
      "  put x at the rear (back of the line)"
    ],
    "deq": [
      "dequeue():",
      "  if the queue is empty: error",
      "  x = the item at the front",
      "  remove the front item",
      "  return x"
    ],
    "front": [
      "front():",
      "  return the item at the front"
    ]
  },
  "ll": {
    "head": [
      "insertHead(x):",
      "  node = new Node(x)",
      "  node.next = head",
      "  head = node"
    ],
    "tail": [
      "insertTail(x):",
      "  curr = head",
      "  while curr.next is not null:",
      "    curr = curr.next",
      "  curr.next = new Node(x)"
    ],
    "find": [
      "search(x):",
      "  curr = head",
      "  while curr is not null:",
      "    if curr.value == x: return found",
      "    curr = curr.next",
      "  return not found"
    ],
    "del": [
      "delete(x):",
      "  prev = null, curr = head",
      "  while curr is not null:",
      "    if curr.value == x:",
      "      prev.next = curr.next   # skip it",
      "      return",
      "    prev = curr, curr = curr.next"
    ],
    "rev": [
      "reverse():",
      "  prev = null, curr = head",
      "  while curr is not null:",
      "    next = curr.next      # remember the rest",
      "    curr.next = prev      # flip the arrow",
      "    prev = curr",
      "    curr = next",
      "  head = prev"
    ]
  },
  "bst": {
    "ins": [
      "insert(x):",
      "  node = root",
      "  while node is not null:",
      "    if x < node.value: node = node.left",
      "    else: node = node.right",
      "  put a new node with x in this empty spot"
    ],
    "search": [
      "search(x):",
      "  node = root",
      "  while node is not null:",
      "    if x == node.value: return found",
      "    if x < node.value: node = node.left",
      "    else: node = node.right",
      "  return not found"
    ],
    "del": [
      "delete(x):",
      "  find the node holding x",
      "  if it has no children: remove it",
      "  if it has one child: replace it with that child",
      "  if it has two children:",
      "    s = smallest value in its right subtree",
      "    copy s into the node, then delete the old s"
    ],
    "in": [
      "inorder(node):",
      "  if node is null: return",
      "  inorder(node.left)",
      "  visit(node)",
      "  inorder(node.right)"
    ],
    "pre": [
      "preorder(node):",
      "  if node is null: return",
      "  visit(node)",
      "  preorder(node.left)",
      "  preorder(node.right)"
    ],
    "post": [
      "postorder(node):",
      "  if node is null: return",
      "  postorder(node.left)",
      "  postorder(node.right)",
      "  visit(node)"
    ],
    "level": [
      "levelOrder(root):",
      "  queue = [root]",
      "  while the queue is not empty:",
      "    node = take from the front of the queue",
      "    visit(node)",
      "    add node.left and node.right to the queue"
    ]
  },
  "heap": {
    "push": [
      "insert(x):",
      "  add x at the end of the array",
      "  i = last index",
      "  while i > 0:",
      "    p = parent of i = (i − 1) / 2",
      "    if heap[p] <= heap[i]: stop",
      "    swap heap[p] and heap[i]",
      "    i = p"
    ],
    "pop": [
      "extractMin():",
      "  min = heap[0]",
      "  move the last item to index 0",
      "  i = 0",
      "  loop:",
      "    c = the smaller child of i",
      "    if heap[i] <= heap[c]: stop",
      "    swap heap[i] and heap[c], i = c",
      "  return min"
    ],
    "heapify": [
      "buildHeap(array):",
      "  for i from the last parent down to 0:",
      "    sift heap[i] down (swap with smaller child until in order)"
    ]
  },
  "hash": {
    "put": [
      "put(key):",
      "  i = hash(key) mod size",
      "  for each item in bucket[i]:",
      "    if item == key: update it, stop",
      "  append key to bucket[i]"
    ],
    "get": [
      "get(key):",
      "  i = hash(key) mod size",
      "  for each item in bucket[i]:",
      "    if item == key: return found",
      "  return not found"
    ],
    "del": [
      "delete(key):",
      "  i = hash(key) mod size",
      "  find key in bucket[i]",
      "  remove it from the chain"
    ],
    "resize": [
      "resize():",
      "  size = size × 2",
      "  for every key in the table:",
      "    put it in bucket hash(key) mod size"
    ]
  }
};
