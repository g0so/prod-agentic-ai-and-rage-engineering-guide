import React, { useState } from 'react';
import { TopicDiagramSpec } from '../types/curriculum';
import { ArrowRight, RefreshCw, Layers, Cpu, Database, Search, FileText, CheckCircle2 } from 'lucide-react';

const RAG_STAGES = [
  {
    id: 'documents',
    index: '01',
    label: 'DOCUMENTS',
    phase: 'Offline Indexing',
    inputType: 'Raw Files (PDF, MD, HTML)',
    outputType: 'RawDocument(bytes, uri, sha256)',
    underTheHood:
      'Acquires raw unstructured files from repositories or object storage. Computes a deterministic SHA-256 content hash and captures provenance metadata (source_uri, author, updated_at, allowed_roles).',
    payloadSample: `{
  "doc_id": "550e8400-e29b-41d4-a716-446655440000",
  "source_uri": "docs/qdrant_hnsw_tuning.md",
  "sha256": "e3b0c44298fc1c149afbf4c8996fb924...",
  "allowed_roles": ["engineering", "sre"]
}`,
    commonFailureMode: 'Losing original URL, section title, or ACL permissions during raw file loading.'
  },
  {
    id: 'processing',
    index: '02',
    label: 'PROCESSING',
    phase: 'Offline Indexing',
    inputType: 'RawDocument',
    outputType: 'Normalized UTF-8 Markdown',
    underTheHood:
      'Reconstructs multi-column PDF reading order, strips HTML <nav>/<footer> boilerplate, normalizes Unicode (NFKC), repairs hyphenated line breaks, and scrubs accidentally committed secrets or PII.',
    payloadSample: `# Vector Index Configuration > HNSW Parameters
The HNSW graph links each vector to at most m bidirectional neighbors (default m=16).
Increasing ef_construct improves graph recall at build time.`,
    commonFailureMode: 'Scrambled two-column PDF text or repeated page footers polluting every paragraph.'
  },
  {
    id: 'chunking',
    index: '03',
    label: 'CHUNKING',
    phase: 'Offline Indexing',
    inputType: 'Normalized Document',
    outputType: 'list[DocumentChunk] (256–512 tokens)',
    underTheHood:
      'Partitions long documents along structural boundaries (Markdown headers, AST nodes, paragraphs) with a 10–15% token overlap, or links fine-grained Child search chunks to full Parent sections.',
    payloadSample: `{
  "chunk_id": "c9a12b40-1122-5533-8899-aabbccddeeff",
  "parent_id": "sec_hnsw_params_01",
  "token_count": 312,
  "text": "[Doc: Qdrant Tuning | Section: HNSW Parameters]\\nThe m parameter defines..."
}`,
    commonFailureMode: 'Slicing fenced code blocks or Markdown tables in half without repeating column headers.'
  },
  {
    id: 'embeddings',
    index: '04',
    label: 'EMBEDDINGS',
    phase: 'Offline Indexing',
    inputType: 'Chunk Text String',
    outputType: 'Dense float32[768] + Sparse BM25 Vector',
    underTheHood:
      'Passes each chunk through a bidirectional embedding encoder (task_type=RETRIEVAL_DOCUMENT) and L2-normalizes the resulting vector onto the unit hypersphere alongside sparse lexical token weights.',
    payloadSample: `Dense Vector (float32[768], ||v||_2 = 1.0):
[0.0241, -0.0518, 0.1142, 0.0089, -0.0312, ... +763 dims]
Sparse BM25 Vector:
indices: [1042 ("hnsw"), 8819 ("ef_construct"), 412 ("m")]
values:  [2.84, 3.41, 1.92]`,
    commonFailureMode: 'Using different embedding models between indexing time and query time.'
  },
  {
    id: 'vectordb',
    index: '05',
    label: 'VECTOR DATABASE',
    phase: 'Persistent Storage',
    inputType: 'PointStruct(id, vectors, payload)',
    outputType: 'Indexed HNSW Graph + Inverted Payload Index',
    underTheHood:
      'Persists points to the Write-Ahead Log (WAL), inserts vectors into the multi-layer HNSW skip-list proximity graph (with optional INT8 scalar quantization), and indexes payload fields (tenant_id, doc_id).',
    payloadSample: `Qdrant Segment State:
- Vector Index: HNSW (m=16, ef_construct=100, quantization=SQ_INT8)
- Sparse Index: Inverted Posting Lists
- Payload Index: tenant_id (is_tenant=true), allowed_roles (keyword)`,
    commonFailureMode: 'Forgetting to create payload indexes on filtered metadata fields or omitting persistent Docker volumes.'
  },
  {
    id: 'retrieval',
    index: '06',
    label: 'RETRIEVAL',
    phase: 'Online Query Runtime',
    inputType: 'User Query + VerifiedUser Context',
    outputType: 'Top-K Reranked Evidence Chunks',
    underTheHood:
      'Embeds the user query (task_type=RETRIEVAL_QUERY), enforces mandatory RBAC pre-filters, runs parallel Dense + BM25 prefetch fused via RRF (Top 25), and applies a Cross-Encoder Reranker to select the Top 5.',
    payloadSample: `Query: "How does m affect HNSW RAM usage?"
L1 Hybrid RRF (25 hits in 12ms) -> L2 Cross-Encoder Rerank (Top 5 in 48ms):
1. [Score: 0.94] chunk_id=c9a12b40 (HNSW Parameters & Memory Formula)
2. [Score: 0.87] chunk_id=d4f89a11 (Scalar Quantization RAM Savings)`,
    commonFailureMode: 'Relying on dense search alone (missing exact error codes/identifiers) or omitting tenant RBAC filters.'
  },
  {
    id: 'augmentation',
    index: '07',
    label: 'CONTEXT AUGMENTATION',
    phase: 'Online Query Runtime',
    inputType: 'Query + Top-K Ranked Chunks',
    outputType: 'Structured Grounded Prompt',
    underTheHood:
      'Hydrates full Parent sections, assigns monotonic integer citation markers [1]..[k], wraps passages in XML delimiters (<retrieved_context>), and prepends strict grounding and abstention instructions.',
    payloadSample: `<system_instruction>
Answer ONLY using <retrieved_context>. Cite claims as [1], [2].
</system_instruction>
<retrieved_context>
<source id="1" uri="docs/qdrant_hnsw_tuning.md">
Graph RAM overhead scales linearly with m: ~m * 8 bytes per vector.
</source>
</retrieved_context>`,
    commonFailureMode: 'Concatenating raw paragraphs without source boundaries or integer citation IDs.'
  },
  {
    id: 'llm',
    index: '08',
    label: 'LLM',
    phase: 'Online Query Runtime',
    inputType: 'Augmented Prompt + Response Schema',
    outputType: 'Constrained Decoding Token Stream',
    underTheHood:
      'Processes the augmented context in parallel during the compute-bound Prefill phase (populating the KV cache), then autoregressively decodes tokens at low temperature (0.0–0.2) constrained by a Pydantic JSON Schema.',
    payloadSample: `GenerateContentConfig(
  model="gemini-2.5-flash",
  temperature=0.0,
  response_mime_type="application/json",
  response_schema=GroundedRAGOutput
)`,
    commonFailureMode: 'High sampling temperature or unconstrained free-text output allowing parametric hallucination.'
  },
  {
    id: 'answer',
    index: '09',
    label: 'ANSWER',
    phase: 'Online Query Runtime',
    inputType: 'Validated Structured Output',
    outputType: 'Grounded Response + Clickable Provenance',
    underTheHood:
      'Verifies that all cited integer indices [1..k] exist in the authorized Evidence Registry, maps [1] back to verified document URLs and section titles, logs the OpenTelemetry trace, and renders to the user.',
    payloadSample: `{
  "is_answerable_from_context": true,
  "answer": "In HNSW, the m parameter sets max bidirectional links per node; graph RAM overhead grows linearly at roughly m * 8 bytes per vector [1].",
  "citations": [{"id": 1, "uri": "docs/qdrant_hnsw_tuning.md", "section": "HNSW Parameters"}]
}`,
    commonFailureMode: 'Failing to abstain when retrieved chunks do not contain the answer.'
  }
];

const AGENT_STAGES = [
  {
    id: 'user-input',
    index: '01',
    label: 'USER INPUT',
    role: 'Ingress & State Initialization',
    detail: 'User submits a multi-step goal. Host initializes typed AgentState(messages, evidence_registry, step_count=0, budget) and binds caller RBAC permissions into tool closures.',
    traceSample: `User: "Check why payments-api P95 latency spiked today and find the runbook remediation."`
  },
  {
    id: 'model',
    index: '02',
    label: 'MODEL',
    role: 'Reasoning Policy (ReAct)',
    detail: 'The LLM inspects the compiled context window (System Instructions + Tool Schemas + Accumulated Observations) and reasons about what information is currently missing.',
    traceSample: `Model Thought: "I first need to query live telemetry for payments-api to identify the specific error or bottleneck causing the P95 latency spike."`
  },
  {
    id: 'tool-selection',
    index: '03',
    label: 'TOOL SELECTION',
    role: 'Structured Function Call Emission',
    detail: 'Instead of guessing an answer, the model emits one or more structured function_call payloads matching the declared JSON Schemas.',
    traceSample: `function_call: {
  "name": "query_service_metrics_sql",
  "args": { "service": "payments-api", "window_hours": 6 }
}`
  },
  {
    id: 'tool-execution',
    index: '04',
    label: 'TOOL EXECUTION',
    role: 'Deterministic Host Runtime',
    detail: 'Your Python code intercepts the proposal, checks duplicate-call cycle signatures, enforces HITL approval if mutating, validates arguments via Pydantic, and executes with a timeout.',
    traceSample: `Host Runtime: Validated args -> Executed read-only SQL (18ms) -> Registered Evidence [1].`
  },
  {
    id: 'observation',
    index: '05',
    label: 'OBSERVATION',
    role: 'Environmental Feedback',
    detail: 'The host serializes the bounded tool output into a role="tool" (function_response) message and appends it to AgentState.messages.',
    traceSample: `function_response [1]: {
  "p95_latency_ms": 1420,
  "top_error": "PgBouncerPoolExhausted (max_client_conn=100 reached)"
}`
  },
  {
    id: 'next-decision',
    index: '06',
    label: 'NEXT DECISION',
    role: 'Loop Continuation or Stop Check',
    detail: 'Host checks deterministic stop conditions (step_count < max_steps, token_budget). Model inspects the new observation and decides either to loop back to TOOL SELECTION for the next hop or exit.',
    traceSample: `Iteration 2 Decision: Now that observation [1] revealed "PgBouncerPoolExhausted", loop back to call search_runbooks(query="PgBouncerPoolExhausted remediation") -> Returns Evidence [2].`
  },
  {
    id: 'final-response',
    index: '07',
    label: 'FINAL RESPONSE',
    role: 'Terminal Grounded Synthesis',
    detail: 'Once all sub-goals are satisfied in AgentState, the model emits zero tool calls and synthesizes the final response citing [1] (SQL telemetry) and [2] (Runbook doc).',
    traceSample: `Final Answer: "payments-api P95 latency spiked to 1,420ms due to PgBouncerPoolExhausted [1]. Per the Database Runbook [2], increase default_pool_size from 20 to 35 and verify idle transaction timeouts."`
  }
];

const SPECTRUM_LEVELS = [
  {
    level: 'Level 1',
    name: 'Normal LLM Call',
    controlFlow: 'Stateless 1-Pass: Prompt → LLM → Text',
    autonomousLoops: '0 loops (No tools, no external DB)',
    whenToUse: 'Text transformation, summarization of user-pasted text, translation, or zero-shot classification.'
  },
  {
    level: 'Level 2',
    name: 'LLM Application with Tools (Single-Step)',
    controlFlow: 'Prompt → LLM (Select Tool) → Execute Tool → Format Result',
    autonomousLoops: '1 fixed tool dispatch',
    whenToUse: 'Structured data extraction, single weather/calculator/API lookup, or intent routing.'
  },
  {
    level: 'Level 3',
    name: 'Deterministic Workflow (Standard RAG)',
    controlFlow: 'Hardcoded Python DAG: Rewrite → Hybrid Search → Rerank → Synthesize',
    autonomousLoops: 'Fixed sequence written in Python code',
    whenToUse: '80% of production RAG workloads where the sequence of steps (Retrieve → Rerank → Answer) is predictable.'
  },
  {
    level: 'Level 4',
    name: 'Autonomous Single Agent',
    controlFlow: 'Bounded While-Loop: Model dynamically selects tools & iterates on observations',
    autonomousLoops: 'Dynamic 1..N iterations controlled by LLM policy',
    whenToUse: 'Multi-hop investigations, cross-source joining (Vector KB + SQL + Logs), and adaptive query reformulation.'
  },
  {
    level: 'Level 5',
    name: 'Multi-Agent System',
    controlFlow: 'Supervisor / Orchestrator coordinating isolated domain-specialist sub-agents',
    autonomousLoops: 'Hierarchical sub-agent loops (Agents-as-Tools)',
    whenToUse: 'ONLY when tool count exceeds ~15–20 distinct tools or when heavy sub-tasks require isolated context windows.'
  }
];

const HYBRID_SCENARIOS = [
  {
    id: 'exact-code',
    query: 'How do I fix ERR_QDRANT_GRPC_DEADLINE_EXCEEDED during bulk upsert?',
    explanation:
      'Notice why Dense Search alone struggles here: dense embeddings average out the query into a general "database timeout" concept, ranking a generic PostgreSQL timeout doc #1. BM25 locks onto the exact identifier ERR_QDRANT_GRPC_DEADLINE_EXCEEDED, and RRF + Cross-Encoder Reranking places the exact Qdrant gRPC timeout troubleshooting section at Rank #1.',
    candidates: [
      {
        id: 'chunk_104',
        title: 'Qdrant Bulk Upsert & gRPC Timeout Troubleshooting',
        snippet: 'When bulk upserting >500 points, ERR_QDRANT_GRPC_DEADLINE_EXCEEDED occurs if wait=True blocks on HNSW indexing. Increase timeout=60 or batch size=256.',
        denseRank: 4,
        denseScore: 0.76,
        bm25Rank: 1,
        bm25Score: 24.8,
        rrfScore: 1 / 64 + 1 / 61,
        rerankScore: 0.97,
        isRelevant: true
      },
      {
        id: 'chunk_219',
        title: 'PostgreSQL Connection Pool Timeout Guide',
        snippet: 'Database connection deadline timeouts happen when async workers exhaust the pool during bulk inserts.',
        denseRank: 1,
        denseScore: 0.83,
        bm25Rank: 9,
        bm25Score: 4.1,
        rrfScore: 1 / 61 + 1 / 69,
        rerankScore: 0.18,
        isRelevant: false
      },
      {
        id: 'chunk_088',
        title: 'Qdrant Python Client Configuration Reference',
        snippet: 'Configure QdrantClient(prefer_grpc=True, timeout=30.0) to prevent gRPC deadline exceeded errors on large payloads.',
        denseRank: 2,
        denseScore: 0.80,
        bm25Rank: 2,
        bm25Score: 19.4,
        rrfScore: 1 / 62 + 1 / 62,
        rerankScore: 0.92,
        isRelevant: true
      },
      {
        id: 'chunk_301',
        title: 'FastAPI HTTP 504 Gateway Timeout Handling',
        snippet: 'When upstream microservices exceed deadline limits, return a structured retryable error response.',
        denseRank: 3,
        denseScore: 0.78,
        bm25Rank: 12,
        bm25Score: 2.3,
        rrfScore: 1 / 63 + 1 / 72,
        rerankScore: 0.11,
        isRelevant: false
      }
    ]
  },
  {
    id: 'negation-version',
    query: 'Which vector quantization method reduces RAM by 32x using 1-bit sign representations?',
    explanation:
      'Combining conceptual semantics ("vector quantization RAM reduction") with exact numerical tokens ("32x", "1-bit"). Hybrid RRF captures both the quantization section and exact ratio, and the Cross-Encoder verifies the 32x 1-bit relationship.',
    candidates: [
      {
        id: 'chunk_410',
        title: 'Qdrant Binary Quantization (BQ) Internals',
        snippet: 'Binary Quantization converts each float32 coordinate into a 1-bit sign (+1 or -1), achieving a 32x vector memory reduction with ultra-fast XOR Hamming distance.',
        denseRank: 2,
        denseScore: 0.84,
        bm25Rank: 1,
        bm25Score: 21.2,
        rrfScore: 1 / 62 + 1 / 61,
        rerankScore: 0.98,
        isRelevant: true
      },
      {
        id: 'chunk_408',
        title: 'Qdrant Scalar Quantization (SQ8) Guide',
        snippet: 'Scalar Quantization compresses float32 values to int8 (1 byte per dimension), reducing vector memory footprint by 4x (75%) with minimal recall loss.',
        denseRank: 1,
        denseScore: 0.86,
        bm25Rank: 4,
        bm25Score: 11.0,
        rrfScore: 1 / 61 + 1 / 64,
        rerankScore: 0.42,
        isRelevant: false
      },
      {
        id: 'chunk_415',
        title: 'Product Quantization (PQ) Subspace Codebooks',
        snippet: 'Product Quantization divides vectors into sub-vectors and quantizes each subspace using k-means centroids for up to 16x–64x compression.',
        denseRank: 3,
        denseScore: 0.81,
        bm25Rank: 6,
        bm25Score: 8.4,
        rrfScore: 1 / 63 + 1 / 66,
        rerankScore: 0.31,
        isRelevant: false
      }
    ]
  }
];

export const InteractiveDiagram: React.FC<{ spec: TopicDiagramSpec }> = ({ spec }) => {
  const [selectedRagStage, setSelectedRagStage] = useState<number>(0);
  const [selectedAgentStage, setSelectedAgentStage] = useState<number>(0);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [retrievalMode, setRetrievalMode] = useState<'dense' | 'bm25' | 'rrf' | 'rerank'>('rerank');
  const [chunkMode, setChunkMode] = useState<'fixed' | 'structure' | 'parent_child'>('structure');

  if (spec.type === 'rag-pipeline') {
    const active = RAG_STAGES[selectedRagStage];
    return (
      <div className="my-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
              Interactive Architecture Blueprint · 9-Stage RAG Pipeline
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {spec.caption}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            <span>Stage {active.index} of 09</span>
            <span aria-hidden="true">·</span>
            <span>{active.phase}</span>
          </div>
        </div>

        {/* 9-Stage Pipeline Interactive Strip */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 mb-5">
          {RAG_STAGES.map((st, idx) => {
            const isSelected = idx === selectedRagStage;
            const isOffline = idx < 5;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedRagStage(idx)}
                className={`text-left p-2.5 rounded border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                    : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-500/50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums opacity-80">
                  <span>{st.index}</span>
                  <span>{isOffline ? 'IDX' : 'QRY'}</span>
                </div>
                <div className="text-[11px] font-semibold leading-tight mt-1 truncate">
                  {st.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-4">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>STAGE {active.index}</span>
              <span aria-hidden="true">·</span>
              <span className="text-sky-600 dark:text-sky-400 font-semibold">{active.label}</span>
              <span aria-hidden="true">·</span>
              <span>{active.phase}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {active.underTheHood}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">INPUT CONTRACT</div>
                <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{active.inputType}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">OUTPUT CONTRACT</div>
                <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{active.outputType}</div>
              </div>
            </div>
            <div className="p-2.5 rounded bg-amber-500/5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-semibold">Production Failure Mode to Prevent: </span>
              {active.commonFailureMode}
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5">
              Live Data Transformation Snapshot
            </div>
            <pre className="flex-1 text-xs font-mono bg-slate-900 text-slate-100 p-3.5 rounded border border-slate-800 overflow-x-auto leading-relaxed">
              {active.payloadSample}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (spec.type === 'agent-loop') {
    const active = AGENT_STAGES[selectedAgentStage];
    return (
      <div className="my-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
              Interactive Agent Control Loop & Architecture Spectrum
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {spec.caption}
            </h4>
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            Step {active.index} of 07
          </div>
        </div>

        {/* 7-Stage Agent Loop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {AGENT_STAGES.map((st, idx) => {
            const isSelected = idx === selectedAgentStage;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedAgentStage(idx)}
                className={`text-left p-2.5 rounded border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-500/50'
                }`}
              >
                <div className="text-[11px] font-mono tabular-nums opacity-75">
                  {st.index} {idx >= 1 && idx <= 5 ? '↻ LOOP' : ''}
                </div>
                <div className="text-xs font-semibold mt-1 truncate">{st.label}</div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-4">
          <div className="lg:col-span-6 space-y-2">
            <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
              {active.index}. {active.label} — {active.role}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {active.detail}
            </p>
          </div>
          <div className="lg:col-span-6">
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
              Runtime Execution Trace
            </div>
            <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-3 rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap">
              {active.traceSample}
            </pre>
          </div>
        </div>

        {/* 5-Level Architectural Spectrum Comparison Table */}
        <div>
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Architectural Spectrum: Normal LLM Call vs Workflows vs Autonomous Agents
          </div>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono">
                <tr>
                  <th className="py-2 px-3">Tier</th>
                  <th className="py-2 px-3">Architecture Pattern</th>
                  <th className="py-2 px-3">Control Flow Owner</th>
                  <th className="py-2 px-3">When Justified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {SPECTRUM_LEVELS.map((row) => (
                  <tr key={row.level}>
                    <td className="py-2 px-3 font-mono whitespace-nowrap text-sky-600 dark:text-sky-400">
                      {row.level}
                    </td>
                    <td className="py-2 px-3 font-semibold whitespace-nowrap">{row.name}</td>
                    <td className="py-2 px-3 font-mono text-[11px]">{row.controlFlow}</td>
                    <td className="py-2 px-3">{row.whenToUse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (spec.type === 'hybrid-retrieval') {
    const scenario = HYBRID_SCENARIOS[selectedScenarioIdx];
    const sortedCandidates = [...scenario.candidates].sort((a, b) => {
      if (retrievalMode === 'dense') return a.denseRank - b.denseRank;
      if (retrievalMode === 'bm25') return a.bm25Rank - b.bm25Rank;
      if (retrievalMode === 'rrf') return b.rrfScore - a.rrfScore;
      return b.rerankScore - a.rerankScore;
    });

    return (
      <div className="my-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
              Interactive Retrieval Ranking Simulator · Dense vs BM25 vs RRF vs Cross-Encoder Reranker
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {spec.caption}
            </h4>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-md">
            {(
              [
                { id: 'dense', label: 'Dense Only' },
                { id: 'bm25', label: 'BM25 Lexical' },
                { id: 'rrf', label: 'Hybrid RRF' },
                { id: 'rerank', label: 'Hybrid + Reranker' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRetrievalMode(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  retrievalMode === tab.id
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Test Query:</span>
          {HYBRID_SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioIdx(idx)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors text-left cursor-pointer ${
                selectedScenarioIdx === idx
                  ? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400'
              }`}
            >
              {sc.query}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800">
          {scenario.explanation}
        </p>

        <div className="space-y-2">
          {sortedCandidates.map((cand, rankIdx) => (
            <div
              key={cand.id}
              className={`p-3 rounded border bg-white dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                cand.isRelevant
                  ? 'border-emerald-500/40'
                  : 'border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    Rank #{rankIdx + 1}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-500">{cand.id}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      cand.isRelevant
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-slate-500'
                    }
                  >
                    {cand.isRelevant ? '✓ Ground-Truth Relevant' : '× Distractor Passage'}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {cand.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{cand.snippet}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 text-right font-mono text-xs tabular-nums border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-900">
                <div>
                  <div className="text-[10px] text-slate-400">DENSE</div>
                  <div>
                    #{cand.denseRank} ({cand.denseScore.toFixed(2)})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">BM25</div>
                  <div>
                    #{cand.bm25Rank} ({cand.bm25Score.toFixed(1)})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">RRF (k=60)</div>
                  <div>{cand.rrfScore.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-sky-500">RERANKER</div>
                  <div className="font-semibold text-sky-600 dark:text-sky-400">
                    {cand.rerankScore.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: Chunking strategies visual explorer
  return (
    <div className="my-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
            Interactive Chunking Boundary Explorer
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {spec.caption}
          </h4>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-md">
          {(
            [
              { id: 'fixed', label: 'Naive Fixed-Size' },
              { id: 'structure', label: 'Structure-Aware + Recursive' },
              { id: 'parent_child', label: 'Parent-Child (Small-to-Big)' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setChunkMode(tab.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                chunkMode === tab.id
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {chunkMode === 'fixed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-white dark:bg-slate-950 border border-amber-500/40 space-y-1.5">
            <div className="text-amber-600 dark:text-amber-400 font-semibold">
              Chunk 1 (Fixed 150 chars — Notice mid-code cut!)
            </div>
            <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {`## HNSW Tuning\nTo configure Qdrant HNSW graph degree, set m=32:\n\`\`\`python\nclient.create_collection(\n    vectors_config=VectorParams(size=768, hnsw=`}
            </pre>
          </div>
          <div className="p-3 rounded bg-white dark:bg-slate-950 border border-amber-500/40 space-y-1.5">
            <div className="text-amber-600 dark:text-amber-400 font-semibold">
              Chunk 2 (Orphaned code suffix without header context!)
            </div>
            <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {`HnswConfigDiff(m=32, ef_construct=200))\n)\n\`\`\`\nHigher m increases recall but consumes more RAM per vector.`}
            </pre>
          </div>
        </div>
      )}

      {chunkMode === 'structure' && (
        <div className="p-3.5 rounded bg-white dark:bg-slate-950 border border-emerald-500/40 space-y-1.5 text-xs font-mono">
          <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Structure-Aware Atomic Chunk (Header Breadcrumb Prepended + Fenced Code Block Kept Intact)
          </div>
          <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {`[Doc: Qdrant Architecture | Section: HNSW Tuning]\nTo configure Qdrant HNSW graph degree, set m=32:\n\`\`\`python\nclient.create_collection(\n    vectors_config=VectorParams(size=768, hnsw=HnswConfigDiff(m=32, ef_construct=200))\n)\n\`\`\`\nHigher m increases recall but consumes more RAM per vector.`}
          </pre>
        </div>
      )}

      {chunkMode === 'parent_child' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs font-mono">
          <div className="md:col-span-5 p-3 rounded bg-white dark:bg-slate-950 border border-sky-500/40 space-y-1.5">
            <div className="text-sky-600 dark:text-sky-400 font-semibold">
              Child Vector Chunk (180 tokens — Indexed in Qdrant)
            </div>
            <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {`id: "child_09_2"\nparent_id: "parent_sec_09"\ntext: "[HNSW Tuning] Higher m (e.g., 32) increases graph degree and recall on high-dimensional embeddings, adding ~m*8 bytes RAM per vector."`}
            </pre>
          </div>
          <div className="md:col-span-7 p-3 rounded bg-white dark:bg-slate-950 border border-emerald-500/40 space-y-1.5">
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Dereferenced Parent Section (950 tokens — Sent to LLM Prompt)
            </div>
            <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {`parent_id: "parent_sec_09"\nFull Markdown section including prose explanation, complete Python create_collection code snippet, AND the m vs ef_construct memory comparison table!`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
