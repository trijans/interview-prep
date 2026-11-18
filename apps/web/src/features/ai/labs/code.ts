export const GD_CODE = {
  "gd": [
    "w = starting point",
    "repeat up to 120 times:",
    "  g = gradient (slope) of the loss at w",
    "  w = w − lr × g        # step downhill",
    "  stop if g is almost zero  # flat = a minimum"
  ],
  "mom": [
    "w = starting point, v = 0",
    "repeat up to 120 times:",
    "  g = gradient (slope) of the loss at w",
    "  v = 0.9 × v + g       # velocity remembers past steps",
    "  w = w − lr × v",
    "  stop if g is almost zero"
  ],
  "adam": [
    "w = starting point, m = 0, s = 0",
    "repeat up to 120 times:",
    "  g = gradient (slope) of the loss at w",
    "  m = running average of g     # direction",
    "  s = running average of g²    # how steep",
    "  w = w − lr × m / √s          # per-direction step size",
    "  stop if g is almost zero"
  ]
};

export const KMEANS_CODE = [
  "place k centroids (k-means++: spread them out)",
  "repeat:",
  "  for each point: join the nearest centroid",
  "  for each centroid: move it to the average of its points",
  "  stop when no point changes group"
];
