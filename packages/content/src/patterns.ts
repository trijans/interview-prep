import type { Pattern } from './types';

/** Coding patterns with Python templates. */
export const PATTERNS: Pattern[] = [
  {
    "name": "Two Pointers",
    "signal": "Sorted array, pairs/triplets summing to a target, in-place partitioning, palindromes.",
    "template": "l, r = 0, len(a) - 1\nwhile l < r:\n    s = a[l] + a[r]\n    if s == target: return [l, r]\n    if s < target: l += 1\n    else: r -= 1",
    "problems": [
      "3Sum",
      "Container With Most Water",
      "Trapping Rain Water"
    ]
  },
  {
    "name": "Sliding Window",
    "signal": "\"Longest/shortest contiguous subarray or substring such that…\"",
    "template": "l = 0\nfor r in range(len(s)):\n    add(s[r])\n    while window_invalid():\n        remove(s[l]); l += 1\n    best = max(best, r - l + 1)",
    "problems": [
      "Longest Substring Without Repeating Characters",
      "Minimum Window Substring"
    ]
  },
  {
    "name": "Fast & Slow Pointers",
    "signal": "Cycle detection, middle of a list, duplicate-number problems.",
    "template": "slow = fast = head\nwhile fast and fast.next:\n    slow, fast = slow.next, fast.next.next\n    if slow is fast: return True  # cycle",
    "problems": [
      "Linked List Cycle II",
      "Find the Duplicate Number"
    ]
  },
  {
    "name": "Binary Search on Answer",
    "signal": "\"Minimise the maximum…\", \"smallest capacity/speed that works\". A monotonic yes/no check.",
    "template": "lo, hi = min_ans, max_ans\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if feasible(mid): hi = mid\n    else: lo = mid + 1\nreturn lo",
    "problems": [
      "Koko Eating Bananas",
      "Capacity To Ship Packages"
    ]
  },
  {
    "name": "BFS",
    "signal": "Shortest steps in an unweighted graph or grid, level order, spreading from many sources.",
    "template": "q = deque([start]); seen = {start}\nwhile q:\n    node = q.popleft()\n    for nb in graph[node]:\n        if nb not in seen:\n            seen.add(nb); q.append(nb)",
    "problems": [
      "Number of Islands",
      "Rotting Oranges",
      "Word Ladder"
    ]
  },
  {
    "name": "DFS / Backtracking",
    "signal": "\"All combinations / permutations / subsets\", constraint search.",
    "template": "def backtrack(path, start):\n    if is_solution(path):\n        res.append(path[:]); return\n    for i in range(start, len(choices)):\n        path.append(choices[i])\n        backtrack(path, i + 1)\n        path.pop()   # undo the choice",
    "problems": [
      "Subsets",
      "Permutations",
      "Word Search",
      "N-Queens"
    ]
  },
  {
    "name": "Dynamic Programming",
    "signal": "Count ways or find min/max with overlapping subproblems. \"Can I reach…?\"",
    "template": "dp = [0] * (n + 1)\ndp[0] = 1                      # base case\nfor i in range(1, n + 1):\n    dp[i] = dp[i - 1] + (dp[i - 2] if i >= 2 else 0)\nreturn dp[n]",
    "problems": [
      "Climbing Stairs",
      "Coin Change",
      "Longest Increasing Subsequence",
      "Edit Distance"
    ]
  },
  {
    "name": "Heap / Top-K",
    "signal": "\"K largest / most frequent / closest\", merging sorted streams.",
    "template": "h = []\nfor x in nums:\n    heapq.heappush(h, x)\n    if len(h) > k: heapq.heappop(h)\nreturn h[0]   # k-th largest",
    "problems": [
      "Kth Largest Element",
      "Top K Frequent Elements",
      "Merge k Sorted Lists"
    ]
  },
  {
    "name": "Monotonic Stack",
    "signal": "\"Next greater / smaller element\", spans, histogram areas.",
    "template": "st = []   # indices with decreasing values\nfor i, x in enumerate(a):\n    while st and a[st[-1]] < x:\n        j = st.pop(); ans[j] = i - j\n    st.append(i)",
    "problems": [
      "Daily Temperatures",
      "Largest Rectangle in Histogram"
    ]
  },
  {
    "name": "Prefix Sum + Hash Map",
    "signal": "\"Number of subarrays with sum K\", range-sum queries.",
    "template": "count, s, seen = 0, 0, {0: 1}\nfor x in nums:\n    s += x\n    count += seen.get(s - k, 0)\n    seen[s] = seen.get(s, 0) + 1",
    "problems": [
      "Subarray Sum Equals K",
      "Continuous Subarray Sum"
    ]
  },
  {
    "name": "Intervals",
    "signal": "Overlapping meetings or ranges. Sort by start time first.",
    "template": "intervals.sort()\nout = [intervals[0]]\nfor s, e in intervals[1:]:\n    if s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)\n    else: out.append([s, e])",
    "problems": [
      "Merge Intervals",
      "Meeting Rooms II",
      "Insert Interval"
    ]
  },
  {
    "name": "Topological Sort",
    "signal": "Dependencies and ordering, \"course schedule\", detecting a cycle in a DAG.",
    "template": "q = deque(i for i in range(n) if indeg[i] == 0)\norder = []\nwhile q:\n    u = q.popleft(); order.append(u)\n    for v in g[u]:\n        indeg[v] -= 1\n        if indeg[v] == 0: q.append(v)\nreturn order if len(order) == n else []  # cycle",
    "problems": [
      "Course Schedule",
      "Alien Dictionary"
    ]
  },
  {
    "name": "Union-Find",
    "signal": "Dynamic connectivity, number of components, redundant edges.",
    "template": "parent = list(range(n))\ndef find(x):\n    while parent[x] != x:\n        parent[x] = parent[parent[x]]  # path compression\n        x = parent[x]\n    return x\ndef union(a, b): parent[find(a)] = find(b)",
    "problems": [
      "Number of Provinces",
      "Redundant Connection",
      "Accounts Merge"
    ]
  },
  {
    "name": "Trie",
    "signal": "Prefix search, autocomplete, word dictionaries.",
    "template": "root = {}\ndef insert(word):\n    node = root\n    for ch in word:\n        node = node.setdefault(ch, {})\n    node['$'] = True   # end of word",
    "problems": [
      "Implement Trie",
      "Word Search II",
      "Design Add and Search Words"
    ]
  }
];
