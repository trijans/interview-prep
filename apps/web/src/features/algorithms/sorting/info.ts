export type SortId = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap';

export const SORT_INFO: Record<SortId, { name: string; best: string; average: string; worst: string; space: string; stable: string; idea: string; code: string[] }> = {
  "bubble": {
    "name": "Bubble sort",
    "best": "O(n)",
    "average": "O(n²)",
    "worst": "O(n²)",
    "space": "O(1)",
    "stable": "Yes",
    "idea": "Walk through the list comparing neighbours and swap any pair that is out of order. After each pass, the biggest remaining value has \"bubbled\" to the end.",
    "code": [
      "for i from 0 to n − 1:",
      "  for j from 0 to n − 2 − i:",
      "    if a[j] > a[j + 1]:",
      "      swap a[j] and a[j + 1]",
      "  a[n − 1 − i] is now in its final place"
    ]
  },
  "selection": {
    "name": "Selection sort",
    "best": "O(n²)",
    "average": "O(n²)",
    "worst": "O(n²)",
    "space": "O(1)",
    "stable": "No",
    "idea": "Find the smallest value in the unsorted part and swap it to the front. Repeat for the next position.",
    "code": [
      "for i from 0 to n − 1:",
      "  m = i                      # smallest so far",
      "  for j from i + 1 to n − 1:",
      "    if a[j] < a[m]: m = j",
      "  swap a[i] and a[m]"
    ]
  },
  "insertion": {
    "name": "Insertion sort",
    "best": "O(n)",
    "average": "O(n²)",
    "worst": "O(n²)",
    "space": "O(1)",
    "stable": "Yes",
    "idea": "Like sorting playing cards in your hand: take the next card and slide it left until it sits in the right place among the cards already sorted.",
    "code": [
      "for i from 1 to n − 1:",
      "  j = i",
      "  while j > 0 and a[j − 1] > a[j]:",
      "    swap a[j − 1] and a[j]",
      "    j = j − 1"
    ]
  },
  "merge": {
    "name": "Merge sort",
    "best": "O(n log n)",
    "average": "O(n log n)",
    "worst": "O(n log n)",
    "space": "O(n)",
    "stable": "Yes",
    "idea": "Split the list in half again and again until each piece has one item, then merge the pieces back together in order. Merging two sorted lists is easy: keep taking the smaller front item.",
    "code": [
      "mergeSort(lo, hi):",
      "  if lo >= hi: return       # one item is sorted",
      "  mid = (lo + hi) / 2",
      "  mergeSort(lo, mid), mergeSort(mid + 1, hi)",
      "  merge: compare the front items of both halves",
      "         and write the smaller one back, repeat"
    ]
  },
  "quick": {
    "name": "Quick sort",
    "best": "O(n log n)",
    "average": "O(n log n)",
    "worst": "O(n²)",
    "space": "O(log n)",
    "stable": "No",
    "idea": "Pick a pivot value. Move everything smaller to its left and everything bigger to its right, which puts the pivot in its final place. Then do the same for each side.",
    "code": [
      "quickSort(lo, hi):",
      "  if lo >= hi: return",
      "  pivot = a[hi], i = lo",
      "  for j from lo to hi − 1:",
      "    if a[j] < pivot: swap a[i] and a[j], i = i + 1",
      "  swap a[i] and a[hi]    # pivot lands in place",
      "  quickSort(lo, i − 1), quickSort(i + 1, hi)"
    ]
  },
  "heap": {
    "name": "Heap sort",
    "best": "O(n log n)",
    "average": "O(n log n)",
    "worst": "O(n log n)",
    "space": "O(1)",
    "stable": "No",
    "idea": "First arrange the array as a max-heap, so the biggest value is at the front. Then repeatedly swap the biggest to the end and repair the heap.",
    "code": [
      "build a max-heap (every parent >= its children)",
      "for end from n − 1 down to 1:",
      "  swap a[0] (the largest) with a[end]",
      "  a[end] is now in its final place",
      "  sift a[0] down to repair the heap"
    ]
  }
};
