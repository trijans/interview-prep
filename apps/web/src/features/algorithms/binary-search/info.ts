export const BS_CODE = {
  "exact": [
    "lo = 0, hi = n − 1",
    "while lo <= hi:",
    "  mid = (lo + hi) / 2",
    "  if a[mid] == target: return mid",
    "  if a[mid] < target: lo = mid + 1   # go right",
    "  else: hi = mid − 1                # go left",
    "return \"not found\""
  ],
  "lower": [
    "lo = 0, hi = n",
    "while lo < hi:",
    "  mid = (lo + hi) / 2",
    "  if a[mid] < target: lo = mid + 1",
    "  else: hi = mid",
    "return lo   # first index with a[i] >= target"
  ]
};
