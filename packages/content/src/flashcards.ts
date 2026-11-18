import type { FlashcardDeck } from './types';

export const DECKS: FlashcardDeck[] = [
  {
    "id": "swe",
    "name": "Software engineering",
    "topics": [
      {
        "name": "Operating Systems",
        "cards": [
          {
            "q": "Process vs thread?",
            "a": "A process has its own address space and resources. Threads live inside a process and share its memory, so they are cheaper to create and switch between, but shared memory needs synchronisation."
          },
          {
            "q": "What is virtual memory?",
            "a": "Each process gets its own contiguous address space. Pages are mapped to physical frames through page tables, with the TLB caching translations. This gives isolation, lets memory be overcommitted, and allows paging to disk."
          },
          {
            "q": "What is a page fault?",
            "a": "An access to a page that is not in physical memory (or a permission violation). The OS loads the page from disk or zero-fills it and retries the instruction. A minor fault is resolved without disk I/O. A major fault needs disk I/O."
          },
          {
            "q": "What does a context switch cost?",
            "a": "Saving and restoring registers, possibly switching page tables (between processes) and losing warm caches and TLB entries. Typically a few microseconds. Switching between threads of the same process is cheaper."
          },
          {
            "q": "What are the four conditions for deadlock?",
            "a": "Mutual exclusion, hold-and-wait, no preemption, circular wait (the Coffman conditions). Break any one, for example by always acquiring locks in a fixed global order."
          },
          {
            "q": "Stack vs heap memory?",
            "a": "The stack is per thread, LIFO, allocated and freed automatically, fast but limited in size. The heap is dynamically allocated and shared, managed by malloc/free or a garbage collector, and can fragment."
          }
        ]
      },
      {
        "name": "Networking",
        "cards": [
          {
            "q": "What happens when you type a URL and press Enter?",
            "a": "DNS lookup (browser cache → OS → resolver → root → TLD → authoritative), TCP handshake, TLS handshake, HTTP request, server processing, response, then the browser parses HTML, fetches sub-resources and renders (DOM, CSSOM, layout, paint)."
          },
          {
            "q": "TCP vs UDP?",
            "a": "TCP is connection-oriented, reliable and ordered, with flow and congestion control. UDP is connectionless with no delivery guarantees but very low overhead. It is used for DNS, games, video calls and QUIC."
          },
          {
            "q": "Explain the TCP three-way handshake.",
            "a": "SYN → SYN-ACK → ACK. Both sides agree on initial sequence numbers. Closing uses FIN/ACK in each direction, and the side that closes first waits in TIME_WAIT."
          },
          {
            "q": "HTTP/1.1 vs HTTP/2 vs HTTP/3?",
            "a": "1.1: one in-flight request per connection, so it suffers head-of-line blocking. 2: binary framing and many multiplexed streams on one TCP connection, plus header compression. 3: runs over QUIC (UDP), which removes TCP head-of-line blocking and gives faster handshakes."
          },
          {
            "q": "How does TLS work?",
            "a": "The client says hello. The server sends a certificate, which the client verifies against trusted CAs. They do an ECDHE key exchange to derive symmetric session keys, then encrypt all data with those keys. TLS 1.3 needs a single round trip."
          },
          {
            "q": "L4 vs L7 load balancer?",
            "a": "L4 routes on IP and port without reading the payload, so it is fast and protocol-agnostic. L7 understands HTTP: it can route by path, header or cookie, terminate TLS and rewrite requests, at more CPU cost."
          }
        ]
      },
      {
        "name": "Databases",
        "cards": [
          {
            "q": "What does ACID mean?",
            "a": "Atomicity (all or nothing), Consistency (constraints hold), Isolation (concurrent transactions do not interfere), Durability (committed data survives crashes, via the write-ahead log)."
          },
          {
            "q": "What are the isolation levels?",
            "a": "Read uncommitted (allows dirty reads) → read committed (allows non-repeatable reads) → repeatable read (allows phantoms) → serializable. Many databases default to read committed. MySQL InnoDB defaults to repeatable read."
          },
          {
            "q": "How does an index work?",
            "a": "Usually a B+tree of sorted keys, giving O(log n) lookups and efficient range scans. It speeds up reads but slows writes and uses storage. Composite indexes follow the leftmost-prefix rule."
          },
          {
            "q": "When would you choose SQL vs NoSQL?",
            "a": "SQL for relational data, joins, transactions and strong consistency. NoSQL for flexible schemas, huge horizontal scale, high write throughput and simple, known access patterns."
          },
          {
            "q": "What are the sharding strategies?",
            "a": "Hash-based, range-based, directory/lookup, geographic. Pitfalls: hot shards, cross-shard queries and transactions, and resharding (consistent hashing reduces data movement)."
          },
          {
            "q": "How does replication work?",
            "a": "Leader–follower (synchronous or asynchronous), multi-leader, or leaderless with quorums (R + W > N). Asynchronous replication lag can cause stale reads, so route read-your-writes requests to the leader."
          }
        ]
      },
      {
        "name": "OOP & Design",
        "cards": [
          {
            "q": "What are the four pillars of OOP?",
            "a": "Encapsulation (hide state behind methods), abstraction (expose only what is essential), inheritance (reuse through is-a), polymorphism (one interface, many implementations)."
          },
          {
            "q": "What is SOLID?",
            "a": "Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion."
          },
          {
            "q": "Composition vs inheritance?",
            "a": "Prefer composition (has-a). It is more flexible, can change behaviour at runtime and avoids fragile base classes. Use inheritance only for a true is-a relationship with shared behaviour."
          },
          {
            "q": "How would you design an LRU cache?",
            "a": "A hash map from key to node plus a doubly linked list ordered by recency. get: move the node to the front. put: insert at the front and evict from the tail when full. Every operation is O(1)."
          },
          {
            "q": "Name design patterns you have used.",
            "a": "Strategy (swappable algorithms), Observer (events), Factory and Builder (object creation), Decorator (adding behaviour), Adapter (incompatible interfaces), Singleton (use sparingly). Give a real example for each one you mention."
          },
          {
            "q": "Interface vs abstract class?",
            "a": "An interface is a pure contract, and a class can implement many. An abstract class can hold state and partial implementation, but a class can extend only one (in Java and C#)."
          }
        ]
      },
      {
        "name": "Concurrency",
        "cards": [
          {
            "q": "Mutex vs semaphore?",
            "a": "A mutex gives exclusive access and has an owner (only the holder unlocks it). A semaphore is a counter that allows up to N holders, has no ownership, and is used for resource pools and signalling."
          },
          {
            "q": "What is a race condition and how do you fix it?",
            "a": "The result depends on how threads interleave, for example two threads doing count++. Fix it with locks, atomic operations, immutable data, or confining data to one thread or actor."
          },
          {
            "q": "How do you implement producer–consumer?",
            "a": "A bounded buffer with a lock and two condition variables (notFull, notEmpty), or simply a blocking queue. Producers wait when the buffer is full and consumers wait when it is empty."
          },
          {
            "q": "Optimistic vs pessimistic locking?",
            "a": "Optimistic: read a version, check it at commit, and retry on conflict. Good when contention is low. Pessimistic: lock up front (SELECT … FOR UPDATE). Good when contention is high."
          },
          {
            "q": "Async I/O vs multithreading?",
            "a": "Async interleaves many I/O-bound tasks on one thread with an event loop. Threads give real parallelism for CPU-bound work (in CPython, the GIL limits this, so use processes)."
          },
          {
            "q": "What is idempotency and why does it matter?",
            "a": "Running a request several times has the same effect as running it once. It is essential for safe retries, for example idempotency keys on payments. GET, PUT and DELETE are idempotent. POST is not."
          }
        ]
      },
      {
        "name": "Web & APIs",
        "cards": [
          {
            "q": "REST vs GraphQL vs gRPC?",
            "a": "REST: resource URLs, HTTP verbs, cacheable, simple. GraphQL: the client asks for exactly the fields it needs through one endpoint, which avoids over- and under-fetching. gRPC: binary Protobuf over HTTP/2 with streaming, ideal between internal services."
          },
          {
            "q": "Authentication vs authorization? Sessions vs JWT?",
            "a": "Authentication is who you are. Authorization is what you can do. Sessions keep state on the server (easy to revoke). JWTs are stateless signed tokens (scale easily but are hard to revoke, so keep them short-lived and use refresh tokens)."
          },
          {
            "q": "What is CORS?",
            "a": "A browser rule that blocks cross-origin requests unless the server allows them with Access-Control-Allow-Origin headers. Non-simple requests are sent a preflight OPTIONS request first."
          },
          {
            "q": "How does HTTP caching work?",
            "a": "Cache-Control (max-age, no-cache, no-store, public/private), plus validators: ETag with If-None-Match, or Last-Modified with If-Modified-Since. When nothing changed, the server replies 304 Not Modified."
          },
          {
            "q": "Offset vs cursor pagination?",
            "a": "Offset (LIMIT/OFFSET) is simple, but it slows down on deep pages and shifts when data changes. A cursor (WHERE id < last_id) is stable and fast, which is better for feeds."
          },
          {
            "q": "Name the key HTTP status codes.",
            "a": "200 OK, 201 Created, 204 No Content, 301/302 redirects, 304 Not Modified, 400 Bad Request, 401 Unauthenticated, 403 Forbidden, 404 Not Found, 409 Conflict, 429 Too Many Requests, 500 Server Error, 503 Unavailable."
          }
        ]
      }
    ]
  },
  {
    "id": "ai",
    "name": "AI & ML",
    "topics": [
      {
        "name": "ML Fundamentals",
        "cards": [
          {
            "q": "Explain the bias–variance trade-off.",
            "a": "Bias is error from overly simple assumptions (underfitting). Variance is error from being too sensitive to the training data (overfitting). More complex models lower bias but raise variance. The goal is the lowest total error on unseen data, chosen with validation data."
          },
          {
            "q": "How do you detect and reduce overfitting?",
            "a": "Detect it when training performance keeps improving while validation performance stalls or gets worse. Reduce it with more data, data augmentation, regularization (L1/L2, dropout), a simpler model, early stopping, or ensembling."
          },
          {
            "q": "L1 vs L2 regularization?",
            "a": "L1 adds the sum of |weights|: it pushes many weights to exactly zero, giving sparse models and implicit feature selection. L2 adds the sum of squared weights: it shrinks all weights smoothly and handles correlated features better. Elastic net combines both."
          },
          {
            "q": "What is data leakage? Give two examples.",
            "a": "Information that would not be available at prediction time leaks into training, so offline results look great and production results do not. Examples: scaling with statistics computed on the full dataset, a feature derived from the label, or a random split on time-series data."
          },
          {
            "q": "How do you handle class imbalance?",
            "a": "Use metrics that reflect it (precision, recall, PR-AUC), class weights or a focal loss, resampling (over-sample the minority or down-sample the majority, then recalibrate), more minority data, and a threshold tuned to the business cost."
          },
          {
            "q": "Why use cross-validation, and when not k-fold?",
            "a": "It gives a more reliable estimate of generalization by training and testing on several splits. For time series, use forward-chaining splits (train on the past, test on the future). For grouped data such as several rows per user, split by group to avoid leakage."
          }
        ]
      },
      {
        "name": "Deep Learning",
        "cards": [
          {
            "q": "How does backpropagation work?",
            "a": "It applies the chain rule backwards through the network. The gradient of the loss with respect to each layer’s output is multiplied by that layer’s local derivative to get gradients for its weights and inputs, reusing intermediate values from the forward pass."
          },
          {
            "q": "What causes vanishing or exploding gradients, and what fixes them?",
            "a": "Repeatedly multiplying by derivatives smaller (or larger) than 1 across many layers. Fixes: ReLU-family activations, careful initialization (He or Xavier), normalization layers, residual connections, gradient clipping, and gated units in RNNs."
          },
          {
            "q": "Batch normalization vs layer normalization?",
            "a": "Batch norm normalizes each feature across the batch, so it depends on batch size and behaves differently in training and inference. Layer norm normalizes across features within each example, so it works with any batch size and sequence length, which is why transformers use it."
          },
          {
            "q": "What does dropout do?",
            "a": "During training it randomly zeroes a fraction of activations, so the network cannot rely on any single unit. This acts like training an ensemble of sub-networks. It is turned off at inference (activations are scaled to compensate)."
          },
          {
            "q": "SGD vs momentum vs Adam?",
            "a": "SGD steps along the current gradient. Momentum adds a moving average of past gradients, which damps zig-zagging and speeds progress along consistent directions. Adam also scales each parameter’s step by a running estimate of its gradient magnitude, which makes it robust and fast to tune. Try the gradient descent lab."
          },
          {
            "q": "Why ReLU over sigmoid in hidden layers?",
            "a": "Sigmoid saturates for large inputs, so its gradients vanish. ReLU has a constant gradient for positive inputs, is cheap to compute, and trains faster. Its downside is \"dead\" units stuck at zero, which variants such as Leaky ReLU or GELU address."
          }
        ]
      },
      {
        "name": "Transformers & LLMs",
        "cards": [
          {
            "q": "How does self-attention work?",
            "a": "Each token is projected into a query, a key and a value. A token’s output is a weighted sum of all values, where the weights are the softmax of its query’s dot products with every key. Multiple heads learn different relationships in parallel."
          },
          {
            "q": "Why divide the attention scores by √d_k?",
            "a": "Dot products of random vectors grow with the dimension d_k. Large scores push the softmax into saturation, where gradients are tiny. Dividing by √d_k keeps their variance roughly constant."
          },
          {
            "q": "How do transformers know word order?",
            "a": "Attention itself has no notion of order, so position information is added: originally fixed sinusoidal or learned position embeddings; today often rotary position embeddings (RoPE), which rotate queries and keys by an angle depending on position."
          },
          {
            "q": "What is the KV cache and why does it matter?",
            "a": "During generation, the keys and values of earlier tokens do not change, so they are stored instead of recomputed at each step. This makes decoding much faster, but the cache uses memory that grows with batch size × context length, which limits how many requests a GPU can serve at once."
          },
          {
            "q": "Pretraining vs fine-tuning vs preference tuning?",
            "a": "Pretraining learns language and knowledge by predicting the next token on huge text corpora. Supervised fine-tuning teaches it to follow instructions with example conversations. Preference tuning (RLHF or DPO) teaches it to prefer responses people rate as better and safer."
          },
          {
            "q": "What are tokens, and why do they matter in practice?",
            "a": "Models read sub-word tokens produced by an algorithm such as byte-pair encoding, not characters or words. Cost, context limits and latency are all measured in tokens, and tokenization explains odd behaviors such as trouble counting letters in a word."
          }
        ]
      },
      {
        "name": "RAG & Agents",
        "cards": [
          {
            "q": "What is RAG and when would you use it instead of fine-tuning?",
            "a": "Retrieval-augmented generation fetches relevant documents at query time and puts them in the prompt. Use it for knowledge that changes, must be cited, or has access controls. Use fine-tuning for style, format or a specialized skill. The two combine well."
          },
          {
            "q": "What are embeddings and how does vector search work?",
            "a": "Embeddings are vectors where similar meanings are close together. Documents are embedded once and indexed; a query is embedded and its nearest neighbors are found. At scale, approximate indexes such as HNSW or IVF trade a little recall for big speed gains."
          },
          {
            "q": "Why combine keyword search with vector search, and why rerank?",
            "a": "Vector search handles paraphrases but misses exact terms such as IDs and error codes, which keyword search (BM25) catches. Hybrid search merges both. A cross-encoder reranker then scores each query–document pair jointly, which is more precise but too slow to run on everything."
          },
          {
            "q": "How would you debug a RAG system that gives wrong answers?",
            "a": "First check retrieval: was the right chunk retrieved at all (recall@k)? If not, fix chunking, embeddings, hybrid search or filters. If it was retrieved but the answer is still wrong, fix the prompt, ordering, context length or the model, and check whether the source itself is outdated."
          },
          {
            "q": "How does an agent with tools work?",
            "a": "In a loop: the model receives the goal, the conversation and a list of tool schemas, then either answers or emits a structured tool call. Your code validates and runs the tool, and returns the result. The loop repeats until the task is done or a step limit is reached."
          },
          {
            "q": "What is prompt injection and how do you defend against it?",
            "a": "Untrusted text (a web page, email or document) contains instructions that hijack the model. Defenses: treat retrieved and user content as data, give tools least privilege, enforce permissions in code, require confirmation for risky actions, filter outputs, and test with adversarial examples."
          }
        ]
      },
      {
        "name": "Evaluation & Safety",
        "cards": [
          {
            "q": "How do you evaluate an LLM feature before launch?",
            "a": "Build a test set from real or realistic inputs with expected outcomes or grading rubrics. Score it automatically where possible (exact checks, code tests, an LLM judge validated against human labels) and with human review for nuance. Rerun it on every prompt or model change, like regression tests."
          },
          {
            "q": "What are the pitfalls of using an LLM as a judge?",
            "a": "It can prefer longer answers, the first option shown, or its own style, and it can be confidently wrong. Mitigate with clear rubrics, pairwise comparisons in randomized order, checking agreement with human labels, and spot-checking regularly."
          },
          {
            "q": "How do you reduce hallucinations?",
            "a": "Ground answers in retrieved sources and ask for citations, let the model say \"I don’t know\", lower the temperature for factual tasks, check that claims are supported by the context, and use tools (search, calculators, databases) for facts and arithmetic."
          },
          {
            "q": "Offline metrics improved but the A/B test was flat. Why?",
            "a": "Possible causes: the offline metric does not reflect what users value, training–serving skew, leakage made offline results optimistic, novelty or seasonal effects, too little statistical power, or the change affects only a small share of traffic."
          },
          {
            "q": "What is perplexity, and what are its limits?",
            "a": "Perplexity is the exponential of the average negative log-likelihood per token: lower means the model predicts the text better. It is useful for comparing language models on the same data and tokenizer, but says little about helpfulness, accuracy or safety."
          },
          {
            "q": "What is red teaming, and what are guardrails?",
            "a": "Red teaming means deliberately trying to make a system fail or cause harm (jailbreaks, data leaks, unsafe advice) before users do. Guardrails are the checks around the model, such as input and output classifiers, policy filters, rate limits and human review, that catch what gets through."
          }
        ]
      },
      {
        "name": "MLOps & Production",
        "cards": [
          {
            "q": "What is training–serving skew and how do you prevent it?",
            "a": "Features are computed differently in training and in production, so the model sees different inputs than it learned from. Prevent it with shared feature code (a feature store), logging the features used at serving time and training on them, and monitoring feature distributions."
          },
          {
            "q": "Data drift vs concept drift?",
            "a": "Data drift: the input distribution changes (new users, new devices). Concept drift: the relationship between inputs and the label changes (fraud tactics evolve). Monitor input statistics and prediction distributions, track delayed labels, and retrain on a schedule or when alerts fire."
          },
          {
            "q": "How do you safely deploy a new model?",
            "a": "Validate offline on recent data, then shadow it (scores logged but not used), then a canary or A/B test on a small share of traffic with guardrail metrics. Keep the previous version ready for instant rollback and version the data, code and model together."
          },
          {
            "q": "How can you make LLM inference cheaper and faster?",
            "a": "Use a smaller or distilled model where possible, quantize weights, batch requests (continuous batching), cache prompt prefixes and repeated answers, shorten prompts, cap output length, stream responses, and route requests by difficulty."
          },
          {
            "q": "What should you monitor for a model in production?",
            "a": "System health (latency, errors, throughput, cost), data quality (missing values, schema changes, drift), model outputs (score distributions, prediction rates), business metrics, and, when labels arrive, actual accuracy. For LLMs also track user feedback and safety flags."
          },
          {
            "q": "Batch vs real-time inference?",
            "a": "Batch precomputes predictions on a schedule: cheaper and simpler, but stale. Real-time computes on request: fresh and personalized, but needs low-latency features and serving infrastructure. Many systems mix them, for example batch candidate generation with real-time ranking."
          }
        ]
      }
    ]
  }
];
