import { CurriculumPhase } from '../types/curriculum';

const DEFAULT_CHECKLIST = [
  'Understand the core concept and engineering motivation.',
  'Study the recommended primary resource or documentation.',
  'Explain the underlying mechanism without referring to notes.',
  'Understand where and why this pattern is used in production AI systems.',
  'Implement or trace a concrete example verifying the behavior.'
];

export const PHASES_00_TO_03: CurriculumPhase[] = [
  {
    id: 'phase-00',
    number: '00',
    title: 'Orientation and Foundations',
    shortTitle: 'Foundations',
    objective: 'Understand the landscape of modern LLM applications and how LLM systems engineering differs from traditional ML model training.',
    description: 'Bridge your background in algorithms, C/C++, Python, and classical Machine Learning into the paradigm of pretrained generative models, tokenization, context windows, and vector representations.',
    milestone: 'Articulate the architectural boundary between model weights (parametric knowledge), inference runtime (context window), and external systems.',
    keyDistinctions: [
      'Training an ML model optimizes weights θ on a fixed task dataset; building an LLM application orchestrates context, tools, and retrieval around frozen foundation weights.',
      'Generation models map token sequences to probability distributions over next tokens; embedding models map text into dense fixed-dimensional metric spaces.'
    ],
    topics: [
      {
        id: 'p00-ml-vs-genai',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 1,
        title: 'Traditional Machine Learning vs Generative AI',
        subtitle: 'Shifting from task-specific weight optimization to context-driven systems engineering',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: [],
        technologies: ['PyTorch', 'Transformer Architecture', 'Foundation Models'],
        whatIsIt: [
          'In classical Machine Learning—which you already know—you define a specific prediction task (such as binary classification or regression), curate a labeled dataset, select a model architecture (like XGBoost or a task-specific neural network), and run gradient descent to optimize parameters θ for that single objective.',
          'Generative AI and LLM Application Engineering invert this workflow. Instead of training a separate model from scratch for every task, you start with a massive pre-trained Foundation Model whose weights are frozen. You adapt its behavior at runtime through input conditioning (prompts), external data injection (RAG), and deterministic tool execution.'
        ],
        whyItExists: [
          'Training dedicated supervised models for every enterprise task requires prohibitive amounts of task-specific labeled data, GPU training clusters, and long iteration cycles. Furthermore, narrow models cannot generalize across multi-step reasoning or open-ended natural language interfaces.',
          'Pre-trained foundation models amortize the learning of syntax, world semantics, and code reasoning into a single self-supervised pre-training phase, allowing application engineers to build complex systems via runtime context orchestration rather than weight updates.'
        ],
        howItWorks: {
          explanation: [
            'Traditional ML learns a direct mapping f_θ(x) → y where x is a structured feature vector and y is a discrete label or scalar. The engineering bottleneck is feature engineering and dataset labeling.',
            'LLM Systems Engineering treats the model as a conditional probability engine P(y_t | y_<t, C, x), where C is the dynamically assembled context (system instructions, retrieved documents, tool outputs). Your primary job shifts from gradient optimization to deterministic data pipelines, context assembly, latency budgets, and output verification.'
          ],
          codeOrFormula: `// Classical Supervised ML
Model Weights θ = argmin_θ Σ Loss(f_θ(x_i), y_i)
Inference: y_pred = f_θ(x_new)

// LLM Systems Engineering (Frozen Weights θ*)
Context C = Assemble(SystemPrompt, RetrievedDocs(x), ToolOutputs, Memory)
Inference: Response Y ~ P_θ*(Y | C, x)`
        },
        practicalRelevance: {
          summary: 'Determines whether an engineering problem should be solved via classical tabular ML, runtime context engineering (RAG), or weight fine-tuning.',
          examples: [
            'Using XGBoost for sub-millisecond credit card fraud scoring vs. using an LLM agent to synthesize an investigation report from 15 policy PDFs and transaction logs.',
            'Replacing fragile regex/NER pipelines with schema-constrained LLM structured extraction.'
          ]
        },
        whatToLearn: [
          'Distinguish between pre-training, instruction fine-tuning (SFT/RLHF), and runtime inference conditioning.',
          'Understand why non-determinism, unbounded input spaces, and high inference latency make LLM engineering fundamentally different from traditional ML deployment.',
          'Know when to keep using classical ML instead of forcing an LLM onto a tabular or low-latency numerical task.'
        ],
        resources: [
          {
            id: 'res-p00-1a',
            title: 'Google AI Studio — Gemini API Get Started Guide',
            url: 'https://ai.google.dev/gemini-api/docs/get-started',
            type: 'Official Documentation',
            whyStudy: 'Introduces the modern foundation model API paradigm and runtime interaction patterns.',
            priority: 'Essential'
          },
          {
            id: 'res-p00-1b',
            title: 'Anthropic — Building Effective Agents (Workflow vs Model Roles)',
            url: 'https://www.anthropic.com/research/building-effective-agents',
            type: 'Architecture Guide',
            whyStudy: 'Explains how production engineering wraps deterministic software patterns around probabilistic generative models.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-what-is-llm', 'p00-llm-application', 'p03-what-is-rag']
      },
      {
        id: 'p00-what-is-llm',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 2,
        title: 'What is an LLM?',
        subtitle: 'Autoregressive sequence modeling over discrete token vocabularies',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-ml-vs-genai'],
        technologies: ['Transformers', 'Self-Attention', 'Autoregressive Decoding'],
        whatIsIt: [
          'A Large Language Model (LLM) is an autoregressive neural network—almost universally based on the decoder-only Transformer architecture—trained on trillions of tokens of text and code to estimate the conditional probability distribution of the next token given all preceding tokens.',
          'From a computer science perspective, an LLM is not a knowledge database or a symbolic logic engine. It is a continuous statistical function that takes a sequence of integer token IDs [t_1, t_2, ..., t_n] and outputs a logit vector of size |V| (where |V| is the vocabulary size, typically 32,000 to 256,000).'
        ],
        whyItExists: [
          'Earlier sequence models (RNNs, LSTMs) suffered from sequential computation bottlenecks during training and vanishing gradients over long sequences, compressing arbitrary history into a single fixed-width hidden state vector.',
          'The Transformer architecture (Vaswani et al., 2017) replaced recurrence with multi-head self-attention, enabling parallel computation across the entire sequence during training and direct O(1) path length between any two tokens in the sequence.'
        ],
        howItWorks: {
          explanation: [
            'During pre-training, the model minimizes cross-entropy loss on next-token prediction across massive corpora. To accurately predict the next token in complex code, math, and technical prose, the network weights implicitly compress syntax rules, factual associations, and reasoning heuristics.',
            'Post-training aligns this raw sequence predictor into an instruction-following assistant using Supervised Fine-Tuning (SFT) on (prompt, response) pairs and preference optimization (RLHF / DPO).'
          ],
          codeOrFormula: `P(t_1, t_2, ..., t_T) = Π_{i=1..T} P(t_i | t_1, t_2, ..., t_{i-1}; θ)
Attention(Q, K, V) = softmax((Q · K^T) / sqrt(d_k) + Mask) · V`
        },
        practicalRelevance: {
          summary: 'Understanding that an LLM is a next-token probability estimator explains why hallucinations occur and why RAG is required.',
          examples: [
            'Because an LLM samples plausible continuations rather than querying a relational table, asking it for a specific customer invoice ID without providing the invoice in the prompt will yield a statistically plausible—but fabricated—string.'
          ]
        },
        whatToLearn: [
          'Understand the causal self-attention mechanism and why decoder-only models use a causal lower-triangular mask.',
          'Understand the difference between a base pre-trained model and an instruction-tuned chat model.',
          'Explain why LLMs do not have built-in factual truth verification.'
        ],
        resources: [
          {
            id: 'res-p00-2a',
            title: 'Attention Is All You Need (Vaswani et al., 2017)',
            url: 'https://arxiv.org/abs/1706.03762',
            type: 'Research Paper',
            whyStudy: 'The foundational paper introducing the Transformer architecture and scaled dot-product attention.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-llm-inference', 'p00-tokens-tokenization', 'p03-parametric-vs-external']
      },
      {
        id: 'p00-llm-inference',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 3,
        title: 'How LLM Inference Works at a High Level',
        subtitle: 'Prefill vs Decode phases, KV Caching, and memory-bandwidth bottlenecks',
        difficulty: 'Foundational',
        estimatedEffort: '1 hour',
        prerequisites: ['p00-what-is-llm'],
        technologies: ['KV Cache', 'Prefill & Decode', 'Logits & Sampling'],
        whatIsIt: [
          'LLM inference is the runtime execution process that transforms an input prompt into generated output tokens. Unlike a single forward pass in an image classifier, generating K output tokens requires K sequential forward passes through the network.',
          'At a systems level, LLM inference is divided into two distinct computational phases with completely different hardware bottlenecks: the Prefill phase (compute-bound) and the Decode phase (memory-bandwidth-bound).'
        ],
        whyItExists: [
          'Naively recomputing attention over all N+k tokens at every generation step k would cost O(N² · K) floating-point operations, making long-context generation intolerably slow.',
          'Understanding the Prefill/Decode split and the Key-Value (KV) Cache is essential for predicting latency (Time-To-First-Token vs Inter-Token Latency) and optimizing RAG prompt sizes.'
        ],
        howItWorks: {
          explanation: [
            '1. Prefill Phase: All N input prompt tokens are processed in parallel in a single matrix-matrix multiplication pass. This computes the initial Key and Value tensors for every layer and populates the KV Cache, producing the first output token (determining Time To First Token, or TTFT).',
            '2. Decode Phase: Tokens are generated one at a time. At step k, only the single newest token is passed into the model; its Query vector attends against the cached Key and Value vectors of all prior tokens. Because each step loads gigabytes of model weights and KV cache for just one token, decoding is bottlenecked by GPU VRAM bandwidth.'
          ],
          codeOrFormula: `Total Latency = TTFT (Prefill) + (Output_Tokens × TPOT (Time Per Output Token))
KV Cache Memory ≈ 2 × num_layers × num_kv_heads × head_dim × seq_len × bytes_per_param`
        },
        practicalRelevance: {
          summary: 'Directly dictates how you design RAG context sizes, streaming UIs, and prompt caching in production.',
          examples: [
            'Passing 20,000 tokens of retrieved RAG chunks increases Prefill (TTFT), while asking the LLM to write a 2,000-token essay increases Decode time by 10x.',
            'Structuring system prompts with a static prefix enables provider Context Caching (reusing the KV cache across requests).'
          ]
        },
        whatToLearn: [
          'Distinguish between Time To First Token (TTFT) and Time Per Output Token (TPOT / ITL).',
          'Explain what the KV Cache stores and why it grows linearly with context length.',
          'Understand why generating output tokens is significantly slower and more expensive per token than reading input tokens.'
        ],
        resources: [
          {
            id: 'res-p00-3a',
            title: 'Google Gemini API — Context Caching & Inference Guide',
            url: 'https://ai.google.dev/gemini-api/docs/caching',
            type: 'Official Documentation',
            whyStudy: 'Shows how KV cache reuse works in practice to reduce prefill latency and cost on large contexts.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-tokens-tokenization', 'p00-context-windows', 'p01-streaming']
      },
      {
        id: 'p00-tokens-tokenization',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 4,
        title: 'Tokens and Tokenization',
        subtitle: 'Byte-Pair Encoding (BPE) and subword representation',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-what-is-llm'],
        technologies: ['BPE', 'Tiktoken', 'SentencePiece'],
        whatIsIt: [
          'LLMs do not operate on raw ASCII/UTF-8 characters or whitespace-delimited words. Instead, a deterministic pre-processor called a Tokenizer converts raw strings into sequences of integer IDs called tokens.',
          'Modern tokenizers use subword algorithms such as Byte-Pair Encoding (BPE) or Unigram SentencePiece. Frequently occurring words ("function", "the") become single tokens, while rare words, UUIDs, or compound technical identifiers are split into multiple subword fragments.'
        ],
        whyItExists: [
          'Word-level vocabularies explode in size and fail completely on out-of-vocabulary (OOV) strings, typos, or source code identifiers. Character-level vocabularies have tiny lookup tables but produce sequences 4–5x longer, exhausting the quadratic O(N²) self-attention budget.',
          'Subword tokenization strikes an optimal information-theoretic balance: lossless encoding of arbitrary UTF-8 byte streams with compact sequence lengths.'
        ],
        howItWorks: {
          explanation: [
            'During tokenizer training, BPE starts with individual bytes (0–255) and iteratively merges the most frequent adjacent pair of tokens into a new vocabulary symbol until reaching target vocabulary size |V|.',
            'At runtime, an encoder maps text → uint32[] token IDs via greedy longest-match merges, and a decoder maps uint32[] → UTF-8 text.'
          ],
          codeOrFormula: `// Rule of thumb for English prose:
1 token ≈ 4 characters ≈ 0.75 words
// Code, JSON keys, and non-Latin scripts often consume 1.5x–3x more tokens per character.`
        },
        practicalRelevance: {
          summary: 'Token counts govern API billing, context window limits, chunking boundaries in RAG, and latency.',
          examples: [
            'Sizing RAG document chunks by token count (e.g., 512 tokens) rather than character length so chunks never overflow the embedding model limit.',
            'Understanding why dense JSON indentation or base64 strings rapidly burn through token budgets.'
          ]
        },
        whatToLearn: [
          'Understand how Byte-Pair Encoding (BPE) constructs a vocabulary and tokenizes unseen strings.',
          'Know how to count tokens programmatically before dispatching API calls.',
          'Understand why token boundaries affect chunking and numerical arithmetic in LLMs.'
        ],
        resources: [
          {
            id: 'res-p00-4a',
            title: 'Gemini API — Understand and Count Tokens',
            url: 'https://ai.google.dev/gemini-api/docs/tokens',
            type: 'Official Documentation',
            whyStudy: 'Official guide to token counting, pricing units, and multimodal token calculation.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-context-windows', 'p01-tokens-cost', 'p04-chunking-strategies']
      },
      {
        id: 'p00-context-windows',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 5,
        title: 'Context Windows',
        subtitle: 'The working memory boundary of stateless foundation models',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-llm-inference', 'p00-tokens-tokenization'],
        technologies: ['Positional Embeddings', 'RoPE', 'Attention Context'],
        whatIsIt: [
          'The context window is the maximum number of tokens (input prompt + conversation history + retrieved documents + tool outputs + generated response) that an LLM can process in a single inference call.',
          'In systems architecture terms, if model weights are analogous to compiled read-only program binaries on disk, the context window is the volatile L1/RAM working memory allocated for a single execution invocation.'
        ],
        whyItExists: [
          'Because LLM APIs are fundamentally stateless between requests, the model retains zero memory of prior calls. Everything the model needs to reason over for the current turn must fit inside the active context window.',
          'While modern models support large context windows (128K to 1M+ tokens), finite hardware memory, quadratic O(N²) attention compute during prefill, and attention dilution ("lost in the middle" phenomenon) impose strict practical limits.'
        ],
        howItWorks: {
          explanation: [
            'Every token position in the window is assigned a positional representation (such as Rotary Position Embeddings, RoPE) so the self-attention layers know relative token distances.',
            'As the context window fills with irrelevant or noisy text, the softmax denominator in self-attention sums over more keys, diluting attention weights on the truly relevant facts—degrading recall accuracy even when tokens technically fit within the limit.'
          ],
          codeOrFormula: `Available_Output_Tokens = Max_Context_Window - (System_Tokens + History_Tokens + Retrieved_RAG_Tokens + Tool_Schema_Tokens)`
        },
        practicalRelevance: {
          summary: 'Even with 1M-token context windows, stuffing an entire enterprise database into every prompt is prohibitively slow, expensive, and less accurate than selective RAG retrieval.',
          examples: [
            'Budgeting context window allocations across system instructions (1K), RAG chunks (4K), tool definitions (2K), and chat history (4K) to maintain sub-2-second latency.'
          ]
        },
        whatToLearn: [
          'Understand why stateless LLM APIs require resending relevant state in the context window.',
          'Understand the "Lost in the Middle" retrieval degradation phenomenon on bloated contexts.',
          'Explain why large context windows complement—rather than replace—RAG architectures.'
        ],
        resources: [
          {
            id: 'res-p00-5a',
            title: 'Lost in the Middle: How Language Models Use Long Contexts (Liu et al.)',
            url: 'https://arxiv.org/abs/2307.03172',
            type: 'Research Paper',
            whyStudy: 'Demonstrates empirically how LLM accuracy degrades when key facts are buried in the middle of long contexts.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-context-management', 'p03-why-prompting-insufficient', 'p09-context-engineering']
      },
      {
        id: 'p00-prompt-engineering',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 6,
        title: 'Prompt Engineering Fundamentals',
        subtitle: 'Conditioning probability distributions with clear instructions, constraints, and few-shot exemplars',
        difficulty: 'Foundational',
        estimatedEffort: '1 hour',
        prerequisites: ['p00-what-is-llm', 'p00-context-windows'],
        technologies: ['Zero-Shot', 'Few-Shot', 'Delimiters', 'System Instructions'],
        whatIsIt: [
          'Prompt engineering is the discipline of structuring natural language instructions, input data delimiters, output constraints, and few-shot input/output examples to reliably steer an LLM toward a desired distribution of outputs.',
          'For a software engineer, a prompt is not "chatting with an AI"—it is a declarative specification and conditioning prefix that constrains the model’s autoregressive generation space.'
        ],
        whyItExists: [
          'An unconstrained prompt ("Summarize this") leaves thousands of valid interpretations open (length, tone, format, audience, fidelity to source). Ambiguous prompts lead to high variance and brittle downstream parsing.',
          'Rigorous prompt architecture eliminates ambiguity using explicit structural boundaries (XML tags or Markdown headers), explicit negative constraints, and few-shot demonstrations.'
        ],
        howItWorks: {
          explanation: [
            'In-Context Learning (ICL): When you provide 2–5 concrete (Input → Output) examples inside the prompt (few-shot prompting), the attention heads lock onto the structural format and decision criteria without updating any weights.',
            'Clear separation of instructions from untrusted data using structural tags (e.g., <context>...</context> vs <question>...</question>) prevents the model from confusing data with instructions.'
          ],
          codeOrFormula: `<system_instructions>
You are a precise technical synthesis engine. Answer ONLY using facts inside <retrieved_context>.
If the answer is not contained in <retrieved_context>, output exactly: "INSUFFICIENT_CONTEXT".
</system_instructions>
<retrieved_context>
[Doc 1]: Qdrant uses HNSW graphs for approximate nearest neighbor search.
</retrieved_context>
<user_query>What index structure does Qdrant use?</user_query>`
        },
        practicalRelevance: {
          summary: 'The final step of every RAG pipeline and every agent decision node relies on a well-engineered prompt template.',
          examples: [
            'Using XML delimiters in RAG context augmentation to force strict grounding and inline citation markers [1], [2].',
            'Providing 3 few-shot classification examples to stabilize edge-case routing in an agent.'
          ]
        },
        whatToLearn: [
          'Structure prompts with clear separation of role, task instructions, reference context, constraints, and output format.',
          'Apply zero-shot vs few-shot in-context learning appropriately.',
          'Use explicit grounding instructions to suppress hallucination when context is incomplete.'
        ],
        resources: [
          {
            id: 'res-p00-6a',
            title: 'Google Gemini API — Prompt Design Strategies',
            url: 'https://ai.google.dev/gemini-api/docs/prompting-strategies',
            type: 'Official Documentation',
            whyStudy: 'Comprehensive engineering guide covering zero-shot, few-shot, prefixes, and structural constraints.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-prompt-templates', 'p03-context-augmentation', 'p11-prompt-injection']
      },
      {
        id: 'p00-model-apis',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 7,
        title: 'Model APIs and Inference',
        subtitle: 'Hosted foundation model endpoints vs self-hosted inference servers',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-llm-inference'],
        technologies: ['REST / gRPC', 'vLLM', 'Gemini API', 'OpenAI API'],
        whatIsIt: [
          'In production applications, your Python backend rarely loads multi-gigabyte LLM weights directly into local process memory. Instead, your application communicates over HTTP/gRPC with a dedicated Model Inference API—either a managed cloud provider (Google Gemini, OpenAI, Anthropic) or a self-hosted inference server (vLLM, TGI).',
          'This decoupling separates your stateless application logic (FastAPI, ingestion, orchestration) from GPU-intensive batched tensor execution.'
        ],
        whyItExists: [
          'Serving LLMs efficiently requires specialized systems techniques like Continuous Batching, PagedAttention (managing GPU KV cache memory like OS virtual memory pages), tensor parallelism across multiple GPUs, and quantization (FP8/INT4).',
          'Model APIs abstract this GPU scheduling complexity behind a clean request/response interface.'
        ],
        howItWorks: {
          explanation: [
            'Your application sends a serialized JSON payload containing the model identifier, message array, generation hyperparameters, and optional tool schemas over HTTPS.',
            'The inference engine schedules the request into a continuous batch on GPU clusters, streams back generated token chunks via Server-Sent Events (SSE) or returns a complete response object along with token usage telemetry.'
          ]
        },
        practicalRelevance: {
          summary: 'Lets you architect provider-agnostic AI backends that can route between cloud APIs and self-hosted open-weights models.',
          examples: [
            'Calling Gemini 2.5 Flash for low-latency query rewriting while routing complex multi-step synthesis to a reasoning model.'
          ]
        },
        whatToLearn: [
          'Understand the client-server architecture separating application backends from GPU inference runtimes.',
          'Compare managed cloud APIs vs self-hosted open-weight inference engines (vLLM) across latency, cost, and data privacy.'
        ],
        resources: [
          {
            id: 'res-p00-7a',
            title: 'Gemini API Quickstart & SDK Overview',
            url: 'https://ai.google.dev/gemini-api/docs/get-started',
            type: 'Official Documentation',
            whyStudy: 'Demonstrates standard SDK initialization and model invocation over HTTPS.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-working-with-llm-apis', 'p01-model-selection']
      },
      {
        id: 'p00-embeddings-intro',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 8,
        title: 'Embeddings: What They Are and Why They Matter',
        subtitle: 'Mapping discrete text into continuous high-dimensional semantic vector spaces',
        difficulty: 'Foundational',
        estimatedEffort: '1 hour',
        prerequisites: ['p00-what-is-llm'],
        technologies: ['Vector Embeddings', 'Metric Spaces', 'Contrastive Learning'],
        whatIsIt: [
          'An embedding is a dense vector of floating-point numbers—for example, an array `float32[768]` or `float32[1536]`—that represents the semantic meaning of a piece of text as a coordinate point in a high-dimensional geometric space.',
          'Unlike a hash function (where changing a single character produces an unrelated output), an embedding model is trained via contrastive learning so that texts with similar meanings map to nearby points in vector space, even if they share zero exact keywords.'
        ],
        whyItExists: [
          'Computers can easily compare exact strings (`str1 == str2`) or keyword overlaps, but classical string matching fails when a user asks "How do I reset my credentials?" and the documentation says "Steps to recover a forgotten password."',
          'Embeddings transform semantic similarity into geometric distance computation (dot product or cosine similarity), enabling mathematical search over meaning.'
        ],
        howItWorks: {
          explanation: [
            'An embedding model passes the input text through a bidirectional Transformer encoder and pools the final hidden states into a single normalized fixed-width vector v ∈ ℝ^d.',
            'During contrastive training on millions of (query, positive_passage, negative_passage) triplets, the model pulls semantically related pairs closer together on the unit hypersphere and pushes unrelated pairs apart.'
          ],
          codeOrFormula: `embed("How to reset credentials")   → [0.021, -0.044, 0.118, ..., 0.009] ∈ ℝ^768
embed("Recover forgotten password") → [0.019, -0.041, 0.122, ..., 0.011] ∈ ℝ^768
CosineSimilarity(u, v) = (u · v) / (||u|| ||v||) ≈ 0.91 (High semantic match)`
        },
        practicalRelevance: {
          summary: 'Embeddings are the mathematical backbone of semantic search, RAG retrieval, clustering, and semantic caching.',
          examples: [
            'Encoding 50,000 technical manual paragraphs into 768-dimensional vectors so any natural language bug report can retrieve the top-5 most relevant troubleshooting sections in 8 milliseconds.'
          ]
        },
        whatToLearn: [
          'Explain what a dense vector embedding represents geometrically.',
          'Understand why embeddings preserve semantic similarity across paraphrases and synonyms.',
          'Understand why vectors from two different embedding models occupy incompatible vector spaces and cannot be compared.'
        ],
        resources: [
          {
            id: 'res-p00-8a',
            title: 'Google Gemini API — Embeddings Guide',
            url: 'https://ai.google.dev/gemini-api/docs/embeddings',
            type: 'Official Documentation',
            whyStudy: 'Explains how to generate text embeddings and use task-type optimizations for retrieval vs clustering.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-gen-vs-embed-models', 'p03-embedding-generation', 'p03-cosine-similarity']
      },
      {
        id: 'p00-gen-vs-embed-models',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 9,
        title: 'Generation Models vs Embedding Models',
        subtitle: 'Decoder-only autoregressive generators vs bidirectional dense encoders',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-what-is-llm', 'p00-embeddings-intro'],
        technologies: ['Encoder vs Decoder', 'gemini-embedding-001', 'gemini-2.5-flash'],
        whatIsIt: [
          'A frequent beginner misconception is confusing generation models (LLMs like Gemini 2.5 Flash/Pro, GPT-4o, Claude) with embedding models (`gemini-embedding-001`, `text-embedding-3`, `BAAI/bge-m3`). They are two distinct model families with different inputs, outputs, and roles.',
          'An Embedding Model takes a string of text and outputs a fixed-length numeric array (`float32[D]`). It cannot answer questions or generate prose. A Generation Model (LLM) takes a prompt string and generates a variable-length sequence of text tokens.'
        ],
        whyItExists: [
          'In a RAG system, you cannot ask a generative LLM to read 100,000 documents on every user query—that would take minutes and cost dollars per question.',
          'Instead, you use a fast, lightweight Embedding Model to index documents and retrieve the top 5 relevant passages via vector math, and then pass only those 5 passages into the Generation Model to synthesize the final answer.'
        ],
        howItWorks: {
          explanation: [
            'Embedding models typically use bidirectional attention (every token attends to both left and right context simultaneously) to produce a holistic summary vector of a passage.',
            'Generation models use causal unidirectional attention (each token only sees prior tokens) to generate new tokens sequentially.'
          ],
          codeOrFormula: `Embedding Model: f_embed(Text) → Vector ∈ ℝ^d   (Used for Indexing & Search)
Generation Model: f_gen(Prompt + Context) → Text (Used for Reasoning & Synthesis)`
        },
        practicalRelevance: {
          summary: 'Every RAG system pairs an Embedding Model (for the retrieval stage) with a Generation Model (for the synthesis stage).',
          examples: [
            'Swapping your generation LLM from Gemini Flash to Claude Sonnet requires zero re-indexing of your vector database, whereas changing your embedding model requires re-embedding and re-indexing every document in your collection.'
          ]
        },
        whatToLearn: [
          'Clearly contrast the input/output signatures and roles of embedding models vs generative LLMs.',
          'Explain why changing an embedding model invalidates existing vector indexes, while changing a generation model does not.'
        ],
        resources: [
          {
            id: 'res-p00-9a',
            title: 'Pinecone — Retrieval-Augmented Generation Overview',
            url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/',
            type: 'Architecture Guide',
            whyStudy: 'Clearly illustrates how embedding encoders and generative decoders collaborate inside a RAG architecture.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-embeddings-intro', 'p03-rag-architecture']
      },
      {
        id: 'p00-llm-application',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 10,
        title: 'What is an LLM Application?',
        subtitle: 'The compound AI system architecture around the foundation model call',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-model-apis', 'p00-gen-vs-embed-models'],
        technologies: ['Compound AI Systems', 'Pipelines', 'State & Storage'],
        whatIsIt: [
          'An LLM application is a compound software system where a foundation model is one component inside a larger deterministic engineering pipeline comprising data ingestion, vector & relational databases, retrieval routers, schema validators, tool executors, and safety guardrails.',
          'The LLM itself is roughly 10% of the codebase; the remaining 90% is data engineering, state management, context assembly, evaluation, and fault-tolerant systems code.'
        ],
        whyItExists: [
          'A raw LLM API call in isolation is stateless, cut off from private enterprise data, unable to take actions in external software, and prone to unverified free-text output.',
          'Wrapping the model in a compound system solves these limitations by supplying fresh retrieved context (RAG), validated structured outputs (Pydantic/JSON Schema), and controlled side-effects (tool calling).'
        ],
        howItWorks: {
          explanation: [
            '1. Ingress & Guardrails: Validate user input, check authentication/permissions, and sanitize against prompt injection.',
            '2. Context Assembly / Retrieval: Query vector and relational stores for facts relevant to the request and authorized for the user.',
            '3. Model Invocation & Tool Loop: Execute the LLM call with structured output constraints or tool definitions.',
            '4. Verification & Egress: Validate schema compliance, verify citations, log telemetry spans, and stream to the client.'
          ]
        },
        practicalRelevance: {
          summary: 'Frames your entire learning roadmap: you are learning to engineer compound AI systems, not just write prompts.',
          examples: [
            'An enterprise technical support copilot that authenticates a user, filters documentation by their product tier, runs hybrid retrieval, checks customer billing status via a SQL tool, and returns a cited answer.'
          ]
        },
        whatToLearn: [
          'Identify the core subsystems of a compound AI application (Ingestion, Retrieval, Orchestration, Tools, Verification, Observability).',
          'Understand how data flows between deterministic code and probabilistic LLM calls.'
        ],
        resources: [
          {
            id: 'res-p00-10a',
            title: 'Microsoft — Retrieval-Augmented Generation & Compound AI Concepts',
            url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation',
            type: 'Architecture Guide',
            whyStudy: 'Details how enterprise application layers orchestrate retrieval, grounding, and generation.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-production-grade-ai', 'p03-rag-architecture', 'p08-what-is-agent']
      },
      {
        id: 'p00-production-grade-ai',
        phaseId: 'phase-00',
        phaseNumber: '00',
        order: 11,
        title: 'What Makes an AI Application Production-Grade?',
        subtitle: 'Moving from a Jupyter notebook demo that works 70% of the time to a reliable system',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-llm-application'],
        technologies: ['Evaluation', 'Observability', 'Security', 'SLAs'],
        whatIsIt: [
          'Anyone can build a flashy 20-line RAG or agent demo in a Jupyter notebook in an afternoon. However, notebook prototypes typically fail silently on edge cases, leak unauthorized documents, hallucinate when retrieval misses, crash on API rate limits, and have zero quantitative measurement of quality.',
          'A production-grade AI application is defined by four pillars: Measurable Quality (automated evaluation datasets & metrics), Operational Reliability (retries, fallbacks, timeouts, bounded loops), Security & Governance (RBAC document permissions, prompt injection defense), and Full Observability (distributed traces, cost/latency monitoring).'
        ],
        whyItExists: [
          'In traditional software, changing a function either compiles and passes deterministic unit tests or fails immediately. In AI systems, changing a chunk size, prompt phrasing, or top-k parameter can silently improve 3 queries while breaking 40 others.',
          'Production engineering rigor transforms AI development from guesswork ("vibe-checking" 3 prompts manually) into systematic engineering.'
        ],
        howItWorks: {
          explanation: [
            'Every component in a production AI pipeline is instrumented with trace spans (recording exact retrieved chunk IDs, similarity scores, prompt versions, token counts, and P95 latency) and benchmarked against a golden evaluation dataset before deployment.'
          ]
        },
        practicalRelevance: {
          summary: 'Establishes the engineering standard for Phases 07, 11, 12, and your Phase 13 Capstone Project.',
          examples: [
            'Blocking a pull request in CI/CD because a prompt change dropped RAG faithfulness below 0.92 on the 100-question evaluation benchmark.'
          ]
        },
        whatToLearn: [
          'Understand the gap between a working prototype and a trustworthy production deployment.',
          'Explain the four pillars of production AI: Evaluation, Reliability, Security, and Observability.'
        ],
        resources: [
          {
            id: 'res-p00-11a',
            title: 'OWASP RAG Security Cheat Sheet',
            url: 'https://cheatsheetseries.owasp.org/cheatsheets/RAG_Security_Cheat_Sheet.html',
            type: 'Architecture Guide',
            whyStudy: 'Highlights real-world production failure modes and security invariants required beyond basic prototypes.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p07-why-eval-difficult', 'p11-prompt-injection', 'p12-production-arch']
      }
    ]
  },
  {
    id: 'phase-01',
    number: '01',
    title: 'LLM Application Engineering',
    shortTitle: 'LLM Engineering',
    objective: 'Learn to build deterministic, resilient software applications that communicate with LLMs via provider-independent patterns and the Gemini API.',
    description: 'Master the request/response lifecycle, message roles, generation hyperparameters, structured JSON schemas, tool calling, streaming, context management, and fault-tolerant API handling.',
    milestone: 'Build a resilient Python LLM client wrapper that enforces structured Pydantic outputs, handles tool calls, tracks token costs, and implements exponential backoff.',
    topics: [
      {
        id: 'p01-working-with-llm-apis',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 1,
        title: 'Working with LLM APIs',
        subtitle: 'SDK architecture, stateless HTTP contracts, and provider-independent abstractions',
        difficulty: 'Foundational',
        estimatedEffort: '1 hour',
        prerequisites: ['p00-model-apis'],
        technologies: ['google-genai SDK', 'Python', 'REST'],
        whatIsIt: [
          'Working with LLM APIs involves integrating foundation model endpoints into application code using official SDKs (such as the `google-genai` Python SDK for Gemini) or unified HTTP interfaces.',
          'While every vendor (Google, OpenAI, Anthropic) has minor surface syntax differences, all modern LLM APIs share the exact same underlying semantics: a stateless call accepting a model ID, system instructions, an ordered list of multi-turn content messages, generation configuration, and tool declarations.'
        ],
        whyItExists: [
          'Understanding the common structural abstraction across providers prevents vendor lock-in and allows you to wrap LLM calls behind clean domain interfaces in your codebase.'
        ],
        howItWorks: {
          explanation: [
            'You instantiate a thread-safe client object configured with credentials, construct a typed request payload, and invoke a generation method (`client.models.generate_content` in Google GenAI SDK).'
          ],
          codeOrFormula: `from google import genai
from google.genai import types

client = genai.Client()  # Reads GEMINI_API_KEY from environment
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain cosine similarity in two sentences.",
    config=types.GenerateContentConfig(
        system_instruction="You are a concise computer science instructor.",
        temperature=0.2,
    ),
)
print(response.text)`
        },
        practicalRelevance: {
          summary: 'Forms the foundational I/O layer for every RAG pipeline and agent loop you build.',
          examples: [
            'Creating an internal `LLMProvider` interface in Python so your RAG pipeline can switch between Gemini 2.5 Flash and local vLLM models via a single config variable.'
          ]
        },
        whatToLearn: [
          'Initialize and invoke the official Google GenAI SDK (`google-genai`).',
          'Understand the universal anatomy of an LLM API call across providers.'
        ],
        resources: [
          {
            id: 'res-p01-1a',
            title: 'Gemini API — Get Started with Python SDK',
            url: 'https://ai.google.dev/gemini-api/docs/get-started',
            type: 'Official Documentation',
            whyStudy: 'Official documentation for installing and calling the modern google-genai SDK.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-api-auth-env', 'p01-req-res-structures']
      },
      {
        id: 'p01-api-auth-env',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 2,
        title: 'API Authentication and Environment Variables',
        subtitle: 'Secure credential injection and zero-hardcoded-secrets hygiene',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p01-working-with-llm-apis'],
        technologies: ['dotenv', 'Environment Variables', 'API Keys'],
        whatIsIt: [
          'LLM API requests are authenticated via secret bearer tokens or API keys (such as `GEMINI_API_KEY`) attached to HTTP request headers. These keys carry direct financial billing authority and rate-limit quotas.',
          'Environment variable configuration decouples secret credentials from source code, loading them at process startup from the OS environment or local `.env` files ignored by Git.'
        ],
        whyItExists: [
          'Hardcoding an API key in a Python file and pushing it to GitHub results in automated credential scrapers compromising your key within seconds, leading to massive unauthorized token charges.'
        ],
        howItWorks: {
          explanation: [
            'During local development, a `.env` file stores `GEMINI_API_KEY=...`, which is listed in `.gitignore`. A library like `python-dotenv` or `pydantic-settings` loads these variables into `os.environ` at startup, and the SDK reads them automatically.'
          ],
          codeOrFormula: `# .env (NEVER commit to Git; commit .env.example instead)
GEMINI_API_KEY=your_api_key_here

# config.py
from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    gemini_api_key: str
    class Config:
        env_file = ".env"`
        },
        practicalRelevance: {
          summary: 'Non-negotiable security hygiene for every project from day one.',
          examples: [
            'Validating at FastAPI startup that all required API keys and vector DB URLs are present before accepting traffic.'
          ]
        },
        whatToLearn: [
          'Configure `.env`, `.env.example`, and `.gitignore` properly.',
          'Use typed configuration loaders (`pydantic-settings`) rather than scattered `os.getenv()` calls.'
        ],
        resources: [
          {
            id: 'res-p01-2a',
            title: 'Gemini API — API Key Setup & Environment Configuration',
            url: 'https://ai.google.dev/gemini-api/docs/api-key',
            type: 'Official Documentation',
            whyStudy: 'Shows how to provision keys in Google AI Studio and pass them securely via environment variables.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-env-config-secrets', 'p11-secrets-management']
      },
      {
        id: 'p01-req-res-structures',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 3,
        title: 'Request and Response Structures',
        subtitle: 'Inspecting candidates, content parts, finish reasons, and usage metadata',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p01-working-with-llm-apis'],
        technologies: ['JSON Payloads', 'FinishReason', 'UsageMetadata'],
        whatIsIt: [
          'An LLM API response is much richer than a plain string. The response envelope contains an array of `candidates` (or `choices`), where each candidate holds structured `content.parts` (text, function calls, or executable code), a `finish_reason`, safety ratings, and `usage_metadata` (input/output token counts).'
        ],
        whyItExists: [
          'Only accessing `response.text` blinds your application to critical runtime states: Did the model stop naturally (`STOP`), or was its JSON truncated mid-object because it hit `MAX_TOKENS`? Did it emit a `function_call` part instead of text?'
        ],
        howItWorks: {
          explanation: [
            'Always inspect `candidate.finish_reason` and `response.usage_metadata` in production wrappers before parsing output text.'
          ],
          codeOrFormula: `candidate = response.candidates[0]
print("Finish Reason:", candidate.finish_reason) # STOP | MAX_TOKENS | SAFETY
print("Prompt Tokens:", response.usage_metadata.prompt_token_count)
print("Output Tokens:", response.usage_metadata.candidates_token_count)`
        },
        practicalRelevance: {
          summary: 'Prevents silent JSON truncation bugs and enables per-request cost accounting.',
          examples: [
            'Raising a structured exception when `finish_reason == MAX_TOKENS` before attempting to parse truncated JSON.'
          ]
        },
        whatToLearn: [
          'Inspect the full response object tree including candidates, parts, finish reasons, and token usage counters.',
          'Handle non-STOP finish reasons deterministically.'
        ],
        resources: [
          {
            id: 'res-p01-3a',
            title: 'Gemini API — Text Generation & Response Anatomy',
            url: 'https://ai.google.dev/gemini-api/docs/text-generation',
            type: 'Official Documentation',
            whyStudy: 'Documents request parameters and response payload fields in detail.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-message-roles', 'p01-tokens-cost']
      },
      {
        id: 'p01-message-roles',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 4,
        title: 'System, User, and Assistant Messages',
        subtitle: 'Multi-turn conversation state and instruction privilege separation',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p01-req-res-structures'],
        technologies: ['Chat Roles', 'System Instructions', 'Multi-Turn State'],
        whatIsIt: [
          'Modern instruction-tuned LLMs are trained with special control tokens that partition the context window into distinct privilege and turn roles: `system` (global behavior rules and invariants), `user` (queries or untrusted input), `model`/`assistant` (prior model responses and tool requests), and `tool`/`function` (execution results returned from deterministic code).'
        ],
        whyItExists: [
          'Concatenating everything into a single raw text string makes it trivial for user input to override system instructions and prevents the model from distinguishing who said what in a multi-step conversation or agent loop.'
        ],
        howItWorks: {
          explanation: [
            'During instruction tuning, models learn to assign higher adherence priority to the `system` role and to maintain alternating `[user, model, tool, model]` turn structure.'
          ],
          codeOrFormula: `contents = [
    types.Content(role="user", parts=[types.Part.from_text(text="What is HNSW?")]),
    types.Content(role="model", parts=[types.Part.from_text(text="HNSW is a graph-based ANN index...")]),
    types.Content(role="user", parts=[types.Part.from_text(text="How does its M parameter affect memory?")])
]`
        },
        practicalRelevance: {
          summary: 'Essential for maintaining multi-turn chat state and executing multi-step agent tool-calling loops.',
          examples: [
            'Placing strict grounding and output rules in `system_instruction` while passing retrieved RAG chunks and the user query in the `user` message.'
          ]
        },
        whatToLearn: [
          'Use `system`, `user`, `model`/`assistant`, and `tool` roles accurately.',
          'Construct multi-turn conversation histories explicitly without relying on opaque SDK magic.'
        ],
        resources: [
          {
            id: 'res-p01-4a',
            title: 'Gemini API — System Instructions & Multi-Turn Chat',
            url: 'https://ai.google.dev/gemini-api/docs/text-generation',
            type: 'Official Documentation',
            whyStudy: 'Shows how to configure system instructions and manage multi-turn message arrays.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-prompt-templates', 'p01-context-management', 'p08-agent-loop']
      },
      {
        id: 'p01-prompt-templates',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 5,
        title: 'Prompt Templates',
        subtitle: 'Parameterized, version-controlled prompt construction',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-prompt-engineering', 'p01-message-roles'],
        technologies: ['Jinja2', 'Python f-strings', 'Prompt Versioning'],
        whatIsIt: [
          'A prompt template is a parameterized function or declarative template (using Python functions, typed dataclasses, or Jinja2) that dynamically binds runtime variables—such as `user_query`, `retrieved_chunks`, and `current_date`—into a structured prompt.'
        ],
        whyItExists: [
          'Scattering ad-hoc string concatenations across route handlers makes prompts impossible to test, version, audit, or evaluate systematically.'
        ],
        howItWorks: {
          explanation: [
            'Keep prompt templates in dedicated, versioned Python modules (`prompts/rag_synthesis.py`) with explicit type signatures for all required template variables.'
          ],
          codeOrFormula: `def build_rag_prompt(query: str, chunks: list[dict]) -> str:
    formatted_context = "\\n\\n".join(
        f"<document id='{c['id']}' source='{c['source']}'>\\n{c['text']}\\n</document>"
        for c in chunks
    )
    return f"<retrieved_documents>\\n{formatted_context}\\n</retrieved_documents>\\n\\n<question>{query}</question>"`
        },
        practicalRelevance: {
          summary: 'Clean native Python functions or Jinja2 templates are faster, easier to debug, and more transparent than heavy framework prompt wrappers.',
          examples: [
            'Versioning `RAG_SYNTHESIS_PROMPT_V2` alongside your evaluation dataset to prove V2 improved citation accuracy over V1.'
          ]
        },
        whatToLearn: [
          'Write clean, type-safe prompt template functions in pure Python without unnecessary framework bloat.',
          'Escape or delimit untrusted user variables cleanly inside templates.'
        ],
        resources: [
          {
            id: 'res-p01-5a',
            title: 'Google Gemini API — Prompting Strategies & Structuring',
            url: 'https://ai.google.dev/gemini-api/docs/prompting-strategies',
            type: 'Official Documentation',
            whyStudy: 'Provides battle-tested patterns for organizing variables and XML delimiters in templates.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-prompt-engineering', 'p03-context-augmentation']
      },
      {
        id: 'p01-temperature-params',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 6,
        title: 'Temperature and Generation Parameters',
        subtitle: 'Controlling softmax entropy via temperature, top_p, top_k, and max_output_tokens',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-what-is-llm'],
        technologies: ['Softmax Temperature', 'Nucleus Sampling (top_p)', 'Greedy Decoding'],
        whatIsIt: [
          'At every decoding step, the LLM outputs a vector of raw unnormalized scores called logits z ∈ ℝ^|V|. Generation parameters control how the sampler turns those logits into a probability distribution and picks the next token.'
        ],
        whyItExists: [
          'Creative brainstorming benefits from diverse token sampling, whereas structured JSON extraction, SQL generation, and grounded RAG synthesis require high determinism and minimal randomness.'
        ],
        howItWorks: {
          explanation: [
            'Temperature (T): Divides logits before softmax: P(t_i) = exp(z_i / T) / Σ exp(z_j / T). As T → 0, sampling approaches greedy argmax (the single highest-probability token always wins). For T > 1, the distribution flattens, increasing randomness.',
            'Top-P (Nucleus Sampling): Sorts tokens by probability and keeps only the smallest set of top tokens whose cumulative probability exceeds P (e.g., 0.90), truncating the long tail of nonsensical tokens.'
          ],
          codeOrFormula: `P(w_i) = exp(z_i / T) / Σ_j exp(z_j / T)
// For RAG synthesis, tool calling, and structured JSON extraction:
temperature = 0.0 to 0.2`
        },
        practicalRelevance: {
          summary: 'Setting temperature=0.0 (or low temperature) is standard engineering practice for factual RAG and deterministic routing.',
          examples: [
            'Using `temperature=0.0` for JSON schema extraction and SQL query generation to maximize reproducibility.'
          ]
        },
        whatToLearn: [
          'Understand the mathematical effect of temperature T on the softmax distribution.',
          'Know how `top_p`, `top_k`, and `max_output_tokens` constrain token decoding.',
          'Choose appropriate sampling settings for RAG vs creative tasks.'
        ],
        resources: [
          {
            id: 'res-p01-6a',
            title: 'Gemini API — Experiment with Parameter Values (Temperature, Top-P, Top-K)',
            url: 'https://ai.google.dev/gemini-api/docs/prompting-strategies',
            type: 'Official Documentation',
            whyStudy: 'Explains how decoding parameters influence output determinism and diversity.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-what-is-llm', 'p01-structured-outputs']
      },
      {
        id: 'p01-structured-outputs',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 7,
        title: 'Structured Outputs',
        subtitle: 'Constrained decoding for guaranteed machine-parseable responses',
        difficulty: 'Intermediate',
        estimatedEffort: '1 hour',
        prerequisites: ['p01-req-res-structures', 'p01-temperature-params'],
        technologies: ['Constrained Decoding', 'Pydantic', 'response_schema'],
        whatIsIt: [
          'Structured Outputs is an inference capability where the LLM is constrained at the token-sampling level (via finite-state machines or context-free grammars derived from your schema) to emit strictly valid JSON matching a declared schema.'
        ],
        whyItExists: [
          'Asking an LLM in a prompt to "please reply in JSON" fails regularly in production: the model wraps the JSON in markdown fences (` ```json `), adds conversational preamble, omits required fields, or hallucinates invalid syntax—crashing downstream application code.'
        ],
        howItWorks: {
          explanation: [
            'When you supply `response_mime_type="application/json"` and `response_schema=MyPydanticModel`, the inference engine compiles your schema into a grammar mask. At each decoding step, any token that would violate the JSON syntax or schema types has its logit masked to -∞.'
          ],
          codeOrFormula: `from pydantic import BaseModel
from google import genai
from google.genai import types

class GroundedAnswer(BaseModel):
    answer: str
    cited_doc_ids: list[str]
    confidence: str

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Based on Doc-12 (Qdrant uses HNSW), what index is used?",
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=GroundedAnswer,
    ),
)`
        },
        practicalRelevance: {
          summary: 'Transforms LLMs from conversational chatbots into typed software functions that return validated data structures.',
          examples: [
            'Forcing a RAG synthesizer to return `{ "answer": "...", "citations": ["doc_4", "doc_9"], "is_answerable": true }` so your frontend can render clickable citation chips reliably.'
          ]
        },
        whatToLearn: [
          'Use `response_schema` with Pydantic models in the Gemini API.',
          'Understand how constrained decoding guarantees schema validity under the hood.'
        ],
        resources: [
          {
            id: 'res-p01-7a',
            title: 'Google Gemini API — Structured Outputs Guide',
            url: 'https://ai.google.dev/gemini-api/docs/structured-output',
            type: 'Official Documentation',
            whyStudy: 'Complete reference on enforcing Pydantic and JSON schemas during Gemini generation.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-json-schemas', 'p02-pydantic-validation', 'p03-citations-attribution']
      },
      {
        id: 'p01-json-schemas',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 8,
        title: 'JSON Schemas',
        subtitle: 'The universal contract language for LLM structured outputs and tool definitions',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p01-structured-outputs'],
        technologies: ['JSON Schema', 'OpenAPI', 'Type Constraints'],
        whatIsIt: [
          'JSON Schema is a declarative vocabulary for annotating and validating the structure, types, enumerations, required properties, and field descriptions of JSON documents.',
          'Every LLM provider uses JSON Schema under the hood as the wire protocol for both Structured Outputs and Function/Tool Calling definitions.'
        ],
        whyItExists: [
          'Even when you define schemas using Python’s Pydantic library, Pydantic compiles your class via `.model_json_schema()` into a standard JSON Schema dictionary sent to the LLM API. Furthermore, the `description` fields inside a JSON Schema are read directly by the LLM to understand the semantic meaning of each parameter.'
        ],
        howItWorks: {
          explanation: [
            'By writing clear `Field(description="...")` annotations and using `Literal` / `Enum` types, you guide both the grammar constraint engine and the LLM’s semantic slot-filling.'
          ],
          codeOrFormula: `{
  "type": "object",
  "properties": {
    "query_intent": {
      "type": "string",
      "enum": ["factual_lookup", "comparison", "out_of_scope"],
      "description": "Classification of the user query for retrieval routing."
    }
  },
  "required": ["query_intent"]
}`
        },
        practicalRelevance: {
          summary: 'Essential for designing high-accuracy tool schemas, MCP servers, and query routers.',
          examples: [
            'Adding precise field descriptions and enum constraints to prevent an agent from passing invalid date formats to a database tool.'
          ]
        },
        whatToLearn: [
          'Read and author raw JSON Schemas (`type`, `properties`, `required`, `enum`, `description`).',
          'Use Pydantic `Field(description=...)` to enrich generated JSON Schemas for LLM comprehension.'
        ],
        resources: [
          {
            id: 'res-p01-8a',
            title: 'Gemini API — Structured Output JSON Schema Reference',
            url: 'https://ai.google.dev/gemini-api/docs/structured-output',
            type: 'Official Documentation',
            whyStudy: 'Lists supported JSON Schema keywords, nested objects, and best practices.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-structured-outputs', 'p01-function-tool-calling', 'p08-tool-schemas']
      },
      {
        id: 'p01-function-tool-calling',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 9,
        title: 'Function Calling and Tool Calling',
        subtitle: 'Bridging probabilistic reasoning with deterministic external code execution',
        difficulty: 'Intermediate',
        estimatedEffort: '1.5 hours',
        prerequisites: ['p01-json-schemas', 'p01-message-roles'],
        technologies: ['Function Calling', 'Tool Declarations', 'Gemini Tools'],
        whatIsIt: [
          'Function calling (or tool calling) allows you to pass a list of available function declarations (name, description, and JSON Schema of parameters) to an LLM. When the user’s query requires external data or computation, the LLM does not execute the function itself—instead, it outputs a structured `function_call` payload specifying which function to invoke and with what JSON arguments.',
          'Your application code intercepts that payload, executes the actual Python function (e.g., querying Qdrant or PostgreSQL), and passes the return value back to the LLM in a follow-up message so it can formulate the final answer.'
        ],
        whyItExists: [
          'LLMs cannot directly query live databases, run exact floating-point math, or interact with external APIs during a single forward pass. Function calling provides a standardized contract for the model to request deterministic computation from the host program.'
        ],
        howItWorks: {
          explanation: [
            'Step 1: Send user prompt + tool declarations to the model.',
            'Step 2: Model responds with `function_call: { name: "search_kb", args: {"query": "HNSW ef_construct"} }`.',
            'Step 3: Your Python code runs `search_kb("HNSW ef_construct")` and gets the result.',
            'Step 4: Append the model’s `function_call` turn and your `function_response` turn to `contents` and call the model again to generate the grounded final response.'
          ],
          codeOrFormula: `def search_knowledge_base(query: str, top_k: int = 5) -> list[str]:
    """Searches the technical knowledge base for relevant passages."""
    return vector_db.search(query, limit=top_k)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Find docs about HNSW recall tuning.",
    config=types.GenerateContentConfig(tools=[search_knowledge_base]),
)`
        },
        practicalRelevance: {
          summary: 'Function calling is the fundamental primitive powering both Agentic AI and Agentic RAG.',
          examples: [
            'Exposing a vector search tool and a SQL analytics tool so an assistant can dynamically fetch documentation or live system metrics.'
          ]
        },
        whatToLearn: [
          'Understand that the LLM only proposes a function call (name + arguments); your application code actually executes it.',
          'Implement the complete 4-step function-calling roundtrip using the Gemini API.'
        ],
        resources: [
          {
            id: 'res-p01-9a',
            title: 'Google Gemini API — Function Calling Documentation',
            url: 'https://ai.google.dev/gemini-api/docs/function-calling',
            type: 'Official Documentation',
            whyStudy: 'Official specification and code walkthroughs for single, parallel, and compositional function calling.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p08-agent-loop', 'p08-tool-execution', 'p10-retrieval-as-tool']
      },
      {
        id: 'p01-streaming',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 10,
        title: 'Streaming Responses',
        subtitle: 'Delivering incremental token chunks over Server-Sent Events (SSE) for sub-second perceived latency',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-llm-inference', 'p01-working-with-llm-apis'],
        technologies: ['Server-Sent Events (SSE)', 'Async Generators', 'TTFT'],
        whatIsIt: [
          'Streaming returns tokens incrementally to the client as soon as each token completes its decode step on the GPU, rather than buffering the entire completion for 5–15 seconds before sending an HTTP response.'
        ],
        whyItExists: [
          'While streaming does not reduce total generation compute time, it reduces perceived user latency from Total Generation Time (often 8+ seconds) down to Time-To-First-Token (TTFT, typically 300–600ms).'
        ],
        howItWorks: {
          explanation: [
            'The SDK opens a chunked HTTP/SSE connection (`generate_content_stream`) and yields partial `GenerateContentResponse` chunks as an iterator. Your backend forwards these chunks via FastAPI `StreamingResponse` to the browser.'
          ],
          codeOrFormula: `for chunk in client.models.generate_content_stream(
    model="gemini-2.5-flash",
    contents="Explain the BM25 scoring formula step by step."
):
    print(chunk.text, end="", flush=True)`
        },
        practicalRelevance: {
          summary: 'Mandatory for any interactive user-facing RAG assistant or chat interface.',
          examples: [
            'Streaming retrieved source citations immediately after the vector search finishes (<50ms), followed by the streamed token-by-token synthesis.'
          ]
        },
        whatToLearn: [
          'Consume streaming iterators synchronously and asynchronously.',
          'Handle citation metadata and partial JSON accumulation during streaming.'
        ],
        resources: [
          {
            id: 'res-p01-10a',
            title: 'Gemini API — Stream Text Responses',
            url: 'https://ai.google.dev/gemini-api/docs/text-generation',
            type: 'Official Documentation',
            whyStudy: 'Shows synchronous and asynchronous streaming calls with the Google GenAI SDK.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-llm-inference', 'p02-fastapi', 'p12-latency-optimization']
      },
      {
        id: 'p01-tokens-cost',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 11,
        title: 'Token Usage and Cost',
        subtitle: 'Unit economics of input, cached, and output tokens at scale',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-tokens-tokenization', 'p01-req-res-structures'],
        technologies: ['Token Accounting', 'Unit Economics', 'Context Caching'],
        whatIsIt: [
          'LLM APIs bill per 1,000,000 tokens processed, split into asymmetric rates: Input Tokens (cheaper, processed in parallel during prefill), Cached Input Tokens (discounted 75–90%), and Output Tokens (typically 3x to 8x more expensive per token due to sequential memory-bound decoding).'
        ],
        whyItExists: [
          'An unoptimized RAG pipeline or runaway agent loop that injects 40,000 tokens of context across 10 tool iterations will process 400,000 tokens for a single user click—turning a $0.001 query into a $0.50 query that destroys production margins.'
        ],
        howItWorks: {
          explanation: [
            'Track `usage_metadata.prompt_token_count` and `candidates_token_count` on every LLM invocation and compute exact cost per request.'
          ],
          codeOrFormula: `Cost_Per_Request = (Input_Tokens / 1e6) * Price_In + (Output_Tokens / 1e6) * Price_Out
// Agent Loop Multiplier:
// In a K-step agent loop, history accumulates every turn: Total_Input ≈ Σ_{i=1..K} (Base_Context + i * Step_Tokens)`
        },
        practicalRelevance: {
          summary: 'Governs how many chunks you retrieve (`top_k`), how you compress context, and how you cap agent loop iterations.',
          examples: [
            'Reducing RAG `top_k` from 25 chunks to 5 reranked chunks cuts input token cost by 80% while simultaneously improving answer accuracy.'
          ]
        },
        whatToLearn: [
          'Calculate per-query and monthly run-rate costs for RAG and multi-step agent workloads.',
          'Understand why output tokens cost multiples of input tokens and how agent loops compound input tokens.'
        ],
        resources: [
          {
            id: 'res-p01-11a',
            title: 'Google Gemini API Pricing & Token Tiers',
            url: 'https://ai.google.dev/pricing',
            type: 'Official Documentation',
            whyStudy: 'Provides real-world input vs output token pricing ratios across Flash and Pro model tiers.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-tokens-tokenization', 'p05-context-compression', 'p12-cost-monitoring']
      },
      {
        id: 'p01-context-management',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 12,
        title: 'Context Management',
        subtitle: 'Sliding windows, token budgeting, and conversation summarization',
        difficulty: 'Intermediate',
        estimatedEffort: '1 hour',
        prerequisites: ['p00-context-windows', 'p01-tokens-cost'],
        technologies: ['Token Budgets', 'Sliding Window', 'Rolling Summary'],
        whatIsIt: [
          'Context management is the algorithmic management of what enters, stays in, and gets evicted from the LLM’s context window across multi-turn interactions and tool executions.'
        ],
        whyItExists: [
          'If you append every user message, retrieved RAG passage, and verbose tool output to an unbounded list, the conversation will quickly exceed token budgets, spike latency, and degrade retrieval focus.'
        ],
        howItWorks: {
          explanation: [
            '1. Ephemeral RAG Injection: Inject retrieved document chunks only into the current turn’s prompt; do not persist raw 5,000-token retrieved chunks in the permanent chat history array of subsequent turns.',
            '2. Sliding Window + Rolling Summary: Retain the last N verbatim turns while asynchronously compacting older turns into a concise structured state summary.'
          ]
        },
        practicalRelevance: {
          summary: 'Keeps latency and token cost flat O(1) across long 50-turn user sessions instead of growing O(N).',
          examples: [
            'Stripping old retrieved document chunks from historical turns while keeping the cited conclusions in conversation memory.'
          ]
        },
        whatToLearn: [
          'Implement token-aware sliding windows for conversation histories.',
          'Separate ephemeral per-turn retrieved context from persistent conversation state.'
        ],
        resources: [
          {
            id: 'res-p01-12a',
            title: 'Gemini API — Token Counting & Context Window Management',
            url: 'https://ai.google.dev/gemini-api/docs/tokens',
            type: 'Official Documentation',
            whyStudy: 'Shows how to use `count_tokens` prior to dispatching requests to enforce context budgets.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-context-windows', 'p08-short-term-memory', 'p09-context-engineering']
      },
      {
        id: 'p01-rate-limits',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 13,
        title: 'Rate Limits',
        subtitle: 'Managing RPM, TPM, and RPD quotas in concurrent workloads',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p01-tokens-cost'],
        technologies: ['HTTP 429', 'Token Bucket', 'Async Semaphores'],
        whatIsIt: [
          'LLM providers enforce multi-dimensional quotas to protect GPU cluster stability: Requests Per Minute (RPM), Tokens Per Minute (TPM), and Requests Per Day (RPD). Exceeding any dimension returns an `HTTP 429 Too Many Requests` error.'
        ],
        whyItExists: [
          'During batch document ingestion (embedding 10,000 document chunks) or parallel evaluation runs, firing unconstrained async requests will immediately trip TPM or RPM limits.'
        ],
        howItWorks: {
          explanation: [
            'Control client-side concurrency using `asyncio.Semaphore(max_concurrent)` combined with batched embedding calls (sending 50–100 texts per embedding API call instead of 100 separate HTTP requests).'
          ]
        },
        practicalRelevance: {
          summary: 'Critical when building Phase 04 batch ingestion pipelines and Phase 07 automated evaluation runners.',
          examples: [
            'Batching 100 chunks per `embed_content` call and throttling with an async token-bucket limiter during knowledge base indexing.'
          ]
        },
        whatToLearn: [
          'Distinguish between RPM (request rate) and TPM (token throughput) bottlenecks.',
          'Use batch endpoints and client-side semaphores to stay within quota ceilings.'
        ],
        resources: [
          {
            id: 'res-p01-13a',
            title: 'Google Gemini API — Rate Limits and Quotas',
            url: 'https://ai.google.dev/gemini-api/docs/rate-limits',
            type: 'Official Documentation',
            whyStudy: 'Details RPM, TPM, and RPD quota mechanics across tiers.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-error-handling-retries', 'p02-async-programming', 'p12-rate-limiting']
      },
      {
        id: 'p01-error-handling-retries',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 14,
        title: 'Error Handling and Retries',
        subtitle: 'Exponential backoff with jitter, transient vs fatal errors, and fallback routing',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p01-rate-limits'],
        technologies: ['Tenacity', 'Exponential Backoff', 'Jitter'],
        whatIsIt: [
          'Network calls to LLM APIs experience transient failures: `429 Too Many Requests`, `500 Internal Error`, `503 Service Unavailable / Overloaded`, and read timeouts. Resilient engineering distinguishes retryable transient faults from non-retryable client faults (`400 Bad Request`, `401 Unauthorized`).'
        ],
        whyItExists: [
          'Without automated retries with exponential backoff and random jitter, all concurrent workers retry at the exact same millisecond (a "thundering herd"), causing cascading failures.'
        ],
        howItWorks: {
          explanation: [
            'Wait time before retry k is computed as `min(max_wait, base * 2^k + uniform(0, jitter))`. Libraries like `tenacity` in Python declaratively wrap LLM calls to retry only on transient status codes.'
          ],
          codeOrFormula: `from tenacity import retry, wait_random_exponential, stop_after_attempt

@retry(wait=wait_random_exponential(min=1, max=30), stop=stop_after_attempt(4))
def generate_with_retry(prompt: str):
    return client.models.generate_content(model="gemini-2.5-flash", contents=prompt)`
        },
        practicalRelevance: {
          summary: 'Prevents multi-step RAG and agent workflows from crashing on the 4th step due to a momentary 503 spike.',
          examples: [
            'Wrapping Gemini API calls with 3 exponential backoff attempts followed by a graceful fallback or structured error state.'
          ]
        },
        whatToLearn: [
          'Classify HTTP and SDK exceptions into transient (retryable) vs fatal (non-retryable).',
          'Implement exponential backoff with full jitter.'
        ],
        resources: [
          {
            id: 'res-p01-14a',
            title: 'Gemini API — Troubleshooting & Error Codes Guide',
            url: 'https://ai.google.dev/gemini-api/docs/troubleshooting',
            type: 'Official Documentation',
            whyStudy: 'Lists all Gemini API HTTP error codes, root causes, and recommended recovery actions.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-rate-limits', 'p12-retry-strategies', 'p12-circuit-breakers']
      },
      {
        id: 'p01-model-selection',
        phaseId: 'phase-01',
        phaseNumber: '01',
        order: 15,
        title: 'Model Selection and Trade-Offs',
        subtitle: 'Balancing intelligence, latency, context window, and cost across pipeline stages',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p01-tokens-cost', 'p00-llm-inference'],
        technologies: ['Gemini 2.5 Flash', 'Gemini 2.5 Pro', 'Model Routing'],
        whatIsIt: [
          'Production AI systems rarely use a single massive LLM for every sub-task. Instead, engineers select models along the Pareto frontier of reasoning depth vs latency and cost.'
        ],
        whyItExists: [
          'Using a heavyweight frontier reasoning model for simple query rewriting or intent classification adds 3–5 seconds of latency and 15x cost with zero accuracy gain over a fast workhorse model like Gemini 2.5 Flash.'
        ],
        howItWorks: {
          explanation: [
            'Decompose your pipeline by cognitive complexity: use fast, low-latency models (e.g., Gemini 2.5 Flash) for query rewriting, metadata extraction, and straightforward RAG synthesis; reserve larger reasoning models (e.g., Gemini 2.5 Pro) for complex multi-document reconciliation, ambiguous planning, or offline evaluation judging.'
          ]
        },
        practicalRelevance: {
          summary: 'Tiered model routing is the single most effective lever for meeting sub-2-second production SLAs.',
          examples: [
            'Routing 85% of standard documentation lookups through Gemini 2.5 Flash while escalating multi-hop architectural comparisons to Gemini 2.5 Pro.'
          ]
        },
        whatToLearn: [
          'Evaluate models across four axes: Task Accuracy, TTFT/TPOT Latency, Cost per 1M tokens, and Context Window.',
          'Design multi-model pipelines that assign the right model tier to each pipeline stage.'
        ],
        resources: [
          {
            id: 'res-p01-15a',
            title: 'Google Gemini Models Overview & Capability Matrix',
            url: 'https://ai.google.dev/gemini-api/docs/models',
            type: 'Official Documentation',
            whyStudy: 'Compares Gemini model variants, context limits, throughput, and recommended use cases.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-tokens-cost', 'p09-model-tool-selection', 'p12-latency-optimization']
      }
    ]
  },
  {
    id: 'phase-02',
    number: '02',
    title: 'Python Backend and Production Foundations',
    shortTitle: 'Backend Foundations',
    objective: 'Learn the software engineering foundations required to turn AI prototypes into maintainable, typed, asynchronous, and containerized backend services.',
    description: 'Because you already know Python, C/C++, and algorithms, this phase skips basic syntax and focuses strictly on the production Python stack used in AI engineering: Pydantic, FastAPI, async I/O, PostgreSQL, Pytest, and Docker.',
    milestone: 'Build a containerized FastAPI service with async endpoints, Pydantic request/response validation, structured logging, and automated Pytest coverage.',
    topics: [
      {
        id: 'p02-python-project-arch',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 1,
        title: 'Python Project Architecture',
        subtitle: 'Structuring AI services with clean separation of ingestion, retrieval, domain logic, and API layers',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: [],
        technologies: ['Python', 'pyproject.toml', 'Modular Architecture'],
        whatIsIt: [
          'A maintainable AI application separates concerns into distinct packages: `api/` (HTTP routes and schemas), `core/` (config, logging, LLM clients), `ingestion/` (parsers, chunkers, embedders), `retrieval/` (vector DB adapters, hybrid search, rerankers), `agents/` (tools, state graphs), and `evals/` (benchmark datasets and metric runners).'
        ],
        whyItExists: [
          'AI projects that evolve inside monolithic Jupyter notebooks or a single 2,000-line script become untestable and impossible to deploy as both an API server and a background ingestion worker.'
        ],
        howItWorks: {
          explanation: [
            'Use a `src/` layout configured via a single `pyproject.toml` file, injecting dependencies (like the Vector DB client and LLM client) into service classes rather than instantiating global singletons at import time.'
          ],
          codeOrFormula: `src/
  app/
    api/          # FastAPI routers
    core/         # Settings, logging, telemetry
    ingestion/    # Loaders, chunkers, indexing pipeline
    retrieval/    # Qdrant client, BM25, RRF, reranker
    agents/       # Tool definitions & execution loop
  evals/          # Golden dataset & Ragas evaluation suite
  tests/          # Unit and integration tests`
        },
        practicalRelevance: {
          summary: 'Allows your offline ingestion CLI, your online FastAPI server, and your CI/CD evaluation suite to share the exact same retrieval and prompt modules.',
          examples: [
            'Running `pytest evals/` in CI using the exact same `RetrievalService` class that powers the production `/v1/query` endpoint.'
          ]
        },
        whatToLearn: [
          'Organize an AI codebase into decoupled domain layers.',
          'Apply Dependency Injection so external APIs (LLM, Vector DB) can be mocked in unit tests.'
        ],
        resources: [
          {
            id: 'res-p02-1a',
            title: 'FastAPI — Bigger Applications & Project Structure',
            url: 'https://fastapi.tiangolo.com/tutorial/bigger-applications/',
            type: 'Official Documentation',
            whyStudy: 'Shows standard modular package organization for production Python services.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-venv-deps', 'p02-fastapi']
      },
      {
        id: 'p02-venv-deps',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 2,
        title: 'Virtual Environments and Dependency Management',
        subtitle: 'Deterministic lockfiles and isolated Python runtimes',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p02-python-project-arch'],
        technologies: ['uv', 'venv', 'pyproject.toml'],
        whatIsIt: [
          'Virtual environments isolate a project’s Python interpreter and installed libraries from the host OS and other projects. Modern dependency managers (`uv`, `poetry`, or `pip-tools`) resolve transitive versions into a cryptographic lockfile (`uv.lock` or `requirements.lock`).'
        ],
        whyItExists: [
          'The Python AI ecosystem evolves rapidly. Unpinned dependencies (`pip install qdrant-client google-genai`) frequently break across machines or Docker builds when a transitive dependency like `pydantic` or `grpcio` updates.'
        ],
        howItWorks: {
          explanation: [
            'Declare direct dependencies with version bounds in `pyproject.toml` and commit the generated lockfile to Git so local dev, CI, and production Docker containers install identical byte-for-byte packages.'
          ]
        },
        practicalRelevance: {
          summary: 'Guarantees reproducible builds across development and production containers.',
          examples: [
            'Using `uv sync --frozen` inside a Dockerfile to install locked dependencies in under 3 seconds.'
          ]
        },
        whatToLearn: [
          'Create isolated environments and maintain deterministic dependency lockfiles.',
          'Separate runtime dependencies from development/test dependencies (`pytest`, `ruff`, `mypy`).'
        ],
        resources: [
          {
            id: 'res-p02-2a',
            title: 'Python Packaging User Guide — pyproject.toml Specification',
            url: 'https://packaging.python.org/en/latest/guides/writing-pyproject-toml/',
            type: 'Official Documentation',
            whyStudy: 'The official standard for declaring Python project metadata and dependencies.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-python-project-arch', 'p02-docker-containers']
      },
      {
        id: 'p02-type-hints',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 3,
        title: 'Type Hints',
        subtitle: 'Static type annotations in Python for self-documenting data pipelines and LLM schemas',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p02-python-project-arch'],
        technologies: ['typing', 'mypy', 'Pyright'],
        whatIsIt: [
          'Coming from C and C++, you are familiar with compile-time static typing. Python’s `typing` module adds explicit type signatures (`def retrieve(query: str, top_k: int = 5) -> list[DocumentChunk]:`) verified by static type checkers (`mypy` or `pyright`) and introspected at runtime by libraries like Pydantic, FastAPI, and the Gemini SDK.'
        ],
        whyItExists: [
          'In AI pipelines, data transforms through many representations (raw string → Document → Chunk → float32 vector → ScoredPoint → GroundedAnswer). Untyped dictionaries (`dict[str, Any]`) lead to runtime `KeyError` crashes deep inside multi-step agent loops.'
        ],
        howItWorks: {
          explanation: [
            'Beyond static verification, Python exposes type annotations at runtime via `__annotations__`. The Gemini SDK and FastAPI inspect your function’s type hints and docstring directly to auto-generate JSON Schemas for LLM tool calling!'
          ]
        },
        practicalRelevance: {
          summary: 'In modern AI engineering, Python type hints are not just comments—they drive runtime schema validation and LLM tool declaration generation.',
          examples: [
            'Passing a typed Python function directly to `GenerateContentConfig(tools=[my_typed_func])` so the SDK builds the tool JSON Schema automatically.'
          ]
        },
        whatToLearn: [
          'Write modern Python 3.11+ type annotations (`list[str]`, `dict[str, float]`, `Literal`, `TypedDict`, `Protocol`, generics).',
          'Understand how runtime introspection converts Python type hints into JSON Schemas.'
        ],
        resources: [
          {
            id: 'res-p02-3a',
            title: 'FastAPI — Python Types Intro',
            url: 'https://fastapi.tiangolo.com/python-types/',
            type: 'Official Documentation',
            whyStudy: 'Practical guide showing how Python type hints power modern validation and API frameworks.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-pydantic-validation', 'p01-function-tool-calling']
      },
      {
        id: 'p02-pydantic-validation',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 4,
        title: 'Pydantic and Data Validation',
        subtitle: 'Runtime boundary parsing, schema enforcement, and LLM output validation',
        difficulty: 'Foundational',
        estimatedEffort: '1 hour',
        prerequisites: ['p02-type-hints'],
        technologies: ['Pydantic v2', 'BaseModel', 'Field Validators'],
        whatIsIt: [
          'Pydantic is the standard data validation and parsing library in the Python AI ecosystem (written with a Rust validation core in v2). You define data structures as subclasses of `BaseModel` using standard Python type hints, and Pydantic validates and coerces untrusted JSON/dict payloads at runtime.'
        ],
        whyItExists: [
          'Python type hints by themselves are not enforced at runtime by the Python interpreter. When an external API, user request, or LLM returns JSON, Pydantic guarantees that every field conforms to your exact type, range, and custom invariant checks before your core logic touches it.'
        ],
        howItWorks: {
          explanation: [
            'Pydantic validates data on instantiation, raises detailed structured `ValidationError` lists when fields fail, and serializes/deserializes cleanly via `.model_validate_json()` and `.model_dump()`.'
          ],
          codeOrFormula: `from pydantic import BaseModel, Field

class DocumentChunk(BaseModel):
    chunk_id: str
    doc_id: str
    text: str = Field(min_length=1)
    token_count: int = Field(gt=0, le=2048)
    metadata: dict[str, str | int]`
        },
        practicalRelevance: {
          summary: 'Used everywhere in AI engineering: FastAPI request bodies, Gemini `response_schema`, agent tool arguments, and vector payload schemas.',
          examples: [
            'Feeding Pydantic’s `ValidationError` message back into an agent reflection step if a tool argument fails custom business validation.'
          ]
        },
        whatToLearn: [
          'Define nested `BaseModel` schemas with `Field` constraints and `@field_validator` methods.',
          'Convert between JSON strings, Python dicts, and JSON Schemas using Pydantic v2 APIs.'
        ],
        resources: [
          {
            id: 'res-p02-4a',
            title: 'Pydantic Official Documentation — Models & Fields',
            url: 'https://docs.pydantic.dev/latest/concepts/models/',
            type: 'Official Documentation',
            whyStudy: 'Authoritative reference on Pydantic v2 models, validators, and JSON Schema generation.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-structured-outputs', 'p02-request-validation']
      },
      {
        id: 'p02-http-rest-apis',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 5,
        title: 'HTTP and REST APIs',
        subtitle: 'Designing clean stateless endpoints, status semantics, and streaming transports for AI services',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p02-pydantic-validation'],
        technologies: ['HTTP/1.1 & HTTP/2', 'REST', 'SSE'],
        whatIsIt: [
          'Your AI system exposes its capabilities to web frontends, CLI tools, or other microservices over HTTP REST endpoints (e.g., `POST /v1/documents/ingest`, `POST /v1/rag/query`, `GET /v1/conversations/{id}`).'
        ],
        whyItExists: [
          'Well-designed HTTP APIs establish clear contracts for idempotency, authentication headers, pagination, error codes (`400`, `401`, `403`, `422`, `429`, `503`), and streaming content types (`text/event-stream`).'
        ],
        howItWorks: {
          explanation: [
            'Synchronous fast lookups return `application/json`, long-running document ingestion jobs return `202 Accepted` with a job status ID, and token-streamed RAG responses use `text/event-stream` (Server-Sent Events).'
          ]
        },
        practicalRelevance: {
          summary: 'Prevents HTTP timeouts on slow document ingestion jobs and ensures clean client-server integration.',
          examples: [
            'Designing `POST /v1/query` to accept a query + filter criteria and stream SSE events for `retrieval_complete`, `token_delta`, and `citations_final`.'
          ]
        },
        whatToLearn: [
          'Choose appropriate HTTP verbs, status codes, and response media types for AI workloads.',
          'Understand when to use synchronous JSON vs SSE streaming vs asynchronous background job queues.'
        ],
        resources: [
          {
            id: 'res-p02-5a',
            title: 'FastAPI Tutorial — First Steps & HTTP Operations',
            url: 'https://fastapi.tiangolo.com/tutorial/first-steps/',
            type: 'Official Documentation',
            whyStudy: 'Covers HTTP path operations, status codes, and automatic OpenAPI specification generation.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-fastapi', 'p01-streaming']
      },
      {
        id: 'p02-fastapi',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 6,
        title: 'FastAPI',
        subtitle: 'High-performance ASGI web framework built on Starlette and Pydantic',
        difficulty: 'Foundational',
        estimatedEffort: '1 hour',
        prerequisites: ['p02-pydantic-validation', 'p02-http-rest-apis'],
        technologies: ['FastAPI', 'Uvicorn', 'ASGI', 'OpenAPI'],
        whatIsIt: [
          'FastAPI is the industry-standard Python web framework for serving AI, RAG, and agentic backends. It combines native asynchronous I/O (ASGI), automatic Pydantic request/response validation, dependency injection, and auto-generated OpenAPI/Swagger documentation.'
        ],
        whyItExists: [
          'Older synchronous WSGI frameworks (like Flask or Django default workers) block an entire OS thread while waiting 3–10 seconds for an external LLM or vector database network call. FastAPI’s async ASGI architecture handles hundreds of concurrent waiting I/O requests on a single event loop.'
        ],
        howItWorks: {
          explanation: [
            'FastAPI inspects route handler type annotations to parse JSON bodies into Pydantic models, injects shared resources (like a Qdrant client pool) via `Depends()`, and serializes outputs.'
          ],
          codeOrFormula: `from fastapi import FastAPI, Depends
app = FastAPI(title="Production RAG Service")

@app.post("/v1/query", response_model=RAGResponse)
async def query_knowledge_base(
    req: RAGRequest,
    rag_service: RAGService = Depends(get_rag_service)
) -> RAGResponse:
    return await rag_service.answer(req.question, top_k=req.top_k)`
        },
        practicalRelevance: {
          summary: 'The primary server framework you will use to expose your RAG pipeline and Capstone Assistant.',
          examples: [
            'Using FastAPI lifespan context managers (`@asynccontextmanager`) to initialize and cleanly close Qdrant and PostgreSQL connection pools.'
          ]
        },
        whatToLearn: [
          'Build FastAPI routers with typed request/response models, lifespan hooks, and `Depends()` dependency injection.',
          'Implement `StreamingResponse` for real-time LLM token streaming.'
        ],
        resources: [
          {
            id: 'res-p02-6a',
            title: 'FastAPI Official Tutorial — User Guide',
            url: 'https://fastapi.tiangolo.com/tutorial/',
            type: 'Official Documentation',
            whyStudy: 'Comprehensive, practical tutorial created by the author of FastAPI.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-async-programming', 'p02-request-validation', 'p12-api-architecture']
      },
      {
        id: 'p02-async-programming',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 7,
        title: 'Asynchronous Programming',
        subtitle: 'Event loops and non-blocking I/O concurrency for network-bound AI pipelines',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p02-fastapi'],
        technologies: ['Event Loop', 'Non-blocking I/O', 'Concurrency vs Parallelism'],
        whatIsIt: [
          'AI applications are overwhelmingly network-I/O bound: waiting on embedding APIs, waiting on Qdrant vector searches, waiting on PostgreSQL queries, and waiting on LLM generation. Asynchronous programming uses a single-threaded cooperative event loop to multiplex thousands of concurrent waiting network sockets without OS thread-switching overhead.'
        ],
        whyItExists: [
          'If a multi-query RAG pipeline rewrites a query into 4 sub-queries, executing 4 embedding calls and 4 vector searches sequentially takes `4 × (T_embed + T_search)`. Executing them concurrently via async I/O takes `max(T_1, T_2, T_3, T_4)`—a 3.5x latency speedup.'
        ],
        howItWorks: {
          explanation: [
            'When a coroutine hits an non-blocking network socket read, it yields control back to the event loop, allowing other ready coroutines to execute until the kernel signals data arrival.'
          ]
        },
        practicalRelevance: {
          summary: 'Essential for parallelizing multi-query retrieval, hybrid search (dense + sparse in parallel), and parallel agent tool execution.',
          examples: [
            'Running dense embedding search and sparse BM25 search concurrently so hybrid retrieval adds zero sequential wall-clock penalty.'
          ]
        },
        whatToLearn: [
          'Distinguish between I/O-bound concurrency (async event loop) and CPU-bound parallelism (multiprocessing/threadpools).',
          'Know why calling a blocking synchronous library (like `requests.get` or heavy CPU PDF parsing) inside an async loop freezes the entire FastAPI server.'
        ],
        resources: [
          {
            id: 'res-p02-7a',
            title: 'FastAPI — Concurrency and async / await',
            url: 'https://fastapi.tiangolo.com/async/',
            type: 'Official Documentation',
            whyStudy: 'Explains event loops, coroutines, and I/O vs CPU workloads in Python web services.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-async-await', 'p09-parallel-execution', 'p12-concurrency']
      },
      {
        id: 'p02-async-await',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 8,
        title: 'Async/Await in Practice',
        subtitle: 'Orchestrating concurrent coroutines with asyncio.gather, TaskGroup, and timeouts',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p02-async-programming'],
        technologies: ['asyncio', 'TaskGroup', 'httpx', 'AsyncQdrantClient'],
        whatIsIt: [
          'Python’s `async def` and `await` syntax defines native coroutines, while `asyncio.gather()` and `asyncio.TaskGroup()` fan out multiple independent coroutines concurrently and await their combined results.'
        ],
        whyItExists: [
          'Merely writing `async def` does not make operations concurrent if you `await` each call one after another in a loop. You must schedule tasks concurrently on the event loop.'
        ],
        howItWorks: {
          explanation: [
            'Use async-native clients (`client.aio.models.generate_content` in Google GenAI SDK, `AsyncQdrantClient`, `httpx.AsyncClient`) and coordinate fan-out calls with `asyncio.gather` or `TaskGroup`.'
          ],
          codeOrFormula: `import asyncio

async def parallel_hybrid_retrieve(query: str):
    # Fan out dense and lexical retrieval simultaneously
    dense_task = retrieve_dense(query)
    sparse_task = retrieve_bm25(query)
    dense_hits, sparse_hits = await asyncio.gather(dense_task, sparse_task)
    return reciprocal_rank_fusion(dense_hits, sparse_hits)`
        },
        practicalRelevance: {
          summary: 'Used directly in Hybrid Retrieval (Phase 05), Automated Evaluation Runners (Phase 07), and Parallel Tool Execution (Phase 09).',
          examples: [
            'Using `asyncio.to_thread()` to offload synchronous CPU-bound PDF parsing so the async event loop remains responsive.'
          ]
        },
        whatToLearn: [
          'Use `asyncio.gather`, `asyncio.TaskGroup`, and `asyncio.wait_for` (timeouts).',
          'Use async SDK clients (`client.aio` in `google-genai`, `AsyncQdrantClient`).'
        ],
        resources: [
          {
            id: 'res-p02-8a',
            title: 'Python Official Docs — asyncio Coroutines and Tasks',
            url: 'https://docs.python.org/3/library/asyncio-task.html',
            type: 'Official Documentation',
            whyStudy: 'Authoritative reference for `TaskGroup`, `gather`, `wait_for`, and `to_thread`.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-async-programming', 'p05-hybrid-retrieval']
      },
      {
        id: 'p02-request-validation',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 9,
        title: 'Request Validation',
        subtitle: 'Enforcing input length bounds, filter whitelists, and HTTP 422 error contracts',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p02-pydantic-validation', 'p02-fastapi'],
        technologies: ['FastAPI Validation', 'HTTP 422', 'Input Guardrails'],
        whatIsIt: [
          'Request validation enforces strict structural and domain constraints on incoming API payloads before any downstream database or LLM token expenditure occurs.'
        ],
        whyItExists: [
          'If an API endpoint accepts an unbounded `query: str` or `top_k: int`, a malformed client request can send a 5MB string or `top_k=100000`, exhausting memory and burning LLM token quota.'
        ],
        howItWorks: {
          explanation: [
            'Combine Pydantic field bounds (`max_length=2000`, `ge=1, le=20`) with custom model validators to reject out-of-bounds payloads immediately with an HTTP 422 response.'
          ]
        },
        practicalRelevance: {
          summary: 'Acts as the first deterministic defense layer protecting your LLM and vector database.',
          examples: [
            'Capping query string length to 1,500 characters and validating metadata filter keys against an allowed schema enum.'
          ]
        },
        whatToLearn: [
          'Apply strict length, numeric, and enum bounds on all AI API ingress schemas.',
          'Customize FastAPI validation exception handlers for clean client error messages.'
        ],
        resources: [
          {
            id: 'res-p02-9a',
            title: 'FastAPI — Query Parameters and String Validations',
            url: 'https://fastapi.tiangolo.com/tutorial/query-params-str-validations/',
            type: 'Official Documentation',
            whyStudy: 'Shows how to enforce declarative constraints on API inputs.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-pydantic-validation', 'p11-input-validation']
      },
      {
        id: 'p02-database-fundamentals',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 10,
        title: 'Database Fundamentals for AI Systems',
        subtitle: 'Why relational databases and vector databases complement each other',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p02-python-project-arch'],
        technologies: ['ACID Transactions', 'Relational vs Vector Storage'],
        whatIsIt: [
          'A production AI application does not store everything in a vector database. It uses a relational database (PostgreSQL) as the transactional system of record for users, document metadata, ingestion job states, conversation threads, agent checkpoints, and audit logs—paired with a vector index for semantic similarity search.'
        ],
        whyItExists: [
          'Vector databases optimize for high-dimensional approximate nearest neighbor (ANN) search, not multi-table ACID transactions, relational foreign keys, or complex financial/user state integrity.'
        ],
        howItWorks: {
          explanation: [
            'Store canonical document records, version numbers, ACL permissions, and chat state in PostgreSQL using shared deterministic UUIDs (`doc_id`, `chunk_id`) that cross-reference the vectors stored in Qdrant (or use PostgreSQL + `pgvector` when unified transactional guarantees are prioritized).'
          ]
        },
        practicalRelevance: {
          summary: 'Prevents the anti-pattern of trying to use a vector database as a primary user/session database.',
          examples: [
            'Recording document ingestion state (`PENDING → CHUNKING → EMBEDDED → ACTIVE`) in PostgreSQL so failed ingestion jobs can resume cleanly without orphaned vectors.'
          ]
        },
        whatToLearn: [
          'Understand the division of responsibility between relational ACID storage and vector ANN indexes.',
          'Design shared primary/foreign key identifiers across relational records and vector payloads.'
        ],
        resources: [
          {
            id: 'res-p02-10a',
            title: 'PostgreSQL Official Tutorial — Relational Fundamentals',
            url: 'https://www.postgresql.org/docs/current/tutorial.html',
            type: 'Official Documentation',
            whyStudy: 'Core reference on relational schemas, transactions, and indexing.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-sql-postgresql', 'p06-what-is-vectordb']
      },
      {
        id: 'p02-sql-postgresql',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 11,
        title: 'SQL and PostgreSQL Fundamentals',
        subtitle: 'Relational schemas, JSONB metadata, connection pooling, and SQLAlchemy/psycopg',
        difficulty: 'Foundational',
        estimatedEffort: '1 hour',
        prerequisites: ['p02-database-fundamentals'],
        technologies: ['PostgreSQL', 'SQL', 'JSONB', 'asyncpg / psycopg3'],
        whatIsIt: [
          'PostgreSQL is the most widely adopted open-source relational database in production AI systems because it combines rock-solid ACID relational tables with indexed `JSONB` columns (ideal for flexible tool call traces and document metadata), full-text search, and optional `pgvector` embeddings.'
        ],
        whyItExists: [
          'You need SQL proficiency both to persist application state (chat histories, agent checkpoints, ingestion ledgers) and to build Text-to-SQL / SQL Agents in Phase 10.'
        ],
        howItWorks: {
          explanation: [
            'Use parameterized queries (never string-interpolated SQL!) via `psycopg` or `SQLAlchemy` async sessions with connection pooling.'
          ],
          codeOrFormula: `-- Core tables for a production RAG + Agent platform:
CREATE TABLE documents (
    doc_id UUID PRIMARY KEY,
    source_uri TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    acl_roles TEXT[] NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
        },
        practicalRelevance: {
          summary: 'Powers document version tracking (Phase 04), agent checkpointing (Phase 09), and SQL agents (Phase 10).',
          examples: [
            'Storing LangGraph or custom agent checkpoints in PostgreSQL so an interrupted workflow can pause for human approval and resume hours later.'
          ]
        },
        whatToLearn: [
          'Design normalized tables for documents, chunks, chat sessions, and agent checkpoints.',
          'Execute parameterized async SQL queries in Python.'
        ],
        resources: [
          {
            id: 'res-p02-11a',
            title: 'PostgreSQL Documentation — SQL Language & JSONB Types',
            url: 'https://www.postgresql.org/docs/current/sql.html',
            type: 'Official Documentation',
            whyStudy: 'Authoritative reference for PostgreSQL SQL syntax, indexing, and JSONB operations.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-doc-versioning', 'p09-checkpointing', 'p10-sql-agents']
      },
      {
        id: 'p02-logging-exceptions',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 12,
        title: 'Logging and Exception Handling',
        subtitle: 'Structured JSON logs, correlation IDs, and domain exception hierarchies',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p02-python-project-arch'],
        technologies: ['structlog', 'Python logging', 'Correlation IDs'],
        whatIsIt: [
          'In production AI systems, `print()` statements are useless. Structured logging emits machine-parseable JSON log events tagged with a `request_id` / `trace_id`, latency durations, model names, retrieved document IDs, and token counts.'
        ],
        whyItExists: [
          'When a user reports that an agent gave a wrong answer, you must be able to query your logs by `request_id` and reconstruct the exact retrieval query, similarity scores, tool calls, and LLM finish reason.'
        ],
        howItWorks: {
          explanation: [
            'Define a clear domain exception hierarchy (`RetrievalError`, `LLMProviderError`, `SchemaValidationError`) and catch them at the API boundary while logging structured context.'
          ]
        },
        practicalRelevance: {
          summary: 'Forms the foundation for LLM Observability and Distributed Tracing in Phase 12.',
          examples: [
            'Logging `{"event": "rag_retrieval_completed", "request_id": "req_89a", "top_score": 0.84, "num_chunks": 5, "latency_ms": 14.2}`.'
          ]
        },
        whatToLearn: [
          'Configure structured JSON logging in Python.',
          'Design custom domain exceptions instead of bare `except Exception: pass` blocks.'
        ],
        resources: [
          {
            id: 'res-p02-12a',
            title: 'Python Official Logging HOWTO',
            url: 'https://docs.python.org/3/howto/logging.html',
            type: 'Official Documentation',
            whyStudy: 'Covers loggers, handlers, formatters, and exception traceback capture.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-error-handling-retries', 'p12-logging', 'p12-llm-observability']
      },
      {
        id: 'p02-unit-integration-testing',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 13,
        title: 'Unit and Integration Testing for AI Systems',
        subtitle: 'Testing deterministic pipeline code vs evaluating probabilistic model quality',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p02-python-project-arch'],
        technologies: ['Unit Tests', 'Mocking', 'Integration Tests'],
        whatIsIt: [
          'Testing an AI system requires separating two distinct layers: (1) Deterministic Software Tests (unit & integration tests verifying chunking logic, RRF score fusion math, metadata filtering, tool execution, and retry handlers using mocked LLM responses), and (2) Probabilistic Evaluation Benchmarks (covered in Phase 07).'
        ],
        whyItExists: [
          'You should never spend live LLM API money or wait 30 seconds in a unit test just to verify that your recursive text chunker preserves 50-token overlap or that your prompt template renders citations properly.'
        ],
        howItWorks: {
          explanation: [
            'Unit tests mock out the LLM and Vector DB interfaces to run in milliseconds; integration tests run against a real local Qdrant container to verify filter syntax and payload indexing.'
          ]
        },
        practicalRelevance: {
          summary: 'Catches 90% of bugs (broken chunk overlaps, off-by-one RRF math, malformed tool schemas) instantaneously before running expensive LLM evaluations.',
          examples: [
            'Writing unit tests for your Reciprocal Rank Fusion function and chunk deduplicator.'
          ]
        },
        whatToLearn: [
          'Separate deterministic unit/integration tests from probabilistic LLM evaluations.',
          'Design injectable client interfaces so LLM calls can be deterministically stubbed in unit tests.'
        ],
        resources: [
          {
            id: 'res-p02-13a',
            title: 'FastAPI — Testing Applications',
            url: 'https://fastapi.tiangolo.com/tutorial/testing/',
            type: 'Official Documentation',
            whyStudy: 'Shows how to test FastAPI endpoints and override dependencies with test doubles.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-pytest', 'p07-regression-testing']
      },
      {
        id: 'p02-pytest',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 14,
        title: 'Pytest',
        subtitle: 'Fixtures, parameterization, and async test execution',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p02-unit-integration-testing'],
        technologies: ['pytest', 'pytest-asyncio', 'Fixtures'],
        whatIsIt: [
          'Pytest is the standard testing framework in Python. Its `@pytest.fixture` dependency injection and `@pytest.mark.parametrize` decorator make it ideal for both software unit tests and running parameterized RAG evaluation suites.'
        ],
        whyItExists: [
          'Eliminates boilerplate test classes and allows you to run an entire golden dataset of test queries through your pipeline using `@pytest.mark.parametrize`.'
        ],
        howItWorks: {
          explanation: [
            'Use fixtures to spin up an in-memory Qdrant instance (`QdrantClient(":memory:")`) seeded with test documents for fast, isolated retrieval tests.'
          ],
          codeOrFormula: `import pytest
from qdrant_client import QdrantClient

@pytest.fixture
def memory_qdrant() -> QdrantClient:
    client = QdrantClient(":memory:")
    # initialize collection
    return client`
        },
        practicalRelevance: {
          summary: 'Powers both your deterministic code tests and your Phase 07/12 CI/CD evaluation regression gates.',
          examples: [
            'Using `QdrantClient(":memory:")` inside a Pytest fixture to test metadata filtering logic without external network dependencies.'
          ]
        },
        whatToLearn: [
          'Write Pytest fixtures, parameterized test cases, and async tests with `pytest-asyncio`.'
        ],
        resources: [
          {
            id: 'res-p02-14a',
            title: 'Pytest Official Documentation — Get Started',
            url: 'https://docs.pytest.org/en/stable/getting-started.html',
            type: 'Official Documentation',
            whyStudy: 'Official guide to assertions, fixtures, and test discovery.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-unit-integration-testing', 'p07-regression-testing']
      },
      {
        id: 'p02-git-version-control',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 15,
        title: 'Git and Version Control for AI Engineering',
        subtitle: 'Versioning code, prompt templates, evaluation datasets, and schema migrations together',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p02-python-project-arch'],
        technologies: ['Git', 'Semantic Commits', 'Branching'],
        whatIsIt: [
          'In AI engineering, Git tracks not just application code, but also prompt templates, chunking configurations, tool JSON schemas, and golden evaluation datasets.'
        ],
        whyItExists: [
          'When retrieval precision drops by 8%, you must be able to run `git diff` to see the exact prompt change, chunk size modification, or model upgrade that caused the regression.'
        ],
        howItWorks: {
          explanation: [
            'Store prompt templates and evaluation datasets as human-readable Python/JSON/YAML files in Git alongside code, while keeping secrets (`.env`) and large raw binary document corpora out of Git.'
          ]
        },
        practicalRelevance: {
          summary: 'Links every evaluation score directly to an immutable Git commit SHA.',
          examples: [
            'Tagging evaluation benchmark runs with the current Git commit SHA so you can compare retrieval quality across commits.'
          ]
        },
        whatToLearn: [
          'Version prompts, retrieval configs, and golden evaluation datasets in Git.',
          'Prevent secrets and large binary blobs from entering Git history.'
        ],
        resources: [
          {
            id: 'res-p02-15a',
            title: 'Pro Git Book — Official Git Documentation',
            url: 'https://git-scm.com/book/en/v2',
            type: 'Official Documentation',
            whyStudy: 'Authoritative reference for Git branching, diffing, and workflow discipline.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-prompt-templates', 'p12-cicd-fundamentals']
      },
      {
        id: 'p02-env-config-secrets',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 16,
        title: 'Environment Configuration and Secrets',
        subtitle: '12-Factor configuration across development, staging, and production',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p01-api-auth-env', 'p02-pydantic-validation'],
        technologies: ['pydantic-settings', '12-Factor App', 'Secret Managers'],
        whatIsIt: [
          'A production service runs across multiple environments (local dev, CI evaluation, staging, production) using the exact same codebase, switching behavior (model names, Qdrant hosts, log levels, API keys) strictly via validated environment configuration.'
        ],
        whyItExists: [
          'Hardcoding `qdrant_url = "http://localhost:6333"` or `chunk_size = 512` deep inside functions prevents running experiments or deploying to cloud containers.'
        ],
        howItWorks: {
          explanation: [
            'Centralize all settings in a single `Settings(BaseSettings)` class validated at startup.'
          ]
        },
        practicalRelevance: {
          summary: 'Lets you switch embedding dimensions, top_k, or model tiers via environment variables without touching code.',
          examples: [
            'Defining `DEFAULT_GENERATION_MODEL`, `QDRANT_URL`, and `EMBEDDING_DIMENSION` in a central validated `Settings` object.'
          ]
        },
        whatToLearn: [
          'Centralize application configuration and hyperparameters in a typed `BaseSettings` module.'
        ],
        resources: [
          {
            id: 'res-p02-16a',
            title: 'FastAPI — Settings and Environment Variables',
            url: 'https://fastapi.tiangolo.com/advanced/settings/',
            type: 'Official Documentation',
            whyStudy: 'Shows how to combine `pydantic-settings` with FastAPI dependency injection.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-api-auth-env', 'p11-secrets-management']
      },
      {
        id: 'p02-docker-containers',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 17,
        title: 'Docker and Containers',
        subtitle: 'Packaging Python AI backends and spinning up local Qdrant & PostgreSQL stacks via Docker Compose',
        difficulty: 'Intermediate',
        estimatedEffort: '1 hour',
        prerequisites: ['p02-venv-deps', 'p02-fastapi'],
        technologies: ['Docker', 'Dockerfile', 'Docker Compose'],
        whatIsIt: [
          'Docker packages your application code, Python interpreter, system libraries (such as `libpoppler` or `tesseract` for PDF parsing), and locked dependencies into an immutable, reproducible container image.',
          'Docker Compose orchestrates multi-container local stacks—allowing you to launch your FastAPI backend, a persistent Qdrant vector database container, and a PostgreSQL container with a single `docker compose up` command.'
        ],
        whyItExists: [
          'Eliminates "it works on my machine" dependency drift and provides the exact runtime artifact deployed to cloud production environments.'
        ],
        howItWorks: {
          explanation: [
            'Write a multi-stage `Dockerfile` using a slim Python base image, non-root user execution, and layer caching for dependencies, paired with `docker-compose.yml` mounting named volumes for Qdrant and Postgres data persistence.'
          ],
          codeOrFormula: `# docker-compose.yml snippet for local RAG stack
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports: ["6333:6333", "6334:6334"]
    volumes: ["qdrant_data:/qdrant/storage"]`
        },
        practicalRelevance: {
          summary: 'You will use Docker immediately in Phase 06 to run Qdrant locally and in Phase 12/13 to deploy your Capstone system.',
          examples: [
            'Running Qdrant locally via Docker with persistent volume storage while developing your ingestion and retrieval pipelines.'
          ]
        },
        whatToLearn: [
          'Write clean, layer-cached `Dockerfile` definitions for FastAPI services.',
          'Author `docker-compose.yml` files to run Qdrant and PostgreSQL locally with persistent storage volumes.'
        ],
        resources: [
          {
            id: 'res-p02-17a',
            title: 'Docker Official Learning Path — Get Started with Docker Containers',
            url: 'https://docs.docker.com/learn/paths/get-started-with-docker-containers/',
            type: 'Official Documentation',
            whyStudy: 'Official step-by-step guide to images, containers, volumes, and Docker Compose.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-persistence', 'p12-docker-deployment']
      },
      {
        id: 'p02-basic-deployment',
        phaseId: 'phase-02',
        phaseNumber: '02',
        order: 18,
        title: 'Basic Application Deployment',
        subtitle: 'Health checks, ASGI process managers, and stateless container hosting',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p02-docker-containers', 'p02-fastapi'],
        technologies: ['Uvicorn', 'Health Checks', 'Cloud Run / Container Hosting'],
        whatIsIt: [
          'Deploying a containerized AI backend involves running an ASGI server (`uvicorn`) behind a reverse proxy or managed container platform (such as Google Cloud Run, AWS ECS, or Fly.io) with liveness/readiness `/health` endpoints and environment secrets injected from a secret manager.'
        ],
        whyItExists: [
          'Verifying early that your architecture can be built into a container and deployed prevents accumulating local-file coupling that breaks in cloud environments.'
        ],
        howItWorks: {
          explanation: [
            'Expose a `/healthz` endpoint that verifies connectivity to downstream storage (Qdrant and PostgreSQL) and ensure the application container is strictly stateless (all persistent state lives in managed databases or mounted volumes).'
          ]
        },
        practicalRelevance: {
          summary: 'Prepares your service architecture for full production deployment and monitoring in Phase 12.',
          examples: [
            'Deploying a containerized FastAPI service with graceful shutdown handling so in-flight LLM streams finish cleanly during rolling updates.'
          ]
        },
        whatToLearn: [
          'Configure Uvicorn for production container execution.',
          'Implement readiness health checks and graceful shutdown hooks.'
        ],
        resources: [
          {
            id: 'res-p02-18a',
            title: 'FastAPI — Deployment in Containers (Docker)',
            url: 'https://fastapi.tiangolo.com/deployment/docker/',
            type: 'Official Documentation',
            whyStudy: 'Official guide on configuring FastAPI and Uvicorn inside production Docker containers.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-docker-containers', 'p12-app-deployment']
      }
    ]
  },
  {
    id: 'phase-03',
    number: '03',
    title: 'RAG Fundamentals',
    shortTitle: 'RAG Fundamentals',
    objective: 'Understand Retrieval-Augmented Generation (RAG) from zero and implement a complete baseline RAG pipeline from first principles.',
    description: 'Because you are starting from zero RAG experience, this phase demystifies every single stage of the RAG pipeline—from why parametric model weights cannot replace external retrieval, to chunking, embedding, cosine similarity, vector search, prompt augmentation, citations, and abstention.',
    milestone: 'Implement a complete end-to-end RAG pipeline in Python over a collection of technical documents with inline source citations and unanswerable-query refusal.',
    architecturePipeline: [
      'DOCUMENTS',
      'PROCESSING',
      'CHUNKING',
      'EMBEDDINGS',
      'VECTOR DATABASE',
      'RETRIEVAL',
      'CONTEXT AUGMENTATION',
      'LLM',
      'ANSWER'
    ],
    keyDistinctions: [
      'RAG is NOT fine-tuning: RAG leaves model weights untouched and supplies facts dynamically inside the prompt context window at inference time.',
      'Embeddings are NOT generated answers: Embeddings are numeric coordinate vectors used solely to locate relevant text passages.',
      'A vector database is NOT the entirety of a RAG system: It is the storage and ANN search component inside a broader ingestion, retrieval, and synthesis pipeline.',
      'Retrieval quality directly governs answer quality: If the retriever fetches irrelevant chunks ("Garbage In"), even the strongest LLM will fail or hallucinate ("Garbage Out").'
    ],
    topics: [
      {
        id: 'p03-what-is-rag',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 1,
        title: 'What is Retrieval-Augmented Generation (RAG)?',
        subtitle: 'Grounding generative language models on dynamically retrieved external evidence',
        difficulty: 'Foundational',
        estimatedEffort: '1 hour',
        prerequisites: ['p00-what-is-llm', 'p00-embeddings-intro', 'p00-gen-vs-embed-models'],
        technologies: ['RAG', 'Information Retrieval', 'In-Context Grounding'],
        whatIsIt: [
          'Retrieval-Augmented Generation (RAG), first formalized by Lewis et al. (2020), is an architectural pattern that connects a generative Large Language Model to an external, searchable knowledge index. Before asking the LLM to answer a user’s question, the system automatically searches the external knowledge base for the most relevant document passages and inserts those passages directly into the LLM’s prompt.',
          'Think of the difference between taking an exam from pure memory (closed-book exam) versus taking an open-book exam where you first look up the exact section in a reference textbook and then write your answer quoting that page. Standard LLM inference is a closed-book exam; RAG turns inference into an automated open-book exam.'
        ],
        whyItExists: [
          'Foundation models are trained on a static snapshot of public internet text up to a fixed cutoff date. They know nothing about your company’s private codebase, internal engineering docs, medical records, or breaking events from five minutes ago.',
          'Furthermore, when an LLM relies solely on its neural weights to recall niche facts, it frequently confuses similar concepts and generates confident-sounding falsehoods (hallucinations). RAG solves both problems by supplying authoritative source text at runtime.'
        ],
        howItWorks: {
          explanation: [
            'Every RAG system consists of two distinct pipelines:',
            '1. Offline Indexing Pipeline: Raw Documents → Text Extraction & Cleaning → Text Chunking → Embedding Generation → Vector Database Storage.',
            '2. Online Query Pipeline: User Question → Query Embedding → Vector Search (Retrieve Top-K Chunks) → Prompt Context Augmentation → LLM Generation → Grounded Answer with Citations.'
          ],
          diagram: {
            type: 'rag-pipeline',
            caption: 'Interactive End-to-End RAG Pipeline: Click any stage below to inspect the exact data transformation from raw documents to grounded answer.'
          }
        },
        practicalRelevance: {
          summary: 'RAG is the single most widely deployed architecture in enterprise AI engineering.',
          examples: [
            'Internal engineering knowledge assistants that search across GitHub repositories, RFC architecture docs, and incident post-mortems.',
            'Customer technical support portals that answer product questions with clickable links to official documentation sections.'
          ]
        },
        whatToLearn: [
          'Trace the complete 9-stage RAG pipeline from raw documents to cited answer.',
          'Distinguish clearly between the Offline Indexing Pipeline and the Online Query/Generation Pipeline.',
          'Explain why RAG is not fine-tuning and why a vector database is only one part of a RAG system.'
        ],
        resources: [
          {
            id: 'res-p03-1a',
            title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)',
            url: 'https://arxiv.org/abs/2005.11401',
            type: 'Research Paper',
            whyStudy: 'The original seminal research paper that introduced and named the RAG paradigm.',
            priority: 'Essential'
          },
          {
            id: 'res-p03-1b',
            title: 'Pinecone — Retrieval-Augmented Generation (RAG) Complete Guide',
            url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/',
            type: 'Architecture Guide',
            whyStudy: 'Clear, engineering-focused walkthrough of the indexing and retrieval-generation lifecycle.',
            priority: 'Essential'
          },
          {
            id: 'res-p03-1c',
            title: 'Microsoft Azure Foundry — Retrieval-Augmented Generation Concepts',
            url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation',
            type: 'Architecture Guide',
            whyStudy: 'Production architectural blueprint detailing how retrieval and grounding interact.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-why-external-knowledge', 'p03-parametric-vs-external', 'p03-rag-architecture']
      },
      {
        id: 'p03-why-external-knowledge',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 2,
        title: 'Why Do LLMs Need External Knowledge?',
        subtitle: 'Knowledge cutoffs, private domain boundaries, provenance, and instant revocation',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-what-is-rag'],
        technologies: ['Knowledge Cutoff', 'Data Freshness', 'Access Control'],
        whatIsIt: [
          'Relying exclusively on information memorized inside an LLM’s neural weights fails in four fundamental ways for real-world applications: temporal staleness (knowledge cutoff), lack of private/proprietary domain data, absence of verifiable source provenance, and inability to update or delete facts dynamically.'
        ],
        whyItExists: [
          'Imagine an enterprise policy changes at 9:00 AM. You cannot re-train or fine-tune a 70-billion-parameter model every time a PDF or database row changes. Even if you fine-tuned the model, fine-tuning does not reliably erase old facts or enforce per-user document access permissions.'
        ],
        howItWorks: {
          explanation: [
            'By keeping dynamic facts in an external retrieval index rather than baking them into model weights, adding, updating, or deleting knowledge is reduced to a millisecond database upsert or delete operation.'
          ]
        },
        practicalRelevance: {
          summary: 'Explains why fine-tuning an LLM on company documents is almost always the wrong architectural choice compared to RAG.',
          examples: [
            'Deleting an obsolete security policy document from Qdrant immediately prevents the RAG system from ever citing it again, with zero model retraining.'
          ]
        },
        whatToLearn: [
          'Explain the four core limitations of static model weights: temporal cutoff, private data isolation, attribution/provenance, and mutability/ACL control.',
          'Know why fine-tuning teaches form/style/behavior, whereas RAG supplies dynamic factual knowledge.'
        ],
        resources: [
          {
            id: 'res-p03-2a',
            title: 'Microsoft — Why Use RAG Over Fine-Tuning for Enterprise Knowledge',
            url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation',
            type: 'Architecture Guide',
            whyStudy: 'Contrasts external retrieval against weight fine-tuning across freshness, cost, and security.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-parametric-vs-external', 'p04-updating-deleting-docs']
      },
      {
        id: 'p03-parametric-vs-external',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 3,
        title: 'Parametric Knowledge vs External (Non-Parametric) Knowledge',
        subtitle: 'Implicit compressed weights vs explicit inspectable text records',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-what-is-rag'],
        technologies: ['Parametric Memory', 'Non-Parametric Memory'],
        whatIsIt: [
          'In the original RAG paper (Lewis et al., 2020), the authors frame RAG as combining two distinct types of memory:',
          '1. Parametric Memory: Knowledge implicitly compressed into the billions of floating-point parameters (weights θ) of the neural network during pre-training.',
          '2. Non-Parametric (External) Memory: Knowledge stored explicitly as discrete, human-readable text passages inside an external searchable index.'
        ],
        whyItExists: [
          'Parametric memory is lossy statistical compression: it excels at linguistic fluency, grammar, code structure, and general reasoning skills, but is unreliable for exact precision recall (serial numbers, policy clauses, API signatures). Non-parametric memory is lossless and directly inspectable.'
        ],
        howItWorks: {
          explanation: [
            'During RAG inference, the LLM uses its Parametric Memory (reasoning and language synthesis ability) to read, interpret, and summarize the Non-Parametric Memory (the exact retrieved chunks injected into the prompt).',
            'A critical engineering challenge in RAG is resolving conflict when a user query triggers outdated Parametric Memory that contradicts the fresh External Memory—which is why system prompts must explicitly command the model to prioritize retrieved context over prior knowledge.'
          ]
        },
        practicalRelevance: {
          summary: 'Understanding the tension between parametric priors and retrieved context helps you debug why an LLM sometimes ignores retrieved chunks.',
          examples: [
            'When documenting an internal library whose API changed in v3, the LLM’s parametric memory from public v1 tutorials may conflict with your retrieved v3 docs unless prompt instructions enforce strict context adherence.'
          ]
        },
        whatToLearn: [
          'Define parametric vs non-parametric (external) memory formally.',
          'Understand how knowledge conflict occurs between pre-trained priors and retrieved context, and how prompt constraints resolve it.'
        ],
        resources: [
          {
            id: 'res-p03-3a',
            title: 'RAG Paper: Parametric and Non-Parametric Memory (Lewis et al., 2020)',
            url: 'https://arxiv.org/abs/2005.11401',
            type: 'Research Paper',
            whyStudy: 'Formalizes the mathematical synergy between parametric generators and non-parametric retrieval indexes.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-what-is-rag', 'p03-grounded-responses', 'p07-faithfulness']
      },
      {
        id: 'p03-why-prompting-insufficient',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 4,
        title: 'Why Prompting Alone (Long-Context Stuffing) is Insufficient',
        subtitle: 'Cost, latency, and attention degradation when dumping corpora into prompts',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-context-windows', 'p01-tokens-cost'],
        technologies: ['Long Context vs RAG', 'Prefill Scaling', 'Attention Dilution'],
        whatIsIt: [
          'A natural question when learning about 1M-token context windows is: "Why build a RAG pipeline at all? Why not just paste all my documents into the system prompt on every query?"',
          'While pasting 2–3 short documents into a prompt works fine for small static tasks, "context stuffing" breaks down completely as an architectural strategy for real knowledge bases.'
        ],
        whyItExists: [
          '1. Corpus Scale: Enterprise knowledge bases contain gigabytes of text (10M to 500M+ tokens), far exceeding any context window.',
          '2. Latency & Cost: Even for a 500,000-token corpus that fits in a 1M window, running attention over 500,000 tokens on every query incurs multi-second prefill latency and costs orders of magnitude more than retrieving 3,000 targeted tokens.',
          '3. Signal-to-Noise ("Lost in the Middle"): Passing 99% irrelevant text alongside 1% relevant text degrades LLM reasoning accuracy and increases hallucination rates.'
        ],
        howItWorks: {
          explanation: [
            'RAG acts as a high-speed O(log N) precision filter that narrows millions of tokens down to the highest-signal 2,000–5,000 tokens before invoking the O(N²) Transformer attention mechanism.'
          ]
        },
        practicalRelevance: {
          summary: 'Equips you to make rigorous quantitative trade-offs between direct context injection, context caching, and RAG retrieval.',
          examples: [
            'Using direct prompt injection + context caching for a single 40-page PDF analyzer, vs using full RAG for a 5,000-document engineering repository.'
          ]
        },
        whatToLearn: [
          'Calculate the latency and cost break-even points between full-context prompting and RAG.',
          'Explain why retrieval filtering improves signal-to-noise ratio for the generation model.'
        ],
        resources: [
          {
            id: 'res-p03-4a',
            title: 'Lost in the Middle: How Language Models Use Long Contexts',
            url: 'https://arxiv.org/abs/2307.03172',
            type: 'Research Paper',
            whyStudy: 'Proves empirically that retrieving targeted passages outperforms dumping large unstructured contexts.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-context-windows', 'p03-rag-architecture']
      },
      {
        id: 'p03-rag-architecture',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 5,
        title: 'The RAG Architecture',
        subtitle: 'Complete structural blueprint of the 9-stage indexing and retrieval-generation system',
        difficulty: 'Foundational',
        estimatedEffort: '1 hour',
        prerequisites: ['p03-what-is-rag'],
        technologies: ['Ingestion Pipeline', 'Vector Index', 'Retriever', 'Generator'],
        whatIsIt: [
          'The complete RAG architecture decouples knowledge preparation (the asynchronous Ingestion & Indexing Pipeline) from real-time question answering (the synchronous Retrieval & Generation Pipeline), connected via a persistent Vector & Metadata Store.'
        ],
        whyItExists: [
          'Decoupling ingestion from query time allows heavy document parsing, cleaning, chunking, and batch embedding to happen offline or asynchronously, keeping online user queries under a strict sub-second retrieval budget.'
        ],
        howItWorks: {
          explanation: [
            'Trace the canonical 9-stage pipeline:',
            'DOCUMENTS → PROCESSING → CHUNKING → EMBEDDINGS → VECTOR DATABASE → RETRIEVAL → CONTEXT AUGMENTATION → LLM → ANSWER.',
            'Crucially, the exact same Embedding Model (`f_embed`) used during stage 4 (indexing document chunks) MUST be used during stage 6 (encoding the user query) so both vectors reside in the exact same geometric space.'
          ],
          diagram: {
            type: 'rag-pipeline',
            caption: 'Interactive 9-Stage RAG Pipeline Architecture: Explore the data contract at each boundary.'
          }
        },
        practicalRelevance: {
          summary: 'Serves as the master blueprint for Phases 04, 05, 06, and 07.',
          examples: [
            'Designing modular Python interfaces (`DocumentProcessor`, `Chunker`, `Embedder`, `VectorStore`, `Retriever`, `AnswerSynthesizer`) so any stage can be upgraded and benchmarked independently.'
          ]
        },
        whatToLearn: [
          'Draw and explain the inputs, outputs, and failure modes of each of the 9 RAG pipeline stages.',
          'Explain why query embedding and document embedding must share the identical model and dimensionality.'
        ],
        resources: [
          {
            id: 'res-p03-5a',
            title: 'Microsoft RAG Architecture Guide',
            url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation',
            type: 'Architecture Guide',
            whyStudy: 'Comprehensive systems diagram and component breakdown of production RAG.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-doc-ingestion', 'p03-vector-search', 'p03-context-augmentation']
      },
      {
        id: 'p03-doc-ingestion',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 6,
        title: 'Document Ingestion',
        subtitle: 'Acquiring raw files, API payloads, and metadata into the pipeline',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-rag-architecture'],
        technologies: ['Document Loaders', 'Metadata Extraction', 'Content Hashing'],
        whatIsIt: [
          'Document ingestion is the entry gate of the RAG indexing pipeline: reading raw source artifacts (Markdown files, PDFs, HTML pages, Notion/Confluence exports, source code) from storage and wrapping them into standardized raw `Document` objects containing the raw content plus source metadata (`source_uri`, `title`, `created_at`, `author`, `content_hash`).'
        ],
        whyItExists: [
          'If you lose the source filename, URL, or section header during ingestion, your RAG system will never be able to provide verifiable citations or filter search results by document date or owner.'
        ],
        howItWorks: {
          explanation: [
            'Compute a deterministic SHA-256 hash of the raw document bytes during ingestion so you can detect unchanged files and avoid re-embedding already indexed documents.'
          ],
          codeOrFormula: `import hashlib
from dataclasses import dataclass

@dataclass
class RawDocument:
    doc_id: str
    source_uri: str
    raw_text: str
    sha256_hash: str
    metadata: dict[str, str]`
        },
        practicalRelevance: {
          summary: 'Metadata preserved at ingestion time enables source citations and metadata filtering at query time.',
          examples: [
            'Attaching `{"service": "payments-api", "updated_at": "2026-10-12"}` during ingestion so engineers can filter RAG queries to a specific microservice.'
          ]
        },
        whatToLearn: [
          'Design a standardized `RawDocument` data structure that pairs text content with provenance metadata and content hashes.'
        ],
        resources: [
          {
            id: 'res-p03-6a',
            title: 'Pinecone — RAG Ingestion & Data Preparation Guide',
            url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/',
            type: 'Architecture Guide',
            whyStudy: 'Explains how ingestion metadata flows through to retrieval and attribution.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-doc-processing', 'p04-doc-loaders', 'p04-doc-metadata']
      },
      {
        id: 'p03-doc-processing',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 7,
        title: 'Document Processing',
        subtitle: 'Normalizing raw extracted text and stripping structural noise',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-doc-ingestion'],
        technologies: ['Text Normalization', 'Unicode Cleaning', 'Boilerplate Removal'],
        whatIsIt: [
          'Document processing transforms messy raw extracted strings (containing broken PDF hyphenations, repeated page headers/footers, HTML navigation menus, or non-printable Unicode artifacts) into clean, semantically coherent text ready for chunking.'
        ],
        whyItExists: [
          'If every page of a 100-page PDF includes the footer `"CONFIDENTIAL — ACME CORP 2026 — PAGE X"`, your chunks become polluted with repetitive boilerplate that distorts embedding vectors and wastes context tokens.'
        ],
        howItWorks: {
          explanation: [
            'Normalize Unicode (`unicodedata.normalize("NFKC", text)`), collapse excessive whitespace while preserving paragraph double-newlines (`\\n\\n`), repair broken line-wrap hyphens, and strip HTML nav/footer tags.'
          ]
        },
        practicalRelevance: {
          summary: 'Clean text preprocessing often yields a larger retrieval accuracy boost than switching embedding models.',
          examples: [
            'Stripping `<nav>`, `<script>`, and `<footer>` blocks from scraped documentation HTML before chunking.'
          ]
        },
        whatToLearn: [
          'Implement deterministic text cleaning routines that strip boilerplate while preserving structural headings and code blocks.'
        ],
        resources: [
          {
            id: 'res-p03-7a',
            title: 'Python unicodedata — Unicode Normalization Standards',
            url: 'https://docs.python.org/3/library/unicodedata.html',
            type: 'Official Documentation',
            whyStudy: 'Standard library reference for normalizing ligatures and inconsistent Unicode characters in extracted text.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-text-chunking', 'p04-data-cleaning']
      },
      {
        id: 'p03-text-chunking',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 8,
        title: 'Text Chunking',
        subtitle: 'Partitioning long documents into focused, retrievable semantic units',
        difficulty: 'Foundational',
        estimatedEffort: '1 hour',
        prerequisites: ['p00-tokens-tokenization', 'p03-doc-processing'],
        technologies: ['Chunk Size', 'Chunk Overlap', 'Sliding Window'],
        whatIsIt: [
          'Text chunking splits a long document (e.g., a 15,000-token architecture manual) into smaller segments called chunks (typically 256 to 512 tokens each), often with a small sliding overlap (e.g., 50 tokens) between adjacent chunks.'
        ],
        whyItExists: [
          'Chunking is necessary for two fundamental reasons:',
          '1. Embedding Precision: An embedding model compresses an entire input passage into a single vector of 768 floats. If you try to compress a 30-page document covering 12 different topics into a single vector, the vector averages out all 12 topics into a blurry centroid that matches nothing well.',
          '2. Generation Context Budget: At query time, you want to inject only the specific paragraphs that answer the user’s question, not an entire 30-page book.'
        ],
        howItWorks: {
          explanation: [
            'A sliding window or recursive separator splitter partitions text into chunks of size C tokens with step size (C - O), where O is the overlap. The overlap prevents sentences or ideas split right at a chunk boundary from losing their surrounding context.'
          ],
          codeOrFormula: `def chunk_tokens(tokens: list[int], chunk_size: int = 400, overlap: int = 50) -> list[list[int]]:
    step = chunk_size - overlap
    return [tokens[i : i + chunk_size] for i in range(0, len(tokens), step)]`,
          diagram: {
            type: 'chunking-strategies',
            caption: 'Interactive Chunking & Overlap Explorer: Adjust chunk size and overlap to inspect boundary behavior.'
          }
        },
        practicalRelevance: {
          summary: 'Chunk size and chunk structure directly determine the granularity and precision of vector search.',
          examples: [
            'Prepending the document title and section heading to each chunk before embedding so a chunk reading "It defaults to 16 connections" retains the context `[PostgreSQL Connection Pool > Max Connections]: It defaults to 16 connections.`'
          ]
        },
        whatToLearn: [
          'Explain why embedding an entire long document into a single vector fails.',
          'Understand the trade-off between small chunks (high embedding specificity, risk of missing broader context) and large chunks (richer context, diluted vector representation).',
          'Explain why chunk overlap prevents boundary information loss.'
        ],
        resources: [
          {
            id: 'res-p03-8a',
            title: 'Pinecone — Chunking Strategies for LLM Applications',
            url: 'https://www.pinecone.io/learn/chunking-strategies/',
            type: 'Architecture Guide',
            whyStudy: 'Deep-dive guide into why we chunk, sizing trade-offs, and structural boundary preservation.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-chunking-strategies', 'p04-chunk-overlap']
      },
      {
        id: 'p03-embedding-generation',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 9,
        title: 'Embedding Generation',
        subtitle: 'Transforming document chunks and user queries into dense vectors',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p00-embeddings-intro', 'p03-text-chunking'],
        technologies: ['gemini-embedding-001', 'Task Types', 'Batch Embedding'],
        whatIsIt: [
          'Embedding generation invokes an embedding model across each text chunk during indexing (producing document vectors d_i ∈ ℝ^D) and across the user’s search string at query time (producing query vector q ∈ ℝ^D).'
        ],
        whyItExists: [
          'Converts unstructured variable-length text strings into fixed-length numerical arrays that can be indexed in spatial data structures (like HNSW graphs) for millisecond geometric search.'
        ],
        howItWorks: {
          explanation: [
            'Asymmetric Retrieval Embeddings: Notice that a user query is typically short ("HNSW memory usage formula") while a document chunk is a 400-token explanatory paragraph. Modern embedding models like `gemini-embedding-001` support asymmetric task-type conditioning (`RETRIEVAL_DOCUMENT` when embedding chunks vs `RETRIEVAL_QUERY` when embedding the user question) to optimize the projection of short queries against long passages.'
          ],
          codeOrFormula: `# Indexing time: embed chunks in batches with RETRIEVAL_DOCUMENT
doc_res = client.models.embed_content(
    model="gemini-embedding-001",
    contents=[c.text for c in chunks],
    config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
)
# Query time: embed question with RETRIEVAL_QUERY
q_res = client.models.embed_content(
    model="gemini-embedding-001",
    contents=user_question,
    config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
)`
        },
        practicalRelevance: {
          summary: 'Batching chunk embeddings and setting proper asymmetric retrieval task types maximizes both indexing throughput and recall accuracy.',
          examples: [
            'Batching 100 chunks per API call during ingestion while using single-query embedding at search time.'
          ]
        },
        whatToLearn: [
          'Generate batch document embeddings and single query embeddings using the Gemini API.',
          'Understand asymmetric query-vs-document embedding task types.'
        ],
        resources: [
          {
            id: 'res-p03-9a',
            title: 'Google Gemini API — Embeddings & Task Types Documentation',
            url: 'https://ai.google.dev/gemini-api/docs/embeddings',
            type: 'Official Documentation',
            whyStudy: 'Official documentation covering `RETRIEVAL_DOCUMENT` vs `RETRIEVAL_QUERY` and dimensionality control.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p00-embeddings-intro', 'p03-vector-representations']
      },
      {
        id: 'p03-vector-representations',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 10,
        title: 'Vector Representations',
        subtitle: 'Unit hypersphere geometry, L2 normalization, and dimensionality',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-embedding-generation'],
        technologies: ['Linear Algebra', 'L2 Norm', 'Matryoshka Embeddings'],
        whatIsIt: [
          'A dense vector representation v = [v_1, v_2, ..., v_D] is an element of ℝ^D (typically D = 384, 768, 1024, 1536, or 3072). Unlike tabular feature vectors where dimension 0 means "age" and dimension 1 means "income", individual dimensions in a learned embedding are distributed latent representations—meaning is encoded in the direction of the vector across all dimensions jointly.'
        ],
        whyItExists: [
          'Understanding the linear algebra of vector representations—specifically L2 normalization (`||v||_2 = 1`) and dimensionality memory footprints (`D × 4 bytes` for `float32`)—is vital for configuring vector databases and optimizing memory.'
        ],
        howItWorks: {
          explanation: [
            'When vectors are L2-normalized to unit length (`v_norm = v / sqrt(Σ v_i²)`), every vector sits on the surface of a D-dimensional unit hypersphere. On the unit sphere, Cosine Similarity simplifies mathematically to a single fast SIMD Dot Product!'
          ],
          codeOrFormula: `import numpy as np
def l2_normalize(v: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(v)
    return v / norm if norm > 0 else v

# Memory footprint of 1,000,000 vectors of dimension 768 in float32:
# 1,000,000 * 768 * 4 bytes ≈ 3.07 GB raw vector data`
        },
        practicalRelevance: {
          summary: 'Allows you to calculate exact RAM requirements for vector collections and optimize distance computation.',
          examples: [
            'Using Matryoshka Representation Learning (MRL) truncation (`output_dimensionality=768`) to cut vector RAM usage by 75% with <1% recall difference.'
          ]
        },
        whatToLearn: [
          'Compute L2 norms and normalize vectors in NumPy.',
          'Calculate raw memory consumption of vector collections given count N, dimension D, and data type (`float32`, `float16`, `int8`).'
        ],
        resources: [
          {
            id: 'res-p03-10a',
            title: 'Qdrant Documentation — Vectors and Distance Metrics',
            url: 'https://qdrant.tech/documentation/concepts/vectors/',
            type: 'Official Documentation',
            whyStudy: 'Explains dense vector representations, normalization, and storage inside a vector engine.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-similarity-measures', 'p03-cosine-similarity', 'p06-storage-memory']
      },
      {
        id: 'p03-similarity-measures',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 11,
        title: 'Similarity Measures',
        subtitle: 'Comparing Cosine Similarity, Dot Product (Inner Product), and Euclidean (L2) Distance',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-vector-representations'],
        technologies: ['Cosine Similarity', 'Dot Product', 'Euclidean L2 Distance'],
        whatIsIt: [
          'A similarity measure (or distance metric) is a mathematical function `d(u, v) → ℝ` that quantifies how close two vectors u and v are in embedding space. The three standard metrics in vector search are Cosine Similarity, Dot Product (Inner Product), and Euclidean (L2) Distance.'
        ],
        whyItExists: [
          'When creating a vector collection in Qdrant or pgvector, you must declare the distance metric upfront so the index organizes graph edges according to that metric.'
        ],
        howItWorks: {
          explanation: [
            '1. Dot Product: `u · v = Σ u_i v_i`. Sensitive to both angle and vector magnitude.',
            '2. Cosine Similarity: `(u · v) / (||u|| ||v||)`. Measures strictly the cosine of the angle θ between vectors, invariant to vector magnitude.',
            '3. Euclidean Distance: `||u - v||_2 = sqrt(Σ (u_i - v_i)²)`.',
            'Crucial Mathematical Identity: When two vectors are L2-normalized (`||u|| = ||v|| = 1`), `||u - v||_2² = ||u||² + ||v||² - 2(u · v) = 2 - 2 cos(θ)`. Thus, for normalized vectors, Cosine Similarity, Dot Product, and Euclidean Distance all produce the EXACT same ranking order!'
          ],
          codeOrFormula: `For unit vectors ||u|| = ||v|| = 1:
Cosine(u, v) == DotProduct(u, v)
Euclidean²(u, v) == 2 * (1 - Cosine(u, v))
// Therefore, rank order is identical across all three metrics on unit-normalized embeddings!`
        },
        practicalRelevance: {
          summary: 'Explains why Qdrant automatically L2-normalizes vectors when configured with `Distance.COSINE` so it can run faster SIMD dot products at query time.',
          examples: [
            'Configuring `Distance.COSINE` in Qdrant for text embeddings so magnitude differences from passage length do not skew retrieval rankings.'
          ]
        },
        whatToLearn: [
          'Write the equations for Dot Product, Cosine Similarity, and Euclidean L2 Distance.',
          'Prove why all three metrics yield identical rankings on unit-normalized vectors.'
        ],
        resources: [
          {
            id: 'res-p03-11a',
            title: 'Qdrant — Distance Metrics in Vector Search',
            url: 'https://qdrant.tech/documentation/concepts/search/',
            type: 'Official Documentation',
            whyStudy: 'Details Cosine, Dot, and Euclid metrics and automatic normalization behavior.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-cosine-similarity', 'p06-distance-metrics']
      },
      {
        id: 'p03-cosine-similarity',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 12,
        title: 'Cosine Similarity Deep Dive',
        subtitle: 'Geometric intuition, range [-1, 1], and NumPy implementation from scratch',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-similarity-measures'],
        technologies: ['Linear Algebra', 'NumPy', 'SIMD'],
        whatIsIt: [
          'Cosine similarity measures the cosine of the angle θ between two non-zero vectors in an inner product space: `cos(θ) = (u · v) / (||u||_2 ||v||_2)`. Its output lies in `[-1, 1]`, where `1.0` means identical direction, `0.0` means orthogonal (unrelated), and `-1.0` means diametrically opposite.'
        ],
        whyItExists: [
          'In high-dimensional text embedding spaces, the direction of a vector encodes semantic topic and intent, whereas raw vector magnitude can fluctuate with sentence length or token frequency. Cosine similarity projects out magnitude and compares pure directional alignment.'
        ],
        howItWorks: {
          explanation: [
            'To compute top-k cosine similarity over a matrix of N document vectors `D ∈ ℝ^(N×d)` and a query vector `q ∈ ℝ^d` in pure Python/NumPy: normalize rows of D once at indexing time, normalize q at query time, and compute a single matrix-vector product `scores = D_norm @ q_norm`.'
          ],
          codeOrFormula: `import numpy as np

def top_k_cosine_search(doc_matrix: np.ndarray, query_vec: np.ndarray, k: int = 5):
    # doc_matrix shape: (N, D), query_vec shape: (D,)
    doc_norms = doc_matrix / np.linalg.norm(doc_matrix, axis=1, keepdims=True)
    q_norm = query_vec / np.linalg.norm(query_vec)
    scores = doc_norms @ q_norm  # O(N * D) exact search
    top_indices = np.argsort(scores)[::-1][:k]
    return [(int(idx), float(scores[idx])) for idx in top_indices]`
        },
        practicalRelevance: {
          summary: 'Implementing exact cosine similarity search in 10 lines of NumPy demystifies vector search completely before you ever install a vector database.',
          examples: [
            'Building an in-memory NumPy vector search over 1,000 chunks that executes in <2 milliseconds.'
          ]
        },
        whatToLearn: [
          'Implement vectorized top-k cosine similarity search in NumPy without external vector libraries.',
          'Understand why high-dimensional anisotropic embedding models often cluster scores in a narrower band (e.g., 0.55 to 0.88) rather than spanning the full [-1, 1] range.'
        ],
        resources: [
          {
            id: 'res-p03-12a',
            title: 'Pinecone — Vector Similarity Explained',
            url: 'https://www.pinecone.io/learn/vector-similarity/',
            type: 'Architecture Guide',
            whyStudy: 'Visual and mathematical breakdown of cosine similarity in high-dimensional spaces.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-similarity-measures', 'p03-vector-search']
      },
      {
        id: 'p03-vector-search',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 13,
        title: 'Vector Search',
        subtitle: 'From brute-force O(N·D) linear scan to indexed Approximate Nearest Neighbor (ANN) search',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-cosine-similarity'],
        technologies: ['k-NN', 'ANN', 'Vector Indexes'],
        whatIsIt: [
          'Vector search (or k-Nearest Neighbors search, k-NN) is the algorithmic problem of finding the `k` document vectors in a collection `S` of size `N` that maximize similarity `sim(q, d_i)` with a given query vector `q`.'
        ],
        whyItExists: [
          'Your 10-line NumPy matrix multiplication (`D_norm @ q_norm`) performs an exact Brute-Force Scan (`O(N · D)` complexity). For `N = 10,000` chunks, a brute-force NumPy scan takes ~3ms. However, for `N = 50,000,000` chunks across concurrent users, scanning 50 million 768-dimensional vectors on every query is too slow and doesn’t support disk persistence, metadata filtering, or live CRUD updates.',
          'Vector databases solve this by building specialized graph or cluster indexes (like HNSW) that find the top-k neighbors in sub-linear time with >98% recall, plus payload filtering and durable storage.'
        ],
        howItWorks: {
          explanation: [
            'During indexing, each record `(id, vector, payload_dict)` is inserted into a spatial index. At query time, the engine traverses the index graph starting from an entry node, zooming in on the neighborhood closest to `q` while evaluating only a tiny fraction of the total N vectors.'
          ]
        },
        practicalRelevance: {
          summary: 'Connects your algorithmic background (search trees, graphs, time complexity) directly to why vector databases exist.',
          examples: [
            'Knowing that for <10,000 static chunks an exact scan or simple local index suffices, whereas multi-million-chunk production datasets with metadata filters require an indexed vector engine like Qdrant.'
          ]
        },
        whatToLearn: [
          'Compare the computational complexity of exact brute-force k-NN `O(N · D)` against indexed ANN search.',
          'Understand what a vector record stores: `(ID, Vector, Payload/Metadata)`.'
        ],
        resources: [
          {
            id: 'res-p03-13a',
            title: 'Qdrant Documentation — Search Concepts',
            url: 'https://qdrant.tech/documentation/concepts/search/',
            type: 'Official Documentation',
            whyStudy: 'Explains how k-NN and ANN search operate over collections of vector records.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-retrieving-relevant-docs', 'p06-ann-search', 'p06-hnsw']
      },
      {
        id: 'p03-retrieving-relevant-docs',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 14,
        title: 'Retrieving Relevant Documents',
        subtitle: 'Executing top-k queries, score thresholding, and payload hydration',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-vector-search'],
        technologies: ['Top-K Retrieval', 'Score Thresholds', 'Payload Hydration'],
        whatIsIt: [
          'The retrieval step takes the raw user question, encodes it into query vector `q`, executes a top-k similarity search against the vector store, applies optional minimum similarity score thresholds, and returns an ordered list of `RetrievedChunk` objects containing the text passage, similarity score, and source metadata.'
        ],
        whyItExists: [
          'A vector search always returns `k` nearest neighbors—even if the user asks `"What is the recipe for chocolate cake?"` against a Linux kernel documentation database! Setting sensible score thresholds or downstream relevance checks prevents feeding completely unrelated low-score chunks into the prompt.'
        ],
        howItWorks: {
          explanation: [
            'Query the vector index with `limit=k` (typically `k=5` to `10` for baseline RAG) and inspect the returned `(id, score, payload)` tuples.'
          ],
          codeOrFormula: `hits = qdrant_client.query_points(
    collection_name="engineering_docs",
    query=query_vector,
    limit=5,
    score_threshold=0.65,
    with_payload=True
).points`
        },
        practicalRelevance: {
          summary: 'Bridges the vector search engine and the prompt augmentation stage.',
          examples: [
            'Logging the top-k chunk IDs and similarity scores for every user query so you can immediately diagnose whether a bad answer was caused by a retrieval failure or a generation failure.'
          ]
        },
        whatToLearn: [
          'Execute top-k vector retrieval and hydrate chunk text and metadata payloads.',
          'Understand why k-NN always returns k items and how score thresholds behave.'
        ],
        resources: [
          {
            id: 'res-p03-14a',
            title: 'Qdrant — Querying Points & Score Thresholds',
            url: 'https://qdrant.tech/documentation/concepts/search/',
            type: 'Official Documentation',
            whyStudy: 'Demonstrates `query_points`, `limit`, `score_threshold`, and payload retrieval.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-context-augmentation', 'p05-top-k-retrieval']
      },
      {
        id: 'p03-context-augmentation',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 15,
        title: 'Augmenting Prompts with Retrieved Context',
        subtitle: 'Assembling retrieved passages, provenance identifiers, and grounding rules into the LLM prompt',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p01-prompt-templates', 'p03-retrieving-relevant-docs'],
        technologies: ['Context Assembly', 'XML Delimiters', 'Prompt Grounding'],
        whatIsIt: [
          'Context augmentation is the "A" in RAG: taking the top-k retrieved chunks along with their metadata (document title, URL, chunk ID) and formatting them into a structured context block inside the prompt sent to the generative LLM.'
        ],
        whyItExists: [
          'Simply concatenating raw chunk paragraphs without document boundaries or citation IDs makes it impossible for the LLM to know where one source ends and another begins, or which source to cite.'
        ],
        howItWorks: {
          explanation: [
            'Wrap each retrieved chunk in an explicit delimiter block with an index or ID attribute (e.g., `<source id="1" file="auth_spec.md">...</source>`) and separate the `<retrieved_context>` block clearly from the `<user_question>` block.'
          ],
          codeOrFormula: `<system_instruction>
Answer the user's question using ONLY the facts provided in <retrieved_context>.
Cite every factual claim inline using the source ID in brackets, e.g. [1] or [2].
If <retrieved_context> does not contain enough information to answer, state clearly what is missing.
</system_instruction>

<retrieved_context>
<source id="1" doc="qdrant_indexing.md" section="HNSW Parameters">
m defines the maximum number of bidirectional links created for every new element during construction (default 16).
</source>
</retrieved_context>

<user_question>What does the m parameter control in HNSW?</user_question>`
        },
        practicalRelevance: {
          summary: 'Clean context formatting dramatically increases citation accuracy and reduces cross-document confusion.',
          examples: [
            'Including the document publication date in each `<source>` header so the LLM can resolve contradictions in favor of the newer specification.'
          ]
        },
        whatToLearn: [
          'Design context augmentation templates that preserve document boundaries, metadata headers, and citation indices.'
        ],
        resources: [
          {
            id: 'res-p03-15a',
            title: 'Anthropic / Google Prompt Structuring for Grounded RAG',
            url: 'https://ai.google.dev/gemini-api/docs/prompting-strategies',
            type: 'Official Documentation',
            whyStudy: 'Covers structural delimiters and context injection patterns.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-grounded-responses', 'p03-citations-attribution']
      },
      {
        id: 'p03-grounded-responses',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 16,
        title: 'Generating Grounded Responses',
        subtitle: 'Enforcing faithfulness to retrieved context over pre-trained parametric priors',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-parametric-vs-external', 'p03-context-augmentation'],
        technologies: ['Groundedness', 'Faithfulness', 'Low-Temperature Synthesis'],
        whatIsIt: [
          'A response is "grounded" (or faithful) if and only if every factual assertion in the generated answer can be directly entailed from the retrieved context passages provided in the prompt—without the LLM inventing details or extrapolating from outside pre-trained memory.'
        ],
        whyItExists: [
          'Without strict grounding constraints and low temperature (`0.0–0.2`), LLMs naturally blend retrieved facts with plausible-sounding pre-trained speculation, which is dangerous in legal, medical, financial, or technical documentation systems.'
        ],
        howItWorks: {
          explanation: [
            'Combine three controls: (1) explicit negative system constraints ("Do not assume or extrapolate facts not explicitly stated in the sources"), (2) low sampling temperature (`temperature=0.0`), and (3) structured output requiring the model to extract supporting quote spans or citation IDs.'
          ]
        },
        practicalRelevance: {
          summary: 'Groundedness/Faithfulness is one of the core quantitative evaluation metrics you will measure in Phase 07.',
          examples: [
            'Requiring the LLM’s structured response schema to include `supporting_quotes: list[str]` extracted verbatim from the context before generating the final answer.'
          ]
        },
        whatToLearn: [
          'Define groundedness/faithfulness formally as logical entailment from retrieved context.',
          'Apply prompt and schema techniques that force evidence-backed synthesis.'
        ],
        resources: [
          {
            id: 'res-p03-16a',
            title: 'Ragas Documentation — Faithfulness & Groundedness Concept',
            url: 'https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/',
            type: 'Official Documentation',
            whyStudy: 'Defines how faithfulness is formalized and measured in RAG systems.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-citations-attribution', 'p07-faithfulness', 'p07-groundedness']
      },
      {
        id: 'p03-citations-attribution',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 17,
        title: 'Source Attribution and Citations',
        subtitle: 'Linking generated statements back to verifiable document IDs and passage spans',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p01-structured-outputs', 'p03-grounded-responses'],
        technologies: ['Inline Citations', 'Provenance Mapping', 'Structured Citations'],
        whatIsIt: [
          'Source attribution maps each claim in the generated answer to the specific retrieved chunk ID, source document URL, and page/section number from which it was derived.'
        ],
        whyItExists: [
          'Human users cannot trust a technical or enterprise AI assistant unless they can click a citation marker `[1]` and inspect the original source paragraph themselves. Moreover, verifying that cited IDs actually exist in the retrieved set catches fabricated citations.'
        ],
        howItWorks: {
          explanation: [
            'Assign short integer indices `[1]`, `[2]`, ..., `[k]` to the retrieved chunks in the prompt (LLMs cite short integer markers far more accurately than 36-character UUIDs), then map `[1]` back to `chunks[0].doc_id` and `chunks[0].source_uri` in your deterministic Python post-processor.'
          ],
          codeOrFormula: `class CitedSegment(BaseModel):
    statement: str
    source_indices: list[int]  # Maps to [1..k] in retrieved chunks

class RAGResponse(BaseModel):
    answer_markdown: str
    used_source_indices: list[int]`
        },
        practicalRelevance: {
          summary: 'Using integer index mapping (`[1..k]` → deterministic UUID lookup in Python) eliminates hallucinated UUIDs and broken URLs.',
          examples: [
            'Never letting the LLM generate raw URLs from memory; instead having it cite `[1]` and letting Python attach the verified URL from `chunks[0].metadata["url"]`.'
          ]
        },
        whatToLearn: [
          'Implement integer-index citation mapping (`[1..k]` in prompt → deterministic metadata hydration in Python).',
          'Validate post-generation that all cited indices fall within `1..len(retrieved_chunks)`.'
        ],
        resources: [
          {
            id: 'res-p03-17a',
            title: 'Microsoft RAG Guide — Grounding and Citation Patterns',
            url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation',
            type: 'Architecture Guide',
            whyStudy: 'Covers source attribution patterns in production RAG systems.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-grounded-responses', 'p03-unanswerable-questions', 'p10-citation-provenance']
      },
      {
        id: 'p03-unanswerable-questions',
        phaseId: 'phase-03',
        phaseNumber: '03',
        order: 18,
        title: 'Handling Questions That Cannot Be Answered from Retrieved Information',
        subtitle: 'Abstention, insufficient-context detection, and graceful fallback behavior',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-grounded-responses'],
        technologies: ['Abstention', 'Negative Rejection', 'Score Thresholding'],
        whatIsIt: [
          'One of the most critical behaviors of a trustworthy RAG system is Abstention (or Negative Rejection): recognizing when the retrieved context chunks do not contain the answer to the user’s question, and explicitly stating that the knowledge base lacks that information rather than guessing.'
        ],
        whyItExists: [
          'Because instruction-tuned LLMs are trained to be helpful assistants, their default impulse when given weak or tangential context is to "try their best" by guessing from parametric memory—producing dangerous hallucinations disguised as grounded answers.'
        ],
        howItWorks: {
          explanation: [
            'Enforce abstention at two levels:',
            '1. Retrieval Gate: If the highest retrieval similarity score falls below a calibrated floor, short-circuit or flag low confidence.',
            '2. Schema-First Abstention: Include a boolean field `is_answerable_from_context: bool` as the FIRST field in your Pydantic `response_schema`. Because autoregressive generation evaluates fields in order, forcing the model to decide `is_answerable_from_context` before writing `answer` significantly reduces hallucinated answers.'
          ],
          codeOrFormula: `class GroundedRAGOutput(BaseModel):
    reasoning_trace: str = Field(description="Briefly state which source contains the answer, or why none do.")
    is_answerable_from_context: bool
    answer: str
    cited_sources: list[int]`
        },
        practicalRelevance: {
          summary: 'Testing your RAG system on unanswerable out-of-domain questions is a mandatory part of your Phase 07 evaluation dataset.',
          examples: [
            'Returning `"I could not find documentation regarding legacy v1 SOAP endpoints in the indexed knowledge base"` instead of inventing a non-existent endpoint.'
          ]
        },
        whatToLearn: [
          'Design prompts and Pydantic schemas that cleanly separate answerable vs unanswerable queries.',
          'Include negative/unanswerable test cases in your RAG evaluation suite.'
        ],
        resources: [
          {
            id: 'res-p03-18a',
            title: 'Pinecone — Evaluating & Preventing Hallucinations in RAG',
            url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/',
            type: 'Architecture Guide',
            whyStudy: 'Explains how retrieval misses lead to generation hallucinations and how to enforce abstention.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-grounded-responses', 'p07-hallucination-detection']
      }
    ]
  }
];
