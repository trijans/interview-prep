import type { Problem } from './types';

/** ML coding problems: implement from scratch in Python and NumPy. */
export const AI_PROBLEMS: Problem[] = [
  {
    "id": "ai-softmax",
    "title": "Numerically stable softmax",
    "difficulty": "Easy",
    "pattern": "Math & NumPy",
    "companies": [],
    "summary": "Implement softmax over a vector and over each row of a matrix.",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "exp() of large logits overflows. Softmax is unchanged if you subtract a constant from every input.",
      "Subtract the max first: e = exp(x − max(x)), then divide by e.sum().",
      "For a matrix, use axis=-1 and keepdims=True so broadcasting works row by row."
    ]
  },
  {
    "id": "ai-xent",
    "title": "Cross-entropy loss from logits",
    "difficulty": "Easy",
    "pattern": "Math & NumPy",
    "companies": [],
    "summary": "Compute mean cross-entropy for a batch of logits and integer labels.",
    "timeComplexity": "O(n · C)",
    "spaceComplexity": "O(n · C)",
    "hints": [
      "Don’t compute softmax and then log: log of tiny probabilities becomes −inf.",
      "Use log-softmax: x − logsumexp(x), where logsumexp(x) = max + log(Σ exp(x − max)).",
      "Pick the true-class entry with fancy indexing, logp[np.arange(n), y], negate and average."
    ]
  },
  {
    "id": "ai-linreg",
    "title": "Linear regression: closed form and gradient descent",
    "difficulty": "Easy",
    "pattern": "Classic ML",
    "companies": [],
    "summary": "Fit weights with the normal equation, then with gradient descent.",
    "timeComplexity": "O(n·d² + d³) / O(n·d) per step",
    "spaceComplexity": "O(d²)",
    "hints": [
      "Closed form: w = (XᵀX)⁻¹Xᵀy. Add a column of ones for the bias.",
      "Prefer np.linalg.solve or lstsq over computing an explicit inverse. Add λI (ridge) if XᵀX is near-singular.",
      "Gradient of mean squared error: (2/n)·Xᵀ(Xw − y). Scale features first or gradient descent converges slowly."
    ]
  },
  {
    "id": "ai-logreg",
    "title": "Logistic regression from scratch",
    "difficulty": "Medium",
    "pattern": "Classic ML",
    "companies": [],
    "summary": "Train a binary classifier with gradient descent and L2 regularization.",
    "timeComplexity": "O(n·d) per epoch",
    "spaceComplexity": "O(d)",
    "hints": [
      "Prediction: p = sigmoid(Xw + b). Loss: binary cross-entropy.",
      "The gradient is surprisingly simple: Xᵀ(p − y) / n, and mean(p − y) for the bias.",
      "Add λ·w to the weight gradient for L2. Clip or use a stable sigmoid to avoid overflow for large |z|."
    ]
  },
  {
    "id": "ai-knn",
    "title": "k-nearest neighbors classifier",
    "difficulty": "Easy",
    "pattern": "Classic ML",
    "companies": [],
    "summary": "Predict labels by majority vote of the k closest training points.",
    "timeComplexity": "O(n·d) per query",
    "spaceComplexity": "O(n·d)",
    "hints": [
      "Compute distances from the query to every training point (vectorize with broadcasting).",
      "Use np.argpartition to get the k smallest in O(n) instead of sorting everything.",
      "Take the majority label, breaking ties by the nearest neighbor. At scale, mention KD-trees or approximate nearest neighbor search."
    ]
  },
  {
    "id": "ai-kmeans",
    "title": "K-means clustering",
    "difficulty": "Medium",
    "pattern": "Classic ML",
    "companies": [],
    "summary": "Cluster points into k groups. Handle initialization and empty clusters.",
    "timeComplexity": "O(n·k·d) per iteration",
    "spaceComplexity": "O(n + k·d)",
    "hints": [
      "Initialize with k-means++: pick each new centroid with probability proportional to squared distance from the nearest existing one.",
      "Alternate: assign each point to its nearest centroid, then move each centroid to the mean of its points.",
      "Stop when assignments stop changing. If a cluster becomes empty, re-seed it with the farthest point. Run several restarts and keep the lowest inertia."
    ]
  },
  {
    "id": "ai-metrics",
    "title": "Precision, recall, F1 and ROC-AUC",
    "difficulty": "Medium",
    "pattern": "Evaluation",
    "companies": [],
    "summary": "Compute classification metrics from labels and scores without sklearn.",
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Precision = TP / (TP + FP), recall = TP / (TP + FN), F1 = harmonic mean. Guard against division by zero.",
      "For ROC: sort by score descending, sweep the threshold and record (FPR, TPR) at each distinct score.",
      "AUC is the area under that curve (trapezoid rule), or equivalently the probability a random positive scores above a random negative."
    ]
  },
  {
    "id": "ai-mlp",
    "title": "Two-layer neural network with backprop",
    "difficulty": "Hard",
    "pattern": "Deep learning",
    "companies": [],
    "summary": "Forward pass, loss, manual gradients and SGD updates for an MLP.",
    "timeComplexity": "O(n·(d·h + h·C)) per batch",
    "spaceComplexity": "O(d·h + h·C)",
    "hints": [
      "Forward: z1 = XW1 + b1, a1 = ReLU(z1), z2 = a1W2 + b2, then softmax cross-entropy.",
      "Backward: dz2 = (softmax − onehot) / n; dW2 = a1ᵀdz2; da1 = dz2W2ᵀ; dz1 = da1 · (z1 > 0); dW1 = Xᵀdz1.",
      "Check shapes at every line, initialize weights with small random values (He initialization), and verify gradients numerically on a tiny example."
    ]
  },
  {
    "id": "ai-attn",
    "title": "Scaled dot-product attention",
    "difficulty": "Medium",
    "pattern": "Transformers",
    "companies": [],
    "summary": "Implement attention with an optional causal mask in NumPy.",
    "timeComplexity": "O(n² · d)",
    "spaceComplexity": "O(n²)",
    "hints": [
      "scores = Q Kᵀ / √d_k. Dividing by √d_k keeps the softmax from saturating when d_k is large.",
      "For a causal mask, set scores above the diagonal to −inf (np.triu with k=1) before the softmax.",
      "Apply a stable softmax over the last axis, then multiply by V. Output shape is (n, d_v)."
    ]
  },
  {
    "id": "ai-mha",
    "title": "Multi-head attention",
    "difficulty": "Hard",
    "pattern": "Transformers",
    "companies": [],
    "summary": "Split into heads, attend in parallel, and recombine with a projection.",
    "timeComplexity": "O(n² · d)",
    "spaceComplexity": "O(h · n²)",
    "hints": [
      "Project X to Q, K, V with three weight matrices of shape (d_model, d_model).",
      "Reshape to (batch, heads, seq, d_head) with d_head = d_model / heads, and attend in every head at once.",
      "Transpose back, merge the heads to (batch, seq, d_model), and apply the output projection W_o."
    ]
  },
  {
    "id": "ai-sample",
    "title": "Temperature, top-k and top-p sampling",
    "difficulty": "Medium",
    "pattern": "LLM decoding",
    "companies": [],
    "summary": "Sample the next token from logits with the three common controls.",
    "timeComplexity": "O(V log V)",
    "spaceComplexity": "O(V)",
    "hints": [
      "Divide logits by the temperature, then softmax. Temperature → 0 approaches greedy decoding.",
      "Top-k: keep the k largest probabilities. Top-p: sort descending, keep the smallest prefix whose cumulative sum reaches p.",
      "Renormalize what you kept, then sample with np.random.choice or by searching a cumulative sum with a uniform random number."
    ]
  },
  {
    "id": "ai-beam",
    "title": "Beam search decoding",
    "difficulty": "Medium",
    "pattern": "LLM decoding",
    "companies": [],
    "summary": "Keep the B most likely partial sequences at each step.",
    "timeComplexity": "O(T · B · V log(B·V))",
    "spaceComplexity": "O(B · T)",
    "hints": [
      "Keep B hypotheses, each with its tokens and its total log-probability (add logs instead of multiplying probabilities).",
      "At each step, expand every hypothesis with the vocabulary and keep the best B of the B × V candidates.",
      "Move hypotheses that emit end-of-sequence to a finished list. Normalize scores by length, or beam search favors short outputs."
    ]
  },
  {
    "id": "ai-bpe",
    "title": "Byte-pair encoding tokenizer",
    "difficulty": "Hard",
    "pattern": "Tokenization",
    "companies": [],
    "summary": "Learn merges from a corpus, then encode new text with them.",
    "timeComplexity": "O(merges · corpus size)",
    "spaceComplexity": "O(vocab + corpus)",
    "hints": [
      "Start with every word split into characters (plus an end-of-word marker), with word frequencies.",
      "Repeat: count adjacent symbol pairs weighted by word frequency, merge the most frequent pair everywhere, and record the merge.",
      "To encode new text, apply the learned merges in the same order they were learned."
    ]
  },
  {
    "id": "ai-cosine",
    "title": "Top-k cosine similarity search",
    "difficulty": "Easy",
    "pattern": "Retrieval",
    "companies": [],
    "summary": "Return the k most similar documents to a query embedding.",
    "timeComplexity": "O(n · d)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Cosine similarity = (a · b) / (|a| |b|).",
      "Normalize every document vector once in advance. Then similarity is just the matrix-vector product D q.",
      "np.argpartition gets the top k in O(n). For millions of vectors, mention approximate indexes such as HNSW or IVF."
    ]
  },
  {
    "id": "ai-chunk",
    "title": "Chunk text for RAG with overlap",
    "difficulty": "Easy",
    "pattern": "Retrieval",
    "companies": [],
    "summary": "Split documents into overlapping chunks that respect sentence boundaries.",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "hints": [
      "Decide on a size limit in tokens (e.g. ~500) and an overlap (e.g. ~50) so facts split across a boundary still appear whole in one chunk.",
      "Split on sentences or paragraphs first, then pack them into chunks until the next one would exceed the limit.",
      "Keep metadata with each chunk: document id, title, position. Very long sentences need a hard split as a fallback."
    ]
  },
  {
    "id": "ai-nms",
    "title": "Intersection over union and non-max suppression",
    "difficulty": "Medium",
    "pattern": "Vision",
    "companies": [],
    "summary": "Remove overlapping detection boxes, keeping the highest-scoring ones.",
    "timeComplexity": "O(n²)",
    "spaceComplexity": "O(n)",
    "hints": [
      "IoU = intersection area / union area. Intersection width = max(0, min(x2) − max(x1)), and the same for height.",
      "Sort boxes by score. Take the best, remove every remaining box with IoU above the threshold, and repeat.",
      "Run it per class. Vectorize the IoU of one box against all remaining boxes with NumPy."
    ]
  }
];
