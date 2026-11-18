import type { Problem } from './types';

/** Frequently asked coding problems. Company tags come from public interview reports and change over time. */
export const PROBLEMS: Problem[] = [
  {
    "id": "1",
    "title": "Two Sum",
    "leetcodeSlug": "two-sum",
    "difficulty": "Easy",
    "pattern": "Hash Map",
    "companies": [
      "G",
      "A",
      "M",
      "MS",
      "AP",
      "B"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Brute force checks every pair, which is O(n²). What would you need to look up quickly instead?",
      "For each number x, you only need to know whether target − x appeared earlier.",
      "Scan once, storing value → index in a hash map. Check for the complement before inserting x."
    ]
  },
  {
    "id": "3",
    "title": "Longest Substring Without Repeating Characters",
    "leetcodeSlug": "longest-substring-without-repeating-characters",
    "difficulty": "Medium",
    "pattern": "Sliding Window",
    "companies": [
      "A",
      "M",
      "MS",
      "B"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(min(n, alphabet))",
    "hints": [
      "Think of a window [l, r] that never contains a repeated character.",
      "When s[r] is already inside the window, the left edge must jump past its previous position.",
      "Store the last index of each character and set l = max(l, last[c] + 1)."
    ]
  },
  {
    "id": "5",
    "title": "Longest Palindromic Substring",
    "leetcodeSlug": "longest-palindromic-substring",
    "difficulty": "Medium",
    "pattern": "Two Pointers",
    "companies": [
      "A",
      "MS"
    ],
    "timeComplexity": "O(n²)",
    "spaceComplexity": "O(1)",
    "hints": [
      "Every palindrome mirrors around a center.",
      "There are 2n − 1 possible centers: each character and each gap between two characters.",
      "Expand outward from every center while both ends match, and keep the longest."
    ]
  },
  {
    "id": "11",
    "title": "Container With Most Water",
    "leetcodeSlug": "container-with-most-water",
    "difficulty": "Medium",
    "pattern": "Two Pointers",
    "companies": [
      "A",
      "G",
      "M"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "hints": [
      "Area = min(h[l], h[r]) × (r − l). Start with the widest possible container.",
      "Moving the taller line inward can never help: the width shrinks and the height is still capped by the shorter line.",
      "Use two pointers and always move the shorter side."
    ]
  },
  {
    "id": "15",
    "title": "3Sum",
    "leetcodeSlug": "3sum",
    "difficulty": "Medium",
    "pattern": "Two Pointers",
    "companies": [
      "M",
      "A",
      "G",
      "MS"
    ],
    "timeComplexity": "O(n²)",
    "spaceComplexity": "O(1) extra",
    "hints": [
      "Sort the array first.",
      "Fix one number a[i], then look for pairs in the rest that sum to −a[i].",
      "Find the pair with two pointers, and skip duplicate values for i, l and r."
    ]
  },
  {
    "id": "20",
    "title": "Valid Parentheses",
    "leetcodeSlug": "valid-parentheses",
    "difficulty": "Easy",
    "pattern": "Stack",
    "companies": [
      "A",
      "M",
      "G",
      "B"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "The most recently opened bracket must be the first one closed.",
      "Push opening brackets onto a stack. On a closing bracket, the top of the stack must be its match.",
      "At the end, the stack must be empty."
    ]
  },
  {
    "id": "21",
    "title": "Merge Two Sorted Lists",
    "leetcodeSlug": "merge-two-sorted-lists",
    "difficulty": "Easy",
    "pattern": "Linked List",
    "companies": [
      "A",
      "MS",
      "AP"
    ],
    "timeComplexity": "O(n + m)",
    "spaceComplexity": "O(1)",
    "hints": [
      "A dummy head node removes the special cases.",
      "Compare the two heads and attach the smaller one.",
      "When one list runs out, attach the rest of the other."
    ]
  },
  {
    "id": "23",
    "title": "Merge k Sorted Lists",
    "leetcodeSlug": "merge-k-sorted-lists",
    "difficulty": "Hard",
    "pattern": "Heap",
    "companies": [
      "A",
      "M",
      "G",
      "MS"
    ],
    "timeComplexity": "O(N log k)",
    "spaceComplexity": "O(k)",
    "hints": [
      "Merging lists one at a time costs O(kN). Can you always find the smallest head quickly?",
      "A min-heap holding the k current heads gives you the smallest in O(log k).",
      "Pop the smallest, append it, then push its next node. Pairwise divide-and-conquer merging also works."
    ]
  },
  {
    "id": "33",
    "title": "Search in Rotated Sorted Array",
    "leetcodeSlug": "search-in-rotated-sorted-array",
    "difficulty": "Medium",
    "pattern": "Binary Search",
    "companies": [
      "M",
      "A",
      "MS"
    ],
    "timeComplexity": "O(log n)",
    "spaceComplexity": "O(1)",
    "hints": [
      "At any mid point, at least one half of the array is sorted.",
      "Compare a[lo] with a[mid] to find out which half is sorted.",
      "If the target is inside the sorted half’s range, search there. Otherwise search the other half."
    ]
  },
  {
    "id": "42",
    "title": "Trapping Rain Water",
    "leetcodeSlug": "trapping-rain-water",
    "difficulty": "Hard",
    "pattern": "Two Pointers",
    "companies": [
      "A",
      "G",
      "B",
      "M"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "hints": [
      "Water above index i = min(highest bar to the left, highest bar to the right) − h[i].",
      "Precomputing both \"max so far\" arrays gives O(n) time and O(n) space.",
      "With two pointers, process the side whose max is smaller. Its water level is already decided."
    ]
  },
  {
    "id": "46",
    "title": "Permutations",
    "leetcodeSlug": "permutations",
    "difficulty": "Medium",
    "pattern": "Backtracking",
    "companies": [
      "M",
      "MS"
    ],
    "timeComplexity": "O(n · n!)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Build each permutation one position at a time.",
      "Keep track of which numbers are already used in the current path.",
      "Backtrack: choose, recurse, un-choose. Save a copy when the path has length n."
    ]
  },
  {
    "id": "48",
    "title": "Rotate Image",
    "leetcodeSlug": "rotate-image",
    "difficulty": "Medium",
    "pattern": "Matrix",
    "companies": [
      "A",
      "MS",
      "AP"
    ],
    "timeComplexity": "O(n²)",
    "spaceComplexity": "O(1)",
    "hints": [
      "It must be in place, so think in terms of simple transformations of the matrix.",
      "A 90° clockwise rotation = transpose, then reverse each row.",
      "Transpose by swapping m[i][j] with m[j][i] for every j > i."
    ]
  },
  {
    "id": "49",
    "title": "Group Anagrams",
    "leetcodeSlug": "group-anagrams",
    "difficulty": "Medium",
    "pattern": "Hash Map",
    "companies": [
      "A",
      "B",
      "M"
    ],
    "timeComplexity": "O(n · k log k)",
    "spaceComplexity": "O(n · k)",
    "hints": [
      "Anagrams share the same canonical form.",
      "The sorted word, or a tuple of 26 letter counts, works as that key.",
      "Group with a hash map from key → list of words."
    ]
  },
  {
    "id": "53",
    "title": "Maximum Subarray",
    "leetcodeSlug": "maximum-subarray",
    "difficulty": "Medium",
    "pattern": "Dynamic Programming",
    "companies": [
      "A",
      "MS",
      "AP"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "hints": [
      "At each index, you either extend the previous subarray or start a new one.",
      "cur = max(x, cur + x).",
      "Track the best value of cur seen so far. This is Kadane’s algorithm."
    ]
  },
  {
    "id": "56",
    "title": "Merge Intervals",
    "leetcodeSlug": "merge-intervals",
    "difficulty": "Medium",
    "pattern": "Intervals",
    "companies": [
      "M",
      "G",
      "A",
      "B"
    ],
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Sort the intervals by start time.",
      "An interval overlaps the last merged one if its start ≤ that interval’s end.",
      "If they overlap, extend the end with max(). Otherwise append a new interval."
    ]
  },
  {
    "id": "70",
    "title": "Climbing Stairs",
    "leetcodeSlug": "climbing-stairs",
    "difficulty": "Easy",
    "pattern": "Dynamic Programming",
    "companies": [
      "A",
      "AP"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "hints": [
      "To reach step n, your last move came from step n − 1 or step n − 2.",
      "ways(n) = ways(n − 1) + ways(n − 2), which is the Fibonacci sequence.",
      "You only need to keep the last two values."
    ]
  },
  {
    "id": "76",
    "title": "Minimum Window Substring",
    "leetcodeSlug": "minimum-window-substring",
    "difficulty": "Hard",
    "pattern": "Sliding Window",
    "companies": [
      "M",
      "A",
      "G"
    ],
    "timeComplexity": "O(m + n)",
    "spaceComplexity": "O(alphabet)",
    "hints": [
      "Expand the right edge until the window contains all of t, then shrink from the left.",
      "Keep counts of the characters you still need and how many are missing.",
      "While the window is valid, record it and move l forward, updating the counts."
    ]
  },
  {
    "id": "79",
    "title": "Word Search",
    "leetcodeSlug": "word-search",
    "difficulty": "Medium",
    "pattern": "Backtracking",
    "companies": [
      "A",
      "MS",
      "B"
    ],
    "timeComplexity": "O(m · n · 4^L)",
    "spaceComplexity": "O(L)",
    "hints": [
      "Start a DFS from every cell that matches word[0].",
      "From each cell, try the 4 neighbours for the next character.",
      "Mark a cell as used while it is on the path, and unmark it when you backtrack."
    ]
  },
  {
    "id": "98",
    "title": "Validate Binary Search Tree",
    "leetcodeSlug": "validate-binary-search-tree",
    "difficulty": "Medium",
    "pattern": "Trees",
    "companies": [
      "A",
      "M",
      "MS",
      "B"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(h)",
    "hints": [
      "Checking each node only against its direct children is not enough.",
      "Every node must sit within (low, high) bounds inherited from its ancestors.",
      "Recurse left with high = node.val and right with low = node.val. An inorder traversal must also be strictly increasing."
    ]
  },
  {
    "id": "102",
    "title": "Binary Tree Level Order Traversal",
    "leetcodeSlug": "binary-tree-level-order-traversal",
    "difficulty": "Medium",
    "pattern": "BFS",
    "companies": [
      "A",
      "M",
      "MS"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "This is BFS with a queue.",
      "Handle one level at a time: read the queue’s size before you start popping.",
      "Pop exactly that many nodes, push their children, and collect the values."
    ]
  },
  {
    "id": "121",
    "title": "Best Time to Buy and Sell Stock",
    "leetcodeSlug": "best-time-to-buy-and-sell-stock",
    "difficulty": "Easy",
    "pattern": "Array",
    "companies": [
      "A",
      "M",
      "B",
      "MS"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "hints": [
      "You must buy before you sell.",
      "Track the lowest price seen so far.",
      "Each day, profit = price − lowest so far. Keep the best profit."
    ]
  },
  {
    "id": "124",
    "title": "Binary Tree Maximum Path Sum",
    "leetcodeSlug": "binary-tree-maximum-path-sum",
    "difficulty": "Hard",
    "pattern": "Trees",
    "companies": [
      "M",
      "A",
      "G"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(h)",
    "hints": [
      "Any node can be the highest point of a path that uses both of its children.",
      "To its parent, a node can only return one branch: node.val + max(0, left, right).",
      "Update a global answer with node.val + max(0, left) + max(0, right)."
    ]
  },
  {
    "id": "128",
    "title": "Longest Consecutive Sequence",
    "leetcodeSlug": "longest-consecutive-sequence",
    "difficulty": "Medium",
    "pattern": "Hash Map",
    "companies": [
      "G",
      "A",
      "M"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Sorting gives O(n log n). Can you do it in O(n)?",
      "Put every number in a hash set.",
      "Only start counting a run from numbers x where x − 1 is not in the set."
    ]
  },
  {
    "id": "138",
    "title": "Copy List with Random Pointer",
    "leetcodeSlug": "copy-list-with-random-pointer",
    "difficulty": "Medium",
    "pattern": "Linked List",
    "companies": [
      "A",
      "M",
      "B"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "The tricky part is random pointers to nodes that have not been copied yet.",
      "First pass: map each original node → a new copy.",
      "Second pass: set next and random on the copies using the map. Interleaving copies in the list gives O(1) extra space."
    ]
  },
  {
    "id": "139",
    "title": "Word Break",
    "leetcodeSlug": "word-break",
    "difficulty": "Medium",
    "pattern": "Dynamic Programming",
    "companies": [
      "A",
      "G",
      "M"
    ],
    "timeComplexity": "O(n²)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Let dp[i] mean \"s[:i] can be split into dictionary words\".",
      "dp[i] is true if some j < i has dp[j] true and s[j:i] is in the dictionary.",
      "Put the dictionary in a set and start with dp[0] = true."
    ]
  },
  {
    "id": "146",
    "title": "LRU Cache",
    "leetcodeSlug": "lru-cache",
    "difficulty": "Medium",
    "pattern": "Design",
    "companies": [
      "A",
      "M",
      "MS",
      "G",
      "B"
    ],
    "timeComplexity": "O(1) per op",
    "spaceComplexity": "O(capacity)",
    "hints": [
      "You need O(1) lookup and O(1) \"mark as most recently used\".",
      "Combine a hash map (key → node) with a doubly linked list ordered by recency.",
      "On get and put, move the node to the front. When over capacity, evict from the tail."
    ]
  },
  {
    "id": "200",
    "title": "Number of Islands",
    "leetcodeSlug": "number-of-islands",
    "difficulty": "Medium",
    "pattern": "BFS",
    "companies": [
      "A",
      "G",
      "M",
      "MS",
      "B"
    ],
    "timeComplexity": "O(m · n)",
    "spaceComplexity": "O(m · n)",
    "hints": [
      "Each island is a connected group of \"1\" cells.",
      "Scan the grid. When you find unvisited land, count one island and flood-fill it.",
      "Use DFS or BFS to mark all connected land as visited (or overwrite it with \"0\")."
    ]
  },
  {
    "id": "206",
    "title": "Reverse Linked List",
    "leetcodeSlug": "reverse-linked-list",
    "difficulty": "Easy",
    "pattern": "Linked List",
    "companies": [
      "A",
      "MS",
      "AP",
      "M"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "hints": [
      "You need three pointers: prev, curr and next.",
      "Save next, point curr.next back to prev, then move both forward.",
      "Return prev at the end. Practise the recursive version as well."
    ]
  },
  {
    "id": "207",
    "title": "Course Schedule",
    "leetcodeSlug": "course-schedule",
    "difficulty": "Medium",
    "pattern": "Topological Sort",
    "companies": [
      "A",
      "G",
      "M"
    ],
    "timeComplexity": "O(V + E)",
    "spaceComplexity": "O(V + E)",
    "hints": [
      "Courses and prerequisites form a directed graph.",
      "You can finish every course only if the graph has no cycle.",
      "Kahn’s algorithm: keep taking nodes with in-degree 0 and check whether you processed all of them."
    ]
  },
  {
    "id": "208",
    "title": "Implement Trie (Prefix Tree)",
    "leetcodeSlug": "implement-trie-prefix-tree",
    "difficulty": "Medium",
    "pattern": "Trie",
    "companies": [
      "G",
      "A",
      "MS"
    ],
    "timeComplexity": "O(L) per op",
    "spaceComplexity": "O(total characters)",
    "hints": [
      "Each node maps a character to a child node.",
      "insert walks or creates nodes along the word, then marks the end.",
      "search needs the end mark. startsWith only needs the path to exist."
    ]
  },
  {
    "id": "215",
    "title": "Kth Largest Element in an Array",
    "leetcodeSlug": "kth-largest-element-in-an-array",
    "difficulty": "Medium",
    "pattern": "Heap",
    "companies": [
      "M",
      "A",
      "G"
    ],
    "timeComplexity": "O(n log k) / O(n) avg",
    "spaceComplexity": "O(k)",
    "hints": [
      "Sorting is O(n log n). Can you avoid sorting everything?",
      "Keep a min-heap of size k. Its top is the k-th largest element.",
      "Quickselect, using the partition step from quicksort, runs in O(n) on average."
    ]
  },
  {
    "id": "236",
    "title": "Lowest Common Ancestor of a Binary Tree",
    "leetcodeSlug": "lowest-common-ancestor-of-a-binary-tree",
    "difficulty": "Medium",
    "pattern": "Trees",
    "companies": [
      "M",
      "A",
      "MS"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(h)",
    "hints": [
      "Recurse into both subtrees looking for p or q.",
      "If the current node is p or q, return it.",
      "If both sides return something, the current node is the LCA. Otherwise pass up whichever side is non-null."
    ]
  },
  {
    "id": "238",
    "title": "Product of Array Except Self",
    "leetcodeSlug": "product-of-array-except-self",
    "difficulty": "Medium",
    "pattern": "Array",
    "companies": [
      "A",
      "M",
      "AP"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1) extra",
    "hints": [
      "Division is not allowed, and it would break with zeros anyway.",
      "answer[i] = (product of everything to the left of i) × (product of everything to the right).",
      "Fill prefix products left to right, then multiply by a running suffix product right to left."
    ]
  },
  {
    "id": "239",
    "title": "Sliding Window Maximum",
    "leetcodeSlug": "sliding-window-maximum",
    "difficulty": "Hard",
    "pattern": "Monotonic Queue",
    "companies": [
      "A",
      "G"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(k)",
    "hints": [
      "A heap works in O(n log n), but there is an O(n) approach.",
      "Keep a deque of indices whose values are in decreasing order.",
      "Pop from the back while smaller than the new value, pop from the front when it leaves the window. The front is the max."
    ]
  },
  {
    "id": "253",
    "title": "Meeting Rooms II",
    "leetcodeSlug": "meeting-rooms-ii",
    "difficulty": "Medium",
    "pattern": "Intervals",
    "companies": [
      "G",
      "M",
      "A",
      "B"
    ],
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Rooms needed = the largest number of meetings happening at the same time.",
      "Sort by start time and keep a min-heap of the end times of rooms in use.",
      "If the earliest end ≤ the new start, reuse that room (pop). Push the new end. The heap size is the answer."
    ]
  },
  {
    "id": "297",
    "title": "Serialize and Deserialize Binary Tree",
    "leetcodeSlug": "serialize-and-deserialize-binary-tree",
    "difficulty": "Hard",
    "pattern": "Trees",
    "companies": [
      "A",
      "M",
      "G",
      "MS"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Pick a traversal and include markers for null children.",
      "Preorder with \"#\" for null describes the tree exactly.",
      "Deserialize by reading tokens recursively in the same order."
    ]
  },
  {
    "id": "300",
    "title": "Longest Increasing Subsequence",
    "leetcodeSlug": "longest-increasing-subsequence",
    "difficulty": "Medium",
    "pattern": "Dynamic Programming",
    "companies": [
      "G",
      "MS",
      "A"
    ],
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "O(n²) DP: dp[i] = 1 + max(dp[j]) over j < i with a[j] < a[i].",
      "Faster: keep tails[k] = the smallest possible tail of an increasing subsequence of length k + 1.",
      "For each x, binary-search its position in tails and replace that value (or append)."
    ]
  },
  {
    "id": "322",
    "title": "Coin Change",
    "leetcodeSlug": "coin-change",
    "difficulty": "Medium",
    "pattern": "Dynamic Programming",
    "companies": [
      "A",
      "G",
      "B"
    ],
    "timeComplexity": "O(amount × coins)",
    "spaceComplexity": "O(amount)",
    "hints": [
      "Greedy fails, e.g. coins [1, 3, 4] with amount 6.",
      "Let dp[a] = fewest coins that make amount a.",
      "dp[a] = min(dp[a − c] + 1) over all coins c, with dp[0] = 0. Unreachable amounts stay infinite."
    ]
  },
  {
    "id": "347",
    "title": "Top K Frequent Elements",
    "leetcodeSlug": "top-k-frequent-elements",
    "difficulty": "Medium",
    "pattern": "Heap",
    "companies": [
      "A",
      "M",
      "G"
    ],
    "timeComplexity": "O(n log k) / O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Count frequencies with a hash map first.",
      "A min-heap of size k over (count, number) gives O(n log k).",
      "Bucket sort by frequency gives O(n): buckets[count] holds the numbers with that count."
    ]
  },
  {
    "id": "394",
    "title": "Decode String",
    "leetcodeSlug": "decode-string",
    "difficulty": "Medium",
    "pattern": "Stack",
    "companies": [
      "G",
      "A",
      "B"
    ],
    "timeComplexity": "O(output length)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Nested brackets suggest a stack.",
      "On \"[\", push the current string and the repeat count, then reset both.",
      "On \"]\", pop and set current = previous + current × count."
    ]
  },
  {
    "id": "560",
    "title": "Subarray Sum Equals K",
    "leetcodeSlug": "subarray-sum-equals-k",
    "difficulty": "Medium",
    "pattern": "Prefix Sum",
    "companies": [
      "M",
      "G",
      "A"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Negative numbers break the sliding-window approach.",
      "sum(i..j) = prefix[j] − prefix[i − 1], so you need to know how often prefix[j] − k appeared before.",
      "Keep a hash map of prefix-sum counts, starting with {0: 1}."
    ]
  },
  {
    "id": "739",
    "title": "Daily Temperatures",
    "leetcodeSlug": "daily-temperatures",
    "difficulty": "Medium",
    "pattern": "Monotonic Stack",
    "companies": [
      "A",
      "G"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "For each day you want the next warmer day, which is a \"next greater element\" problem.",
      "Keep a stack of indices whose temperatures are decreasing.",
      "When a warmer day arrives, pop and set answer[j] = i − j."
    ]
  },
  {
    "id": "973",
    "title": "K Closest Points to Origin",
    "leetcodeSlug": "k-closest-points-to-origin",
    "difficulty": "Medium",
    "pattern": "Heap",
    "companies": [
      "M",
      "A"
    ],
    "timeComplexity": "O(n log k)",
    "spaceComplexity": "O(k)",
    "hints": [
      "Compare squared distances. There is no need for sqrt.",
      "Use a max-heap of size k: push each point and pop the farthest when the heap grows past k.",
      "Quickselect also works, in O(n) on average."
    ]
  },
  {
    "id": "994",
    "title": "Rotting Oranges",
    "leetcodeSlug": "rotting-oranges",
    "difficulty": "Medium",
    "pattern": "BFS",
    "companies": [
      "A",
      "MS"
    ],
    "timeComplexity": "O(m · n)",
    "spaceComplexity": "O(m · n)",
    "hints": [
      "Rot spreads from all rotten oranges at the same time.",
      "Multi-source BFS: start the queue with every rotten orange.",
      "Process level by level, counting minutes. At the end, check whether any fresh oranges are left."
    ]
  },
  {
    "id": "1143",
    "title": "Longest Common Subsequence",
    "leetcodeSlug": "longest-common-subsequence",
    "difficulty": "Medium",
    "pattern": "Dynamic Programming",
    "companies": [
      "G",
      "A"
    ],
    "timeComplexity": "O(m · n)",
    "spaceComplexity": "O(min(m, n))",
    "hints": [
      "This is classic 2D DP over prefixes of both strings.",
      "If a[i] == b[j], dp[i][j] = dp[i−1][j−1] + 1. Otherwise dp[i][j] = max(dp[i−1][j], dp[i][j−1]).",
      "You only need the previous row, which brings space down to O(n)."
    ]
  }
];
