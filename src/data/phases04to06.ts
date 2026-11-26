import { CurriculumPhase } from '../types/curriculum';

const DEFAULT_CHECKLIST = [
  'Understand the core concept and engineering motivation.',
  'Study the recommended primary resource or documentation.',
  'Explain the underlying mechanism, advantages, and trade-offs without notes.',
  'Understand where and why this pattern is used in production AI systems.',
  'Implement or trace a concrete example verifying the behavior.'
];

export const PHASES_04_TO_06: CurriculumPhase[] = [
  {
    id: 'phase-04',
    number: '04',
    title: 'Document Processing and Ingestion',
    shortTitle: 'Ingestion & Chunking',
    objective: 'Learn how messy real-world documents are transformed, chunked, deduplicated, versioned, and maintained in a searchable knowledge base.',
    description: 'Master the complete data engineering layer of RAG: multi-format extraction, structural vs semantic chunking trade-offs, parent-child hierarchical indexing, incremental upserts, and ACL metadata attachment.',
    milestone: 'Build an idempotent ingestion pipeline that processes Markdown, HTML, and PDF documents, preserves hierarchical metadata, detects duplicates via content hashes, and supports incremental updates.',
    topics: [
      {
        id: 'p04-doc-loaders',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 1,
        title: 'Document Loaders',
        subtitle: 'Adapter architecture for reading heterogeneous data sources into a unified Document representation',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-doc-ingestion'],
        technologies: ['Python Generators', 'Adapter Pattern', 'MIME Detection'],
        whatIsIt: [
          'A Document Loader is an ingestion adapter that connects to a specific storage medium (local filesystem, S3 bucket, Git repository, REST API) and yields standardized `RawDocument` objects containing extracted content and source metadata.',
          'Rather than coupling your chunker directly to file extensions, loaders implement a uniform Python `Protocol` or iterator interface (`def load() -> Iterator[RawDocument]:`).'
        ],
        whyItExists: [
          'Enterprise knowledge never lives in clean `.txt` files. It spans Markdown docs, PDFs, HTML wiki pages, and API payloads. Loaders isolate format-specific I/O and streaming memory management from downstream chunking.'
        ],
        howItWorks: {
          explanation: [
            'Use Python generators (`yield`) so loading a 10GB corpus processes one file at a time in O(1) memory rather than loading all documents into a single list in RAM.'
          ],
          codeOrFormula: `from typing import Iterator, Protocol

class DocumentLoader(Protocol):
    def lazy_load(self) -> Iterator[RawDocument]: ...`
        },
        practicalRelevance: {
          summary: 'Prevents Out-Of-Memory (OOM) crashes during large batch ingestion jobs.',
          examples: [
            'Streaming Markdown and PDF documents from a Git repository via a generator pipeline into the chunker.'
          ]
        },
        whatToLearn: [
          'Design memory-efficient generator-based document loaders (`lazy_load`).',
          'Route files by MIME type to specialized format parsers.'
        ],
        resources: [
          {
            id: 'res-p04-1a',
            title: 'Pinecone — Data Ingestion & Preparation for RAG',
            url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/',
            type: 'Architecture Guide',
            whyStudy: 'Covers architectural patterns for decoupling loaders from chunkers and embedders.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-pdf-processing', 'p04-html-markdown']
      },
      {
        id: 'p04-pdf-processing',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 2,
        title: 'PDF Processing',
        subtitle: 'Why PDFs are visual page-layout instructions rather than semantic text streams',
        difficulty: 'Intermediate',
        estimatedEffort: '1 hour',
        prerequisites: ['p04-doc-loaders'],
        technologies: ['PyMuPDF (fitz)', 'pypdf', 'Docling', 'OCR'],
        whatIsIt: [
          'Unlike HTML or Markdown, a PDF is not a structured text document—it is a compiled PostScript-derived vector graphics canvas that places individual glyphs at `(x, y)` page coordinates. Processing PDFs requires reconstructing reading order, paragraphs, headings, and multi-column layouts from coordinate bounding boxes (or running OCR on scanned image PDFs).'
        ],
        whyItExists: [
          'Naive PDF text extractors read glyphs strictly in top-to-bottom Y-coordinate order, which scrambles two-column academic papers by merging line 1 of Column A directly into line 1 of Column B!'
        ],
        howItWorks: {
          explanation: [
            'Advantages of Fast Digital Extractors (`PyMuPDF` / `pypdf`): Extremely fast (hundreds of pages/sec) for single-column digital PDFs, preserves page numbers.',
            'Disadvantages: Struggles with complex multi-column layouts, embedded financial tables, and scanned images.',
            'When to use Layout-Aware / Vision Parsers (`Docling`, multimodal PDF parsing): When documents contain multi-column layouts, complex tables, or diagrams where layout order determines meaning.'
          ]
        },
        practicalRelevance: {
          summary: 'Broken PDF extraction is one of the top hidden causes of poor RAG accuracy in enterprise deployments.',
          examples: [
            'Converting PDFs to structured Markdown via PyMuPDF4LLM or Docling prior to chunking so section headers and tables remain intact.'
          ]
        },
        whatToLearn: [
          'Understand why PDF glyph coordinates complicate text extraction.',
          'Compare fast bounding-box extractors (`PyMuPDF`) against layout-aware parsers (`Docling`).',
          'Always extract and attach `page_number` metadata to every chunk derived from a PDF.'
        ],
        resources: [
          {
            id: 'res-p04-2a',
            title: 'PyMuPDF Official Documentation — Text Extraction & Layout',
            url: 'https://pymupdf.readthedocs.io/en/latest/',
            type: 'Official Documentation',
            whyStudy: 'High-performance C-backed Python library for extracting text blocks, coordinates, and metadata from PDFs.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-text-extraction', 'p04-tables-complex-docs']
      },
      {
        id: 'p04-html-markdown',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 3,
        title: 'HTML and Markdown Processing',
        subtitle: 'Leveraging DOM trees and Markdown ASTs to preserve semantic hierarchy',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p04-doc-loaders'],
        technologies: ['BeautifulSoup4', 'Markdown AST', 'DOM Pruning'],
        whatIsIt: [
          'HTML and Markdown documents explicitly encode semantic hierarchy through DOM tags (`<article>`, `<h1>`–`<h4>`, `<table>`, `<pre><code>`) or Markdown heading markers (`#`, `##`, `###`). Processing them involves pruning non-content chrome (`<nav>`, `<aside>`, `<footer>`, `<script>`) while preserving the heading breadcrumb tree.'
        ],
        whyItExists: [
          'Flattening an HTML or Markdown page into plain text throws away its hierarchical outline (`H1 > H2 > H3`), which is the best natural signal for where to split chunks and what topic each paragraph belongs to.'
        ],
        howItWorks: {
          explanation: [
            'Parse HTML into a DOM tree, remove boilerplate selectors, and convert the main `<article>` or `<main>` content into clean Markdown while tracking the active heading path `[H1, H2, H3]` as metadata.'
          ]
        },
        practicalRelevance: {
          summary: 'Markdown is the ideal intermediate representation (IR) for RAG ingestion pipelines.',
          examples: [
            'Converting HTML technical docs into Markdown and attaching `section_path: "Vector Index > HNSW > Tuning Parameters"` to every chunk.'
          ]
        },
        whatToLearn: [
          'Strip HTML boilerplate tags while preserving headings, lists, tables, and fenced code blocks.',
          'Use Markdown as a canonical intermediate document format.'
        ],
        resources: [
          {
            id: 'res-p04-3a',
            title: 'BeautifulSoup4 Official Documentation',
            url: 'https://www.crummy.com/software/BeautifulSoup/bs4/doc/',
            type: 'Official Documentation',
            whyStudy: 'Standard Python library for traversing, filtering, and cleaning HTML/XML DOM trees.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-structure-aware-chunking', 'p04-doc-metadata']
      },
      {
        id: 'p04-text-extraction',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 4,
        title: 'Text Extraction',
        subtitle: 'Character encodings, fallback pipelines, and verification of extracted text quality',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p04-pdf-processing', 'p04-html-markdown'],
        technologies: ['UTF-8', 'Encoding Detection', 'Quality Heuristics'],
        whatIsIt: [
          'Text extraction is the conversion of binary file streams into valid UTF-8 strings, coupled with automated quality verification heuristics (detecting garbled font encodings, empty OCR scans, or binary noise).'
        ],
        whyItExists: [
          'Many legacy PDFs use custom embedded font glyph maps that extract as unreadable garbage (`"\\ufffd\\ufffd\\x00"`), silently poisoning your vector database with useless vectors if not caught during extraction.'
        ],
        howItWorks: {
          explanation: [
            'Compute printable alphanumeric ratio and character entropy on extracted pages; flag or quarantine pages whose alphanumeric ratio falls below a threshold (e.g., <0.4) for OCR fallback.'
          ]
        },
        practicalRelevance: {
          summary: 'Prevents silent indexing of empty scanned PDFs or corrupted character encodings.',
          examples: [
            'Detecting that a 20-page PDF yielded only 15 characters of text and automatically routing it to an OCR/vision extraction queue.'
          ]
        },
        whatToLearn: [
          'Implement extraction quality gates (minimum character length, printable ratio, replacement character checks).'
        ],
        resources: [
          {
            id: 'res-p04-4a',
            title: 'Python Unicode HOWTO',
            url: 'https://docs.python.org/3/howto/unicode.html',
            type: 'Official Documentation',
            whyStudy: 'Foundational reference on UTF-8 byte decoding and error handling in Python.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-data-cleaning', 'p04-pdf-processing']
      },
      {
        id: 'p04-data-cleaning',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 5,
        title: 'Data Cleaning and Normalization',
        subtitle: 'Eliminating noise without destroying technical tokens, code indentation, or identifiers',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p04-text-extraction'],
        technologies: ['Regex', 'NFKC Normalization', 'Boilerplate Deduplication'],
        whatIsIt: [
          'In classic NLP, "text cleaning" often meant lowercasing, stemming, and stripping punctuation. In modern LLM & RAG engineering, you must NEVER lowercase or strip punctuation/indentation—because casing, punctuation, and indentation carry critical semantic meaning in source code, acronyms, and prose!',
          'Instead, RAG data cleaning focuses on NFKC Unicode normalization, de-hyphenating line breaks (`"retriev-\\nal"` → `"retrieval"`), stripping repeated page headers/footers, and collapsing redundant blank lines.'
        ],
        whyItExists: [
          'Pretrained subword tokenizers (BPE) are case-sensitive and punctuation-aware. Aggressive classical NLP preprocessing ruins code blocks and degrades modern Transformer embeddings.'
        ],
        howItWorks: {
          explanation: [
            'Apply non-destructive normalization: preserve case, preserve Markdown structural markers (`#`, ```, `|`), and remove only extraction artifacts.'
          ],
          codeOrFormula: `import re, unicodedata

def clean_extracted_text(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"(\\w)-\\n(\\w)", r"\\1\\2", text)  # Fix PDF line-break hyphens
    text = re.sub(r"\\n{3,}", "\\n\\n", text)         # Collapse 3+ newlines to 2
    return text.strip()`
        },
        practicalRelevance: {
          summary: 'Protects code blocks, CLI flags, and technical identifiers from destructive classical NLP cleaning.',
          examples: [
            'Keeping `--max-connections=16` intact while removing repeated `"Page 14 of 88"` footers.'
          ]
        },
        whatToLearn: [
          'Explain why classical NLP stemming/lowercasing harms Transformer embeddings.',
          'Write non-destructive normalization functions for technical documents.'
        ],
        resources: [
          {
            id: 'res-p04-5a',
            title: 'Pinecone — Data Cleaning for Vector Embeddings',
            url: 'https://www.pinecone.io/learn/chunking-strategies/',
            type: 'Architecture Guide',
            whyStudy: 'Explains how text formatting and noise impact subword tokenizers and embedding vectors.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-doc-processing', 'p04-doc-metadata']
      },
      {
        id: 'p04-doc-metadata',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 6,
        title: 'Document Metadata',
        subtitle: 'Designing payload schemas for filtering, provenance citations, and temporal ranking',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-doc-ingestion'],
        technologies: ['Payload Schema', 'Metadata Injection', 'Provenance'],
        whatIsIt: [
          'Document metadata is the structured key-value dictionary attached to every document and inherited by every chunk derived from that document: `doc_id`, `source_uri`, `title`, `section_hierarchy`, `page_number`, `author`, `created_at`, `updated_at`, `version`, `tags`, and `allowed_roles`.'
        ],
        whyItExists: [
          'Pure vector similarity cannot efficiently enforce hard boolean constraints like `"Only search documents from product=Qdrant AND version>=1.10 AND tenant_id=org_42"`. Structured metadata enables pre-filtering in the vector database and provides the exact fields needed to render citations.'
        ],
        howItWorks: {
          explanation: [
            'Store metadata in two places during chunk preparation: (1) inside the structured `payload` JSON dictionary stored alongside the vector in Qdrant (for deterministic filtering and UI citation display), and (2) prepend a concise header string (`[Doc: Title | Section: Heading]`) directly to the chunk text before embedding so the vector itself captures document context.'
          ]
        },
        practicalRelevance: {
          summary: 'Contextual header prepending + structured payload fields is one of the highest-leverage techniques in production RAG.',
          examples: [
            'Prepending `[Service: Auth API | Section: Rate Limits]` to chunk text before embedding while storing `{"service": "auth-api", "updated_at": 1732512000}` in the Qdrant payload.'
          ]
        },
        whatToLearn: [
          'Design a comprehensive metadata schema for document chunks.',
          'Distinguish between payload metadata (for database filtering) and contextual header injection (for embedding representation).'
        ],
        resources: [
          {
            id: 'res-p04-6a',
            title: 'Qdrant Documentation — Payloads and Metadata',
            url: 'https://qdrant.tech/documentation/concepts/payload/',
            type: 'Official Documentation',
            whyStudy: 'Details supported metadata payload data types (keyword, integer, datetime, geo) and indexing.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-metadata-filtering', 'p06-payloads-metadata', 'p11-doc-permissions']
      },
      {
        id: 'p04-chunking-strategies',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 7,
        title: 'Chunking Strategies Overview',
        subtitle: 'Evaluating the trade-off matrix across Fixed, Recursive, Structure-Aware, Semantic, and Parent-Child chunking',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-text-chunking'],
        technologies: ['Chunking Trade-offs', 'Granularity vs Context'],
        whatIsIt: [
          'There is no single universal chunking algorithm for all data types. A chunking strategy defines how document boundaries, token budgets, and hierarchical relationships are used to partition documents into indexable units.'
        ],
        whyItExists: [
          'A chunking strategy that works for uniform prose paragraphs fails miserably if it slices a 40-line Python function or a Markdown comparison table in half.'
        ],
        howItWorks: {
          explanation: [
            'Evaluate every chunking strategy across four engineering dimensions: (1) Semantic Coherence (does a chunk contain one complete thought?), (2) Boundary Integrity (does it avoid cutting sentences, code blocks, or tables mid-unit?), (3) Computational Cost at Ingestion, and (4) Retrieval vs Synthesis Context Window balance.'
          ],
          diagram: {
            type: 'chunking-strategies',
            caption: 'Interactive Chunking Strategy Comparator: Compare Fixed-Size, Recursive Structure-Aware, and Parent-Child strategies.'
          }
        },
        practicalRelevance: {
          summary: 'Sets up the comparative framework for the next six topics in Phase 04.',
          examples: [
            'Selecting Structure-Aware + Recursive chunking as the fast, reliable production baseline before experimenting with high-cost Semantic chunking.'
          ]
        },
        whatToLearn: [
          'Compare the 5 major chunking paradigms by ingestion cost, latency, and retrieval fidelity.'
        ],
        resources: [
          {
            id: 'res-p04-7a',
            title: 'Pinecone — Chunking Strategies for LLM Applications',
            url: 'https://www.pinecone.io/learn/chunking-strategies/',
            type: 'Architecture Guide',
            whyStudy: 'Comprehensive comparative analysis of fixed, recursive, structural, and semantic chunking.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-fixed-chunking', 'p04-recursive-chunking', 'p04-structure-aware-chunking', 'p04-semantic-chunking']
      },
      {
        id: 'p04-fixed-chunking',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 8,
        title: 'Fixed-Size Chunking',
        subtitle: 'Deterministic token-window partitioning: advantages, disadvantages, and appropriate use cases',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p04-chunking-strategies'],
        technologies: ['Token Windows', 'Sliding Window'],
        whatIsIt: [
          'Fixed-size chunking tokenizes the input text into an array of token IDs and slices it into uniform windows of exactly `N` tokens (e.g., 512 tokens) with an overlap of `O` tokens (e.g., 64 tokens), regardless of sentence or paragraph boundaries.'
        ],
        whyItExists: [
          'Provides the simplest O(N) baseline when input data lacks structural formatting (e.g., raw continuous ASR audio transcripts or unformatted log dumps).'
        ],
        howItWorks: {
          explanation: [
            'Advantages: Zero structural parsing assumptions, strictly predictable token counts (never overflows embedding model window), trivial O(N) CPU execution.',
            'Disadvantages: Frequently slices sentences, code blocks, and list items right in the middle, leaving broken half-sentences at the start and end of chunks.',
            'When Appropriate: Unpunctuated speech transcripts or as a fallback when no structural delimiters exist.'
          ]
        },
        practicalRelevance: {
          summary: 'Serves as the fallback base case inside recursive splitters when a single block exceeds the maximum token limit.',
          examples: [
            'Falling back to fixed-token slicing only when a single unformatted paragraph exceeds 1,024 tokens.'
          ]
        },
        whatToLearn: [
          'State the exact advantages, disadvantages, and appropriate use cases of fixed-size chunking.'
        ],
        resources: [
          {
            id: 'res-p04-8a',
            title: 'Pinecone — Fixed-Size Chunking Trade-offs',
            url: 'https://www.pinecone.io/learn/chunking-strategies/',
            type: 'Architecture Guide',
            whyStudy: 'Demonstrates boundary fragmentation issues with naive fixed-size windows.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-recursive-chunking', 'p04-chunk-overlap']
      },
      {
        id: 'p04-recursive-chunking',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 9,
        title: 'Recursive Chunking',
        subtitle: 'Hierarchical separator splitting from paragraphs down to sentences and words',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p04-fixed-chunking'],
        technologies: ['Recursive Character/Token Splitting', 'Divide and Conquer'],
        whatIsIt: [
          'Recursive chunking applies a divide-and-conquer algorithm over an ordered hierarchy of syntactic separators—typically `["\\n\\n", "\\n", ". ", " ", ""]`. It first splits text by double newlines (paragraphs) and greedily merges adjacent paragraphs until approaching `max_tokens`. If any single paragraph exceeds `max_tokens`, it recursively splits that paragraph using the next separator in the hierarchy (single newline, then sentence period).'
        ],
        whyItExists: [
          'Preserves natural human writing boundaries (paragraphs and complete sentences) while still guaranteeing that no output chunk ever exceeds the target `max_tokens` ceiling.'
        ],
        howItWorks: {
          explanation: [
            'Advantages: Fast O(N) CPU execution, respects paragraph and sentence boundaries, produces uniform-sized chunks without mid-sentence cuts.',
            'Disadvantages: Blind to higher-level document semantics (does not know if a `\\n` is inside a fenced code block or a Markdown table unless paired with structure-aware pre-splitting).',
            'When Appropriate: The universal general-purpose baseline for prose articles, reports, and plain-text documents.'
          ],
          codeOrFormula: `SEPARATORS = ["\\n\\n", "\\n", ". ", " "]
# 1. Split by highest-priority separator sep[0]
# 2. If any piece > max_tokens, recursively call split(piece, sep[1:])
# 3. Greedily merge adjacent pieces <= max_tokens with target overlap`
        },
        practicalRelevance: {
          summary: 'From an algorithms standpoint, recursive splitting is a clean greedy tree-partitioning algorithm you can implement in 35 lines of Python.',
          examples: [
            'Using recursive splitting within each Markdown section after structure-aware header splitting.'
          ]
        },
        whatToLearn: [
          'Implement recursive hierarchical text splitting in Python.',
          'Explain why recursive splitting outperforms fixed-size splitting on prose.'
        ],
        resources: [
          {
            id: 'res-p04-9a',
            title: 'Pinecone — Recursive Chunking Implementation Guide',
            url: 'https://www.pinecone.io/learn/chunking-strategies/',
            type: 'Architecture Guide',
            whyStudy: 'Explains separator hierarchies and greedy merging mechanics.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-structure-aware-chunking', 'p04-chunk-overlap']
      },
      {
        id: 'p04-structure-aware-chunking',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 10,
        title: 'Structure-Aware Chunking',
        subtitle: 'Splitting by Markdown headers, AST nodes, and code syntax boundaries',
        difficulty: 'Intermediate',
        estimatedEffort: '1 hour',
        prerequisites: ['p04-html-markdown', 'p04-recursive-chunking'],
        technologies: ['Markdown AST', 'Tree-sitter (AST)', 'Header Hierarchy'],
        whatIsIt: [
          'Structure-aware chunking parses the formal grammar of the document—such as Markdown heading levels (`# H1`, `## H2`, `### H3`), HTML DOM sections, or source code Abstract Syntax Trees (AST via `tree-sitter`)—so that splits occur strictly at logical section or function boundaries, and never split a fenced code block (` ``` `) or table in half.'
        ],
        whyItExists: [
          'In technical documentation and source code, splitting a code snippet or an API reference table mid-block renders both halves syntactically invalid and useless to the LLM.'
        ],
        howItWorks: {
          explanation: [
            '1. First pass: Split document into logical sections by Markdown headers (`#`, `##`, `###`), capturing the breadcrumb trail `["Phase 6", "HNSW", "Parameters"]` in metadata.',
            '2. Second pass: Keep atomic blocks (fenced code blocks and tables) indivisible; apply recursive paragraph splitting only to oversized prose blocks within a section.',
            'Advantages: High semantic fidelity, zero broken code blocks, automatic section breadcrumb metadata.',
            'Disadvantages: Requires format-specific parsers (Markdown/HTML/AST).',
            'When Appropriate: The gold standard for technical documentation, API manuals, wikis, and source code repositories.'
          ]
        },
        practicalRelevance: {
          summary: 'For your Capstone Agentic Knowledge Assistant over technical documentation, Structure-Aware + Recursive chunking is the highest-ROI strategy.',
          examples: [
            'Chunking Python source files by AST `ClassDef` and `FunctionDef` nodes so complete functions are retrieved intact.'
          ]
        },
        whatToLearn: [
          'Implement two-stage Markdown header + atomic block (code/table) chunking.',
          'Propagate heading breadcrumb trails into every chunk’s text header and metadata payload.'
        ],
        resources: [
          {
            id: 'res-p04-10a',
            title: 'Pinecone — Document-Specific & Structure-Aware Chunking',
            url: 'https://www.pinecone.io/learn/chunking-strategies/',
            type: 'Architecture Guide',
            whyStudy: 'Covers Markdown, HTML, and source-code AST chunking techniques.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-html-markdown', 'p04-tables-complex-docs']
      },
      {
        id: 'p04-semantic-chunking',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 11,
        title: 'Semantic Chunking',
        subtitle: 'Detecting topic shifts via sliding sentence-embedding cosine distance breakpoints',
        difficulty: 'Advanced',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-cosine-similarity', 'p04-recursive-chunking'],
        technologies: ['Embedding Breakpoints', 'Percentile Thresholding'],
        isOptionalOrAdvanced: true,
        whatIsIt: [
          'Semantic chunking splits text into individual sentences, embeds small sliding windows of sentences (e.g., 3-sentence groups), computes the cosine distance between consecutive sentence windows `d_i = 1 - cos(e_i, e_{i+1})`, and places a chunk boundary wherever the cosine distance exceeds a statistical threshold (such as the 90th percentile of distances in the document).'
        ],
        whyItExists: [
          'When a long document lacks reliable headings or paragraph breaks (e.g., a continuous 60-minute lecture transcript), syntactic newline splitters cannot detect where the speaker transitioned from one topic to another.'
        ],
        howItWorks: {
          explanation: [
            'Advantages: Finds genuine semantic topic transitions even in unformatted text streams.',
            'Disadvantages: Requires running an embedding model on every individual sentence BEFORE even creating the final chunks—increasing ingestion compute cost and latency by 5x–10x. On well-structured Markdown/HTML docs, it rarely beats structure-aware header chunking.',
            'When Appropriate: Long unformatted transcripts or multi-topic streams lacking structural markup.'
          ]
        },
        practicalRelevance: {
          summary: 'Understand how it works and why engineering teams benchmark its 10x ingestion cost against structure-aware chunking before adopting it.',
          examples: [
            'Using semantic breakpoint detection on raw podcast/meeting transcripts while keeping fast structure-aware chunking for Markdown docs.'
          ]
        },
        whatToLearn: [
          'Explain the sliding sentence-window cosine distance breakpoint algorithm.',
          'Evaluate the ingestion cost/latency trade-off of semantic chunking vs structure-aware chunking.'
        ],
        resources: [
          {
            id: 'res-p04-11a',
            title: 'Pinecone — Semantic Chunking Analysis',
            url: 'https://www.pinecone.io/learn/chunking-strategies/',
            type: 'Architecture Guide',
            whyStudy: 'Explains embedding-based breakpoint detection and its practical cost/benefit trade-offs.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-structure-aware-chunking', 'p04-parent-child-retrieval']
      },
      {
        id: 'p04-chunk-overlap',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 12,
        title: 'Chunk Overlap',
        subtitle: 'Preventing boundary context severing and tuning the 10–15% overlap ratio',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p03-text-chunking', 'p04-recursive-chunking'],
        technologies: ['Sliding Window Stride', 'Overlap Ratio'],
        whatIsIt: [
          'Chunk overlap repeats the trailing `O` tokens (or trailing 1–2 sentences) of Chunk `i` as the leading prefix of Chunk `i + 1`.'
        ],
        whyItExists: [
          'Without overlap (`O = 0`), an explanation whose premise lands at the bottom of Chunk `i` and whose conclusion lands at the top of Chunk `i + 1` is severed into two incomplete halves, degrading both embedding similarity and LLM comprehension.'
        ],
        howItWorks: {
          explanation: [
            'Advantages: Preserves local continuity across split boundaries.',
            'Disadvantages: Increases total vector count and storage by `O / (C - O)`, and if `Chunk i` and `Chunk i+1` are both retrieved in top-k, the overlapping sentences appear twice in the prompt unless deduplicated.',
            'Engineering Rule of Thumb: Use an overlap of 10% to 15% of chunk size (e.g., 40–60 tokens for a 400-token chunk), and merge overlapping contiguous chunks if both are retrieved.'
          ]
        },
        practicalRelevance: {
          summary: 'Merging contiguous overlapping chunks at retrieval time gives the LLM clean, non-repetitive prose.',
          examples: [
            'Detecting that retrieved `chunk_index=4` and `chunk_index=5` come from the same `doc_id` and merging their text spans before prompt injection.'
          ]
        },
        whatToLearn: [
          'Calculate index growth factor for a given chunk size `C` and overlap `O`.',
          'Implement post-retrieval merging of adjacent overlapping chunks from the same document.'
        ],
        resources: [
          {
            id: 'res-p04-12a',
            title: 'Pinecone — Chunk Size and Overlap Optimization',
            url: 'https://www.pinecone.io/learn/chunking-strategies/',
            type: 'Architecture Guide',
            whyStudy: 'Covers empirical trade-offs of overlap ratios on retrieval recall.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-text-chunking', 'p04-parent-child-retrieval']
      },
      {
        id: 'p04-parent-child-retrieval',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 13,
        title: 'Parent-Child (Small-to-Big) Retrieval',
        subtitle: 'Decoupling small fine-grained search chunks from larger synthesis context windows',
        difficulty: 'Intermediate',
        estimatedEffort: '1 hour',
        prerequisites: ['p04-structure-aware-chunking', 'p04-chunk-overlap'],
        technologies: ['Hierarchical Indexing', 'Small-to-Big Retrieval', 'Parent ID Mapping'],
        whatIsIt: [
          'Parent-Child retrieval solves the fundamental chunk-size dilemma by decoupling the unit of vector search from the unit of LLM context injection. You split documents into large Parent chunks (e.g., full 1,200-token Markdown sections or pages) stored in a document store, and further split each Parent into small Child chunks (e.g., 200-token paragraphs) carrying a `parent_id` pointer that are embedded into the vector database.',
          'At query time, you run vector search against the fine-grained Child vectors for maximum semantic precision, but dereference their `parent_id` to pass the complete Parent section into the LLM prompt!'
        ],
        whyItExists: [
          'Small chunks (150–250 tokens) produce razor-sharp embedding vectors that match specific user questions with high cosine similarity, but often lack surrounding context (code examples, caveats) needed by the LLM to write a complete answer. Large chunks (1,200 tokens) have great synthesis context, but blurry averaged embeddings.'
        ],
        howItWorks: {
          explanation: [
            'Advantages: Combines the high retrieval accuracy of small chunks with the rich generative context of full sections; automatically deduplicates when 3 child chunks point to the same parent.',
            'Disadvantages: Slightly higher storage complexity (maintaining parent lookup by `parent_id`) and larger prompt token consumption per retrieved parent.',
            'When Appropriate: High-value technical documentation, legal contracts, and codebases where surrounding section context is critical.'
          ],
          codeOrFormula: `# Child Vector Record in Qdrant:
{ "id": "child_42_3", "vector": [...], "payload": { "parent_id": "parent_42", "doc_id": "doc_7" } }
# At Query Time:
top_children = search_qdrant(query_vec, limit=8)
unique_parent_ids = list(dict.fromkeys(c.payload["parent_id"] for c in top_children))[:4]
parent_contexts = doc_store.get_many(unique_parent_ids)`
        },
        practicalRelevance: {
          summary: 'One of the most effective architectural patterns in production RAG systems.',
          examples: [
            'Retrieving a 180-token paragraph discussing an API error code and passing its full 900-token Parent API endpoint specification to the LLM.'
          ]
        },
        whatToLearn: [
          'Explain why decoupling search granularity (Child) from generation granularity (Parent) resolves the chunk-size trade-off.',
          'Implement `parent_id` dereferencing and deduplication in Python.'
        ],
        resources: [
          {
            id: 'res-p04-13a',
            title: 'Qdrant — Parent-Child & Hierarchical Retrieval Patterns',
            url: 'https://qdrant.tech/documentation/concepts/payload/',
            type: 'Official Documentation',
            whyStudy: 'Shows how payload pointers and grouping enable parent-child lookup.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-chunking-strategies', 'p05-context-compression']
      },
      {
        id: 'p04-doc-identifiers',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 14,
        title: 'Document Identifiers',
        subtitle: 'Deterministic UUIDv5 generation for idempotent upserts',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p03-doc-ingestion'],
        technologies: ['UUIDv5', 'SHA-256', 'Idempotency'],
        whatIsIt: [
          'Every document and every chunk in a vector database requires a unique primary key (`doc_id` and `chunk_id`). Instead of generating random `uuid.uuid4()` IDs on every ingestion run, production pipelines compute deterministic UUIDv5 identifiers derived from a namespace and the canonical document URI + chunk index (`uuid.uuid5(NAMESPACE, f"{source_uri}::{chunk_idx}")`).'
        ],
        whyItExists: [
          'If you use random `uuid4()` IDs and re-run your ingestion script twice on the same folder, you will insert duplicate copies of every single chunk into your vector database! Deterministic IDs turn insertions into idempotent `upsert` operations.'
        ],
        howItWorks: {
          explanation: [
            'UUIDv5 computes a SHA-1 hash of a namespace UUID and a deterministic name string, formatted as a valid 128-bit UUID accepted natively by Qdrant and PostgreSQL.'
          ],
          codeOrFormula: `import uuid
RAG_NAMESPACE = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

def make_chunk_id(source_uri: str, chunk_index: int) -> str:
    return str(uuid.uuid5(RAG_NAMESPACE, f"{source_uri}#chunk={chunk_index}"))`
        },
        practicalRelevance: {
          summary: 'Guarantees idempotent vector upserts and clean cross-database joins.',
          examples: [
            'Re-running ingestion after a network retry overwrites the existing chunk ID cleanly in Qdrant instead of creating duplicate entries.'
          ]
        },
        whatToLearn: [
          'Generate deterministic UUIDv5 IDs for documents and chunks.',
          'Explain why random UUIDv4 IDs cause vector duplication on pipeline retries.'
        ],
        resources: [
          {
            id: 'res-p04-14a',
            title: 'Qdrant Documentation — Point IDs (UUID and Integer Formats)',
            url: 'https://qdrant.tech/documentation/concepts/points/',
            type: 'Official Documentation',
            whyStudy: 'Specifies valid point identifier formats and upsert idempotency behavior in Qdrant.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-duplicate-detection', 'p04-incremental-ingestion']
      },
      {
        id: 'p04-duplicate-detection',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 15,
        title: 'Duplicate Detection',
        subtitle: 'Exact content hashing (SHA-256) and near-duplicate MinHash / SimHash filtering',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p04-doc-identifiers'],
        technologies: ['SHA-256', 'MinHash / LSH', 'Deduplication'],
        whatIsIt: [
          'Real-world document repositories are full of duplicates: the exact same README copied across 4 folders, or slightly edited versions of the same policy exported as both PDF and HTML. Duplicate detection filters out identical or near-identical chunks before embedding and indexing.'
        ],
        whyItExists: [
          'If 5 identical copies of a document exist in your vector database, a `top_k=5` vector search will return the exact same paragraph 5 times—crowding out all other relevant context and wasting 80% of your retrieval budget!'
        ],
        howItWorks: {
          explanation: [
            '1. Exact Deduplication: Compute `sha256(normalized_chunk_text)` and skip embedding/indexing any chunk whose hash already exists in the active index.',
            '2. Near-Duplicate Deduplication: Use MinHash or cosine similarity thresholding (>0.985) during retrieval post-processing (Maximal Marginal Relevance) to collapse near-duplicate hits.'
          ]
        },
        practicalRelevance: {
          summary: 'Saves embedding API costs during ingestion and prevents redundant top-k search results.',
          examples: [
            'Caching `(chunk_sha256 → embedding_vector)` so unchanged paragraphs across document edits reuse their existing embedding vector without calling the embedding API.'
          ]
        },
        whatToLearn: [
          'Implement SHA-256 normalized content hashing at both the document level and chunk level.',
          'Suppress near-duplicate chunks during post-retrieval filtering.'
        ],
        resources: [
          {
            id: 'res-p04-15a',
            title: 'Python hashlib — Secure Hash and Message Digest Algorithms',
            url: 'https://docs.python.org/3/library/hashlib.html',
            type: 'Official Documentation',
            whyStudy: 'Standard library reference for fast SHA-256 content fingerprinting.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-doc-versioning', 'p04-incremental-ingestion']
      },
      {
        id: 'p04-doc-versioning',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 16,
        title: 'Document Versioning',
        subtitle: 'Tracking content lineage and preventing stale v1 chunks from surviving v2 updates',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p04-doc-identifiers', 'p02-sql-postgresql'],
        technologies: ['Version Ledger', 'Atomic Swap', 'Content Hash Tracking'],
        whatIsIt: [
          'Document versioning tracks the revision history (`version`, `content_hash`, `ingested_at`, `is_latest`) of every source document in a metadata ledger so the retrieval system never mixes chunks from an outdated v1 document with chunks from v2.'
        ],
        whyItExists: [
          'Suppose `api_guide.md` in v1 had 12 chunks (`chunk=0..11`), and after an edit in v2 it is shorter and has only 8 chunks (`chunk=0..7`). If you merely upsert `chunk=0..7` by deterministic ID without deleting stale chunks from v1, orphaned chunks `8..11` from v1 remain in the vector database forever as "ghost knowledge"!'
        ],
        howItWorks: {
          explanation: [
            'When a document’s `content_hash` changes, either delete all vectors matching filter `doc_id == X` before inserting the new chunks, or tag new chunks with `version: 2`, update the active version pointer, and delete `doc_id == X AND version < 2`.'
          ]
        },
        practicalRelevance: {
          summary: 'Eliminates the subtle "orphaned trailing chunks" bug that plagues naive RAG update scripts.',
          examples: [
            'Executing `qdrant.delete(collection_name, Filter(must=[FieldCondition(key="doc_id", match=MatchValue(value=doc_id))]))` prior to inserting re-chunked document vectors.'
          ]
        },
        whatToLearn: [
          'Explain the orphaned trailing-chunk problem when document length shrinks across edits.',
          'Implement clean version rotation or delete-before-insert updates per `doc_id`.'
        ],
        resources: [
          {
            id: 'res-p04-16a',
            title: 'Qdrant Documentation — Deleting Points by Filter',
            url: 'https://qdrant.tech/documentation/concepts/points/',
            type: 'Official Documentation',
            whyStudy: 'Shows how to delete all points associated with a `doc_id` payload filter cleanly.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-incremental-ingestion', 'p04-updating-deleting-docs']
      },
      {
        id: 'p04-incremental-ingestion',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 17,
        title: 'Incremental Ingestion',
        subtitle: 'Delta-only indexing pipelines using change-data capture and hash diffs',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p04-duplicate-detection', 'p04-doc-versioning'],
        technologies: ['Delta Indexing', 'Hash Ledger', 'Webhooks / Cron'],
        whatIsIt: [
          'Incremental ingestion compares the current state of a document source against the indexed state ledger (`{doc_id: sha256_hash}`) and processes ONLY newly added, modified, or deleted documents—skipping the 99% of documents that have not changed.'
        ],
        whyItExists: [
          'Re-chunking and re-embedding 100,000 unchanged documents every night wastes hours of compute and hundreds of dollars in embedding API calls.'
        ],
        howItWorks: {
          explanation: [
            'Compute the set difference between the Source Manifest `S = {doc_id: hash}` and the Indexed Ledger `I = {doc_id: hash}`:',
            '• `To_Insert = S.keys() - I.keys()`',
            '• `To_Update = {k for k in S.keys() & I.keys() if S[k] != I[k]}`',
            '• `To_Delete = I.keys() - S.keys()`'
          ]
        },
        practicalRelevance: {
          summary: 'Reduces daily knowledge base sync times from hours to seconds.',
          examples: [
            'Syncing a Git documentation repository on commit push by diffing SHA-256 file hashes against the PostgreSQL ingestion ledger.'
          ]
        },
        whatToLearn: [
          'Implement the 3-way manifest diff (`To_Insert`, `To_Update`, `To_Delete`) for incremental synchronization.'
        ],
        resources: [
          {
            id: 'res-p04-17a',
            title: 'Microsoft RAG Architecture — Incremental Indexing & Data Lifecycle',
            url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation',
            type: 'Architecture Guide',
            whyStudy: 'Outlines production change-detection and incremental index refresh patterns.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-updating-deleting-docs', 'p12-data-freshness']
      },
      {
        id: 'p04-updating-deleting-docs',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 18,
        title: 'Updating and Deleting Documents',
        subtitle: 'Coordinating multi-store deletion across vector indexes, sparse indexes, and parent stores',
        difficulty: 'Intermediate',
        estimatedEffort: '30 mins',
        prerequisites: ['p04-doc-versioning', 'p04-incremental-ingestion'],
        technologies: ['Cascading Deletes', 'Payload Indexing'],
        whatIsIt: [
          'When a source document is updated or revoked, your pipeline must atomically remove its old child vectors from Qdrant, its lexical entries from the sparse/BM25 index, and its parent records from the document store.'
        ],
        whyItExists: [
          'Failing to purge deleted documents across all retrieval stores leads to compliance violations (GDPR/right-to-erasure) and contradictory answers.'
        ],
        howItWorks: {
          explanation: [
            'Ensure `doc_id` is configured as an indexed keyword payload field (`PayloadSchemaType.KEYWORD`) in Qdrant so filter-based deletions (`delete by doc_id`) execute via an O(1) inverted index lookup rather than a full collection scan.'
          ]
        },
        practicalRelevance: {
          summary: 'Indexing the `doc_id` payload field is mandatory for fast document updates and deletions in Qdrant.',
          examples: [
            'Creating a payload index on `doc_id` and `tenant_id` immediately upon collection initialization.'
          ]
        },
        whatToLearn: [
          'Execute coordinated document updates and deletions across vector and relational stores.',
          'Configure payload indexes on `doc_id` for O(1) filter deletion performance.'
        ],
        resources: [
          {
            id: 'res-p04-18a',
            title: 'Qdrant — Payload Indexing for Fast Filtering and Deletion',
            url: 'https://qdrant.tech/documentation/concepts/indexing/',
            type: 'Official Documentation',
            whyStudy: 'Explains how payload indexes accelerate filter-based queries and deletions.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-indexing', 'p04-doc-permissions']
      },
      {
        id: 'p04-doc-permissions',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 19,
        title: 'Managing Document Permissions (ACLs)',
        subtitle: 'Enforcing Role-Based Access Control (RBAC) inside the retrieval filter',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p04-doc-metadata'],
        technologies: ['RBAC', 'ACL Payloads', 'Pre-Filter Security'],
        whatIsIt: [
          'In multi-user systems, different users have access to different documents (e.g., engineering docs vs executive board memos). Document permission management attaches access control lists (e.g., `allowed_roles: ["engineering", "admin"]` or `tenant_id: "org_12"`) to every chunk’s metadata payload during ingestion and enforces a mandatory pre-filter on every vector search.'
        ],
        whyItExists: [
          'You can NEVER rely on a system prompt ("Please do not tell non-admins about executive salaries") to enforce security! If an unauthorized chunk enters the LLM’s context window, it can and will be leaked. Security filtering must happen deterministically inside the database query BEFORE retrieval results ever reach the LLM.'
        ],
        howItWorks: {
          explanation: [
            'Propagate the authenticated user’s verified JWT roles from the FastAPI request middleware directly into the Qdrant `Filter(must=[...])` clause.'
          ],
          codeOrFormula: `# Mandatory deterministic security filter at retrieval time:
security_filter = models.Filter(
    must=[
        models.FieldCondition(key="tenant_id", match=models.MatchValue(value=user.tenant_id)),
        models.FieldCondition(key="allowed_roles", match=models.MatchAny(any=user.roles))
    ]
)`
        },
        practicalRelevance: {
          summary: 'A foundational security invariant that you will expand on in Phase 11 and implement in your Phase 13 Capstone.',
          examples: [
            'Propagating document ACLs from Google Drive / GitHub Teams into Qdrant chunk payloads during ingestion.'
          ]
        },
        whatToLearn: [
          'Understand why permission enforcement must occur at the retrieval query layer, never at the prompt layer.',
          'Attach and index ACL metadata fields (`tenant_id`, `allowed_roles`) on every chunk.'
        ],
        resources: [
          {
            id: 'res-p04-19a',
            title: 'OWASP RAG Security Cheat Sheet — Access Control & Document Permissions',
            url: 'https://cheatsheetseries.owasp.org/cheatsheets/RAG_Security_Cheat_Sheet.html',
            type: 'Architecture Guide',
            whyStudy: 'Details mandatory document-level permission controls in RAG pipelines.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-metadata-filtering', 'p06-multitenancy', 'p11-doc-permissions']
      },
      {
        id: 'p04-tables-complex-docs',
        phaseId: 'phase-04',
        phaseNumber: '04',
        order: 20,
        title: 'Handling Tables and Complex Documents',
        subtitle: 'Preserving 2D row/column relationships in Markdown tables and summary-indexed representations',
        difficulty: 'Advanced',
        estimatedEffort: '1 hour',
        prerequisites: ['p04-pdf-processing', 'p04-structure-aware-chunking', 'p04-parent-child-retrieval'],
        technologies: ['Markdown Tables', 'Table Summarization', 'Multi-Vector Indexing'],
        whatIsIt: [
          'Tables encode information at the 2D intersection of a column header and a row label. If a naive chunker slices a 50-row table between row 20 and row 21, rows 21–50 lose their column headers (`| Metric | P50 | P95 |`) and become meaningless strings of numbers.'
        ],
        whyItExists: [
          'Technical specifications, benchmark reports, and financial filings store their highest-density facts inside tables.'
        ],
        howItWorks: {
          explanation: [
            'Use two complementary techniques:',
            '1. Header-Preserving Table Partitioning: Render extracted tables as GitHub-Flavored Markdown tables. If a table exceeds `max_tokens` and must be split across row batches, programmatically repeat the Markdown table header (`| Col A | Col B |\\n|---|---|`) at the top of every split chunk!',
            '2. Summary-to-Raw Parent-Child Indexing: Generate a concise natural language summary of what the table measures, embed the summary + table caption as the Child search vector, and store the intact raw Markdown/HTML table as the Parent context returned to the LLM.'
          ]
        },
        practicalRelevance: {
          summary: 'Repeating table column headers on row-split chunks is a simple deterministic trick that dramatically boosts tabular RAG accuracy.',
          examples: [
            'Splitting a 100-row API error code table into 20-row chunks where every chunk begins with the table title and column headers `| Error Code | HTTP Status | Retryable | Description |`.'
          ]
        },
        whatToLearn: [
          'Keep small/medium tables atomic inside structure-aware chunkers.',
          'Programmatically repeat column headers when splitting large tables across row batches.',
          'Apply parent-child summary indexing for dense numerical tables.'
        ],
        resources: [
          {
            id: 'res-p04-20a',
            title: 'Docling — Structured Document & Table Extraction for GenAI',
            url: 'https://ds4sd.github.io/docling/',
            type: 'Official Documentation',
            whyStudy: 'Open-source document parser designed specifically to extract complex tables and layouts into clean Markdown/JSON for RAG.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-pdf-processing', 'p04-parent-child-retrieval']
      }
    ]
  },
  {
    id: 'phase-05',
    number: '05',
    title: 'Retrieval Systems and Optimization',
    shortTitle: 'Retrieval Optimization',
    objective: 'Move beyond naive vector search and master hybrid lexical + dense retrieval, Reciprocal Rank Fusion (RRF), query transformations, cross-encoder reranking, and latency/recall optimization.',
    description: 'Dense embeddings excel at semantic concepts but frequently miss exact error codes, SKUs, function names, and acronyms. This phase teaches classic Information Retrieval (inverted indexes, TF-IDF, BM25) and combines it with dense vector search and neural rerankers.',
    milestone: 'Build a Hybrid Retrieval + Cross-Encoder Reranking pipeline and benchmark its Precision@k and Recall@k against baseline vector-only search.',
    topics: [
      {
        id: 'p05-ir-fundamentals',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 1,
        title: 'Information Retrieval (IR) Fundamentals',
        subtitle: 'The science of ranking candidate documents from large corpora under latency constraints',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-vector-search'],
        technologies: ['Multi-Stage Retrieval', 'Candidate Generation (L1)', 'Reranking (L2)'],
        whatIsIt: [
          'Information Retrieval (IR) is the computer science discipline focused on representing, indexing, and ranking unstructured documents in response to user queries. Modern production retrieval architectures follow a funnel pattern called Multi-Stage Retrieval: a fast First-Stage Retriever (L1 Candidate Generation, fetching top 50–100 candidates in <15ms across lexical and dense indexes) followed by a high-precision Second-Stage Reranker (L2 Scoring, narrowing 50 candidates down to the top 5 for the LLM).'
        ],
        whyItExists: [
          'No single scoring function is simultaneously cheap enough to run over 10 million documents in 10ms AND accurate enough to capture fine-grained token-by-token query-document interactions.'
        ],
        howItWorks: {
          explanation: [
            'Corpus (10M chunks) → [Pre-Filter Metadata] → [L1 Hybrid Dense + BM25 Search: Top 50] → [L2 Cross-Encoder Reranker: Top 5] → LLM Prompt.'
          ],
          diagram: {
            type: 'hybrid-retrieval',
            caption: 'Interactive Hybrid Retrieval & RRF Simulator: Experiment with BM25 lexical matching, Dense Cosine Similarity, RRF fusion, and Cross-Encoder Reranking.'
          }
        },
        practicalRelevance: {
          summary: 'The multi-stage funnel (Filter → L1 Hybrid Recall → L2 Rerank Precision → Context Compression) is the blueprint of state-of-the-art production RAG.',
          examples: [
            'Fetching top-25 dense hits + top-25 BM25 hits, fusing via RRF, and reranking the top 20 down to 5.'
          ]
        },
        whatToLearn: [
          'Explain why retrieval is architected as a multi-stage funnel (L1 Recall-oriented Candidate Generation → L2 Precision-oriented Reranking).'
        ],
        resources: [
          {
            id: 'res-p05-1a',
            title: 'Pinecone — Rerankers and Two-Stage Retrieval Systems',
            url: 'https://www.pinecone.io/learn/series/rag/rerankers/',
            type: 'Architecture Guide',
            whyStudy: 'Explains the multi-stage information retrieval funnel and why two-stage retrieval dominates single-stage search.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-hybrid-retrieval', 'p05-reranking', 'p05-precision-recall']
      },
      {
        id: 'p05-lexical-search',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 2,
        title: 'Lexical Search',
        subtitle: 'Exact term matching and why semantic embeddings alone fail on identifiers and domain jargon',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p05-ir-fundamentals'],
        technologies: ['Term Matching', 'Token Normalization', 'Exact Identifiers'],
        whatIsIt: [
          'Lexical search scores documents based on the exact overlap of tokenized words/terms between the query and the document, weighted by term rarity and frequency.'
        ],
        whyItExists: [
          'Why is semantic vector search alone not enough? Suppose an engineer searches for error code `"ERR_QUIC_PROTOCOL_ERROR"`, CVE identifier `"CVE-2026-4412"`, function name `"_mm256_fmadd_ps"`, or part number `"TX-9940-B"`. Dense embedding models compress strings into smooth conceptual vectors, often mapping `"TX-9940-B"` right next to `"TX-9910-A"` or general hardware descriptions—missing the one document that contains the exact identifier!',
          'Lexical search guarantees exact token match discrimination.'
        ],
        howItWorks: {
          explanation: [
            'Tokenize text into discrete terms, normalize morphology, and score documents containing the exact query terms.'
          ]
        },
        practicalRelevance: {
          summary: 'Essential for codebases, API documentation, log analysis, legal statutes, and medical/hardware nomenclatures.',
          examples: [
            'Matching exact function names and environment variable keys (`QDRANT__SERVICE__GRPC_PORT`) that dense embeddings blur together.'
          ]
        },
        whatToLearn: [
          'List concrete failure modes of dense semantic search (exact identifiers, rare acronyms, version numbers, function names) where lexical search wins.'
        ],
        resources: [
          {
            id: 'res-p05-2a',
            title: 'Qdrant — Hybrid Search & Lexical vs Semantic Complementarity',
            url: 'https://qdrant.tech/documentation/hybrid-queries/',
            type: 'Official Documentation',
            whyStudy: 'Explains how lexical sparse representations complement dense embeddings.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-inverted-indexes', 'p05-bm25', 'p05-hybrid-retrieval']
      },
      {
        id: 'p05-inverted-indexes',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 3,
        title: 'Inverted Indexes',
        subtitle: 'The core data structure mapping vocabulary terms to sorted posting lists',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-lexical-search'],
        technologies: ['Posting Lists', 'Skip Pointers', 'Lucene / Tantivy / Qdrant Sparse'],
        whatIsIt: [
          'From your Data Structures and Algorithms background: whereas a forward index maps `doc_id → list[terms]`, an Inverted Index flips this mapping into a hash table / B-tree dictionary mapping each unique `term → PostingList[(doc_id, term_freq, positions)]` sorted by `doc_id`.'
        ],
        whyItExists: [
          'Allows an engine to find every document containing the rare token `"CVE-2026-4412"` in O(1) dictionary lookup + O(L) posting list traversal (where L is the number of matching docs, often <10 out of 10,000,000), without scanning non-matching documents.'
        ],
        howItWorks: {
          explanation: [
            'Multi-term queries intersect or union sorted posting lists using two-pointer merge algorithms (such as WAND / Block-Max WAND) to compute top-k lexical scores in sub-millisecond time.'
          ],
          codeOrFormula: `Inverted Index Dictionary:
"hnsw"   -> [(doc_1, tf=4), (doc_7, tf=2), (doc_19, tf=9)]
"qdrant" -> [(doc_1, tf=2), (doc_4, tf=5), (doc_19, tf=3)]`
        },
        practicalRelevance: {
          summary: 'Inverted indexes power both BM25 lexical search, sparse vector indexes, and Qdrant’s keyword payload filtering.',
          examples: [
            'Understanding why Qdrant uses an inverted index under the hood for both sparse vectors (`SparseVector`) and keyword payload filters.'
          ]
        },
        whatToLearn: [
          'Explain how an inverted index and sorted posting list intersection work algorithmically.'
        ],
        resources: [
          {
            id: 'res-p05-3a',
            title: 'Qdrant Documentation — Sparse Vectors & Inverted Indexing',
            url: 'https://qdrant.tech/documentation/concepts/vectors/#sparse-vectors',
            type: 'Official Documentation',
            whyStudy: 'Shows how sparse vectors are stored and queried via inverted posting lists.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-tfidf', 'p05-bm25', 'p05-sparse-retrieval']
      },
      {
        id: 'p05-tfidf',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 4,
        title: 'TF-IDF',
        subtitle: 'Term Frequency–Inverse Document Frequency weighting',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p05-inverted-indexes'],
        technologies: ['Term Frequency', 'Inverse Document Frequency'],
        whatIsIt: [
          'TF-IDF assigns a weight to term `t` in document `d` proportional to how frequently `t` appears in `d` (Term Frequency, `TF(t, d)`), multiplied by the logarithmic rarity of `t` across the entire corpus of `N` documents (`IDF(t) = log(N / df(t))`).'
        ],
        whyItExists: [
          'In raw term counting, stop words like `"the"` or `"system"` dominate scores despite carrying almost zero information content. IDF penalizes ubiquitous words and amplifies rare, high-information domain terms.'
        ],
        howItWorks: {
          explanation: [
            'While TF-IDF established the foundation of lexical weighting, its linear dependence on TF means a document repeating a word 50 times gets 10x the score of a document mentioning it 5 times, and it fails to normalize properly for varying document lengths—which motivated BM25.'
          ],
          codeOrFormula: `TF-IDF(t, d) = tf(t, d) * log(1 + N / df(t))`
        },
        practicalRelevance: {
          summary: 'The direct mathematical precursor to BM25.',
          examples: [
            'Understanding how IDF rarity weighting automatically assigns high weight to function names and error codes.'
          ]
        },
        whatToLearn: [
          'Compute TF and IDF and explain the two flaws of raw TF-IDF (unbounded linear TF growth and lack of document-length normalization).'
        ],
        resources: [
          {
            id: 'res-p05-4a',
            title: 'Qdrant — Sparse Lexical Representations (TF-IDF & BM25)',
            url: 'https://qdrant.tech/documentation/hybrid-queries/',
            type: 'Official Documentation',
            whyStudy: 'Places TF-IDF and BM25 in the context of modern hybrid vector databases.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-bm25', 'p05-sparse-retrieval']
      },
      {
        id: 'p05-bm25',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 5,
        title: 'BM25 (Best Matching 25)',
        subtitle: 'The gold-standard lexical ranking formula with TF saturation and length normalization',
        difficulty: 'Intermediate',
        estimatedEffort: '1 hour',
        prerequisites: ['p05-tfidf'],
        technologies: ['Okapi BM25', 'k1 Saturation', 'b Length Normalization'],
        whatIsIt: [
          'Okapi BM25 is the industry-standard probabilistic lexical ranking algorithm used in Elasticsearch, OpenSearch, Tantivy, and Qdrant sparse BM25 pipelines. It improves directly upon TF-IDF with two brilliant mathematical refinements: asymptotic term-frequency saturation (controlled by parameter `k_1 ≈ 1.2–1.5`) and relative document length normalization (controlled by parameter `b ≈ 0.75`).'
        ],
        whyItExists: [
          'In TF-IDF, a spammy or repetitive chunk mentioning `"HNSW"` 20 times scores 10x higher than a concise chunk mentioning `"HNSW"` twice. BM25’s saturation curve `tf * (k1 + 1) / (tf + k1 * ...)` hits an asymptote of `k1 + 1`, ensuring that matching *all* query terms is prioritized over repeating *one* query term dozens of times.'
        ],
        howItWorks: {
          explanation: [
            'For a query Q consisting of terms q_1, ..., q_m, the BM25 score of document D with length |D| (relative to average corpus chunk length avgdl) is:'
          ],
          codeOrFormula: `BM25(D, Q) = Σ_{q ∈ Q} IDF(q) * [ (tf(q, D) * (k1 + 1)) / (tf(q, D) + k1 * (1 - b + b * (|D| / avgdl))) ]
where IDF(q) = ln(1 + (N - df(q) + 0.5) / (df(q) + 0.5))`
        },
        practicalRelevance: {
          summary: 'BM25 remains an unbeatable lexical baseline that, when fused with dense vectors, forms the backbone of modern Hybrid RAG.',
          examples: [
            'Representing BM25 term weights as a sparse vector `(token_id: weight)` in Qdrant so a single database engine executes both BM25 and dense HNSW search natively.'
          ]
        },
        whatToLearn: [
          'Explain the role of `k_1` (term frequency saturation) and `b` (document length normalization) in the BM25 equation.',
          'Understand how BM25 can be represented natively as a sparse dot product.'
        ],
        resources: [
          {
            id: 'res-p05-5a',
            title: 'Qdrant Documentation — Hybrid & BM25 Queries',
            url: 'https://qdrant.tech/documentation/hybrid-queries/',
            type: 'Official Documentation',
            whyStudy: 'Demonstrates running native BM25 sparse + dense vector queries in Qdrant.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-sparse-retrieval', 'p05-hybrid-retrieval', 'p05-rrf']
      },
      {
        id: 'p05-dense-retrieval',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 6,
        title: 'Dense Retrieval',
        subtitle: 'Bi-encoder neural retrieval in continuous low-dimensional vector space',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p03-embedding-generation', 'p03-vector-search'],
        technologies: ['Bi-Encoders', 'Dense Embeddings', 'HNSW'],
        whatIsIt: [
          'Dense retrieval encodes queries and documents independently using a neural Bi-Encoder (`E_Q(q)` and `E_D(d)`) into continuous dense vectors (where nearly every coordinate `float32[D]` is non-zero) and retrieves candidates via maximum inner product or cosine similarity.'
        ],
        whyItExists: [
          'Overcomes the "vocabulary mismatch problem" of lexical search: matching queries and passages that express the same underlying concept using completely different words, or even across different languages.'
        ],
        howItWorks: {
          explanation: [
            'Because the Bi-Encoder computes document vector `E_D(d)` independently of the query, all document vectors can be pre-computed offline and indexed in an HNSW graph for O(log N) query-time search.'
          ]
        },
        practicalRelevance: {
          summary: 'Understanding that Dense Retrieval is a Bi-Encoder (independent encoding of Q and D) explains both why it is fast and why a Cross-Encoder Reranker (joint encoding of Q + D) can improve upon it.',
          examples: [
            'Retrieving conceptual architectural discussions even when the user uses informal phrasing.'
          ]
        },
        whatToLearn: [
          'Explain the Bi-Encoder architecture and why independent document encoding enables offline vector indexing.'
        ],
        resources: [
          {
            id: 'res-p05-6a',
            title: 'Pinecone — Dense Bi-Encoders vs Cross-Encoders',
            url: 'https://www.pinecone.io/learn/series/rag/rerankers/',
            type: 'Architecture Guide',
            whyStudy: 'Contrasts independent bi-encoder vector spaces against joint cross-encoder attention.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-sparse-retrieval', 'p05-semantic-search', 'p05-cross-encoders']
      },
      {
        id: 'p05-sparse-retrieval',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 7,
        title: 'Sparse Retrieval',
        subtitle: 'High-dimensional vocabulary-sized vectors with sparse non-zero term weights (BM25 / SPLADE)',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-inverted-indexes', 'p05-bm25'],
        technologies: ['Sparse Vectors', 'BM25 Sparse', 'SPLADE'],
        whatIsIt: [
          'A sparse vector resides in a massive vocabulary-dimensional space (e.g., `D = 30,000` to `250,000` dimensions, where each dimension corresponds to a specific token), but only the 20 to 150 tokens actually present in the chunk have non-zero weights (`indices: [104, 8821, ...], values: [1.42, 2.89, ...]`).',
          'Sparse retrieval includes both classical statistical sparse vectors (BM25 weights) and learned neural sparse encoders (like SPLADE, which also activates high weights for closely related synonym tokens).'
        ],
        whyItExists: [
          'Representing lexical search as a Sparse Vector (`{indices: uint32[], values: float32[]}`) unifies lexical and semantic search inside a single vector database (such as Qdrant), eliminating the operational burden of running and syncing a separate Elasticsearch cluster alongside your vector DB!'
        ],
        howItWorks: {
          explanation: [
            'The dot product of two sparse vectors `q_sparse · d_sparse` only multiplies dimensions where BOTH `q` and `d` have non-zero entries—which is mathematically identical to intersecting inverted index posting lists.'
          ],
          codeOrFormula: `# Qdrant Point with both Dense and Sparse named vectors:
PointStruct(
    id=chunk_id,
    vector={
        "dense": [0.012, -0.043, ...],  # 768-dim dense float32
        "sparse_bm25": SparseVector(indices=[142, 9912], values=[1.85, 3.12])
    },
    payload=metadata
)`
        },
        practicalRelevance: {
          summary: 'Storing named `"dense"` and `"sparse_bm25"` vectors on the same Qdrant record is the cleanest architecture for single-database Hybrid RAG.',
          examples: [
            'Indexing both a dense embedding and a BM25 sparse vector in Qdrant for every document chunk.'
          ]
        },
        whatToLearn: [
          'Understand how sparse vectors `{indices, values}` unify inverted-index lexical search with vector databases.',
          'Configure multi-vector (dense + sparse) collections in Qdrant.'
        ],
        resources: [
          {
            id: 'res-p05-7a',
            title: 'Qdrant Documentation — Sparse Vectors & Hybrid Collections',
            url: 'https://qdrant.tech/documentation/concepts/vectors/#sparse-vectors',
            type: 'Official Documentation',
            whyStudy: 'Official specification for storing and querying sparse vectors alongside dense vectors.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-bm25', 'p05-hybrid-retrieval']
      },
      {
        id: 'p05-semantic-search',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 8,
        title: 'Semantic Search: Strengths and Blind Spots',
        subtitle: 'Understanding when vector similarity succeeds and when out-of-domain distributions degrade it',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p05-dense-retrieval', 'p05-lexical-search'],
        technologies: ['Domain Shift', 'Anisotropy', 'Hubness'],
        whatIsIt: [
          'Semantic search retrieves passages by meaning rather than exact wording. However, production engineers must understand its systematic blind spots: out-of-distribution domain jargon, negation insensitivity (`"supports TLS 1.3"` vs `"does NOT support TLS 1.3"` often have >0.95 cosine similarity!), and exact alphanumeric codes.'
        ],
        whyItExists: [
          'Recognizing these blind spots explains why hybrid retrieval + cross-encoder reranking is required in high-stakes engineering domains.'
        ],
        howItWorks: {
          explanation: [
            'Because bi-encoders pool an entire 400-token chunk into one vector, a single negation word ("not") barely shifts the 768-dimensional centroid, whereas a Cross-Encoder attends token-by-token between query and passage.'
          ]
        },
        practicalRelevance: {
          summary: 'Prevents over-reliance on raw cosine similarity scores as an absolute truth metric.',
          examples: [
            'Catching negation mismatches and exact version differences (`v1.4` vs `v2.4`) via hybrid search + reranking.'
          ]
        },
        whatToLearn: [
          'Identify the three classic failure modes of pure semantic search: exact identifiers, negation/antonym proximity, and domain vocabulary shift.'
        ],
        resources: [
          {
            id: 'res-p05-8a',
            title: 'Qdrant — Why Hybrid Search Outperforms Pure Semantic Search',
            url: 'https://qdrant.tech/documentation/hybrid-queries/',
            type: 'Official Documentation',
            whyStudy: 'Illustrates complementary recall patterns of semantic and lexical retrieval.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-hybrid-retrieval', 'p05-reranking']
      },
      {
        id: 'p05-hybrid-retrieval',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 9,
        title: 'Hybrid Retrieval',
        subtitle: 'Combining dense semantic search and sparse lexical search in parallel',
        difficulty: 'Intermediate',
        estimatedEffort: '1 hour',
        prerequisites: ['p05-dense-retrieval', 'p05-sparse-retrieval'],
        technologies: ['Hybrid Search', 'Qdrant Prefetch', 'Score Fusion'],
        whatIsIt: [
          'Hybrid retrieval executes both a Dense Semantic Search (capturing conceptual similarity and paraphrases) and a Sparse Lexical Search (capturing exact identifiers, keywords, and BM25 term rarity) in parallel over the same corpus, and merges the two candidate lists into a unified ranking.'
        ],
        whyItExists: [
          'Raw BM25 scores are unbounded `[0, ∞)` (often 4.2 to 28.5 depending on query length), whereas Cosine Similarity scores live in `[-1, 1]` (typically 0.65 to 0.89). You cannot simply add a raw BM25 score of `18.4` to a cosine similarity of `0.81` without calibration or rank-based fusion!'
        ],
        howItWorks: {
          explanation: [
            'Execute parallel candidate prefetching (`top 25 dense` + `top 25 sparse_bm25`) and combine them using Reciprocal Rank Fusion (RRF) or distribution-normalized convex combination.'
          ],
          codeOrFormula: `# Qdrant Native Single-Request Hybrid Query with RRF:
results = qdrant.query_points(
    collection_name="kb_chunks",
    prefetch=[
        models.Prefetch(query=dense_vec, using="dense", limit=25),
        models.Prefetch(query=sparse_vec, using="sparse_bm25", limit=25),
    ],
    query=models.FusionQuery(fusion=models.Fusion.RRF),
    limit=10,
)`,
          diagram: {
            type: 'hybrid-retrieval',
            caption: 'Interactive Hybrid Retrieval & RRF Workbench: Compare Dense-only, BM25-only, and RRF Hybrid rankings.'
          }
        },
        practicalRelevance: {
          summary: 'Hybrid retrieval is the default production retrieval architecture for enterprise and technical RAG.',
          examples: [
            'When a user asks `"How do I fix ERR_CONNECTION_RESET in the async retry client?"`, BM25 locks onto `"ERR_CONNECTION_RESET"` while dense search matches conceptual retry architecture docs—and chunks matching BOTH rise straight to Rank #1.'
          ]
        },
        whatToLearn: [
          'Explain why raw BM25 and Cosine scores cannot be added directly.',
          'Implement parallel hybrid retrieval using Qdrant `prefetch` + `Fusion.RRF`.'
        ],
        resources: [
          {
            id: 'res-p05-9a',
            title: 'Qdrant Documentation — Hybrid Queries & Prefetch Pipelines',
            url: 'https://qdrant.tech/documentation/hybrid-queries/',
            type: 'Official Documentation',
            whyStudy: 'Complete reference for building single-call hybrid dense + sparse queries in Qdrant.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-rrf', 'p05-reranking']
      },
      {
        id: 'p05-rrf',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 10,
        title: 'Reciprocal Rank Fusion (RRF)',
        subtitle: 'Scale-invariant rank aggregation algorithm (Cormack et al., 2009)',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-hybrid-retrieval'],
        technologies: ['RRF Formula', 'Rank Aggregation'],
        whatIsIt: [
          'Reciprocal Rank Fusion (RRF) is an elegant, non-parametric algorithm for combining ranked result lists from multiple retrieval engines (such as Dense Cosine + Sparse BM25, or multiple rewritten sub-queries) using only each document’s integer rank position `r_i(d) ∈ {1, 2, 3, ...}` rather than its uncalibrated raw score.'
        ],
        whyItExists: [
          'Score distributions vary wildly across queries and across retrieval modalities (BM25 vs Cosine). RRF eliminates score-calibration tuning completely while strongly rewarding documents that achieve high ranks across multiple independent retrievers.'
        ],
        howItWorks: {
          explanation: [
            'For a set of rankers `R`, the RRF score of document `d` is the sum of `1 / (k + rank_r(d))` over all rankers where `d` appears, where `k` (typically `k = 60`) is a smoothing constant that dampens the outsized gap between Rank 1 and Rank 2 (`1/1` vs `1/2`).'
          ],
          codeOrFormula: `RRF_Score(d) = Σ_{r ∈ Retrievers} 1 / (k + rank_r(d))   (typically k = 60)

def reciprocal_rank_fusion(ranked_lists: list[list[str]], k: int = 60) -> list[tuple[str, float]]:
    scores: dict[str, float] = {}
    for result_list in ranked_lists:
        for rank_idx, doc_id in enumerate(result_list, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank_idx)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)`
        },
        practicalRelevance: {
          summary: 'You should be able to write the RRF formula and its 8-line Python implementation from memory.',
          examples: [
            'Fusing results from Dense search, BM25 search, and 3 multi-query variations into a single deduplicated candidate pool.'
          ]
        },
        whatToLearn: [
          'Write the exact RRF formula and explain why the smoothing constant `k = 60` exists.',
          'Implement RRF in pure Python.'
        ],
        resources: [
          {
            id: 'res-p05-10a',
            title: 'Qdrant — Reciprocal Rank Fusion (RRF) in Hybrid Search',
            url: 'https://qdrant.tech/documentation/hybrid-queries/',
            type: 'Official Documentation',
            whyStudy: 'Shows how RRF merges multi-stage prefetch lists inside Qdrant.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-hybrid-retrieval', 'p05-multi-query']
      },
      {
        id: 'p05-metadata-filtering',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 11,
        title: 'Metadata Filtering',
        subtitle: 'Boolean pre-filtering vs post-filtering and filterable HNSW traversal',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p04-doc-metadata', 'p04-doc-permissions'],
        technologies: ['Filterable HNSW', 'Pre-Filtering', 'Boolean Clauses'],
        whatIsIt: [
          'Metadata filtering constrains vector search to only those records whose structured payload satisfies boolean predicate clauses (`must`, `should`, `must_not`) on exact fields like `tenant_id`, `service_name`, `created_at >= timestamp`, or `allowed_roles`.'
        ],
        whyItExists: [
          'Understanding the difference between Pre-Filtering, Post-Filtering, and Single-Stage Filterable HNSW is a classic senior AI systems architecture topic:',
          '• Naive Post-Filtering runs an unfiltered top-k vector search first and then discards results that fail the metadata filter. If a filter matches only 2% of the database, top-10 vector search might return 0 surviving results!',
          '• Single-Stage Filterable HNSW (used by Qdrant) evaluates payload index bitmaps during graph traversal so you always get a full `k` valid results with high recall.'
        ],
        howItWorks: {
          explanation: [
            'Qdrant builds additional linking edges inside payload-indexed subgraphs so filtered HNSW graph searches do not get disconnected when restrictive metadata filters are applied.'
          ]
        },
        practicalRelevance: {
          summary: 'Critical for multitenancy, RBAC security, and narrowing search scope by product version or date range.',
          examples: [
            'Filtering retrieval strictly to `product_version == "v2.4"` and `tenant_id == current_user.org_id`.'
          ]
        },
        whatToLearn: [
          'Explain why Naive Post-Filtering causes recall collapse on selective filters.',
          'Construct compound `must` / `should` / `must_not` payload filters in Qdrant.'
        ],
        resources: [
          {
            id: 'res-p05-11a',
            title: 'Qdrant Documentation — Filtering Clauses and Filterable HNSW',
            url: 'https://qdrant.tech/documentation/concepts/filtering/',
            type: 'Official Documentation',
            whyStudy: 'Deep-dive into boolean filter predicates and how Qdrant executes filtered vector search.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-doc-metadata', 'p06-filtering']
      },
      {
        id: 'p05-top-k-retrieval',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 12,
        title: 'Top-K Retrieval and Diversity (MMR)',
        subtitle: 'Calibrating candidate depth k and Maximal Marginal Relevance',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p03-retrieving-relevant-docs'],
        technologies: ['Top-K Selection', 'Maximal Marginal Relevance (MMR)'],
        whatIsIt: [
          '`top_k` controls how many chunks are retrieved at each stage of the funnel (e.g., `k_retrieve = 25` at L1 candidate generation, `k_rerank = 5` passed to the LLM prompt). Maximal Marginal Relevance (MMR) iteratively selects chunks that maximize relevance to the query while penalizing high cosine similarity to already-selected chunks.'
        ],
        whyItExists: [
          'Setting final `k` too small (`k = 1–2`) risks missing a multi-part answer; setting final `k` too large (`k = 30` unreranked chunks) floods the LLM with distracting noise, increases TTFT latency, and inflates token costs.'
        ],
        howItWorks: {
          explanation: [
            'MMR balances query relevance against inter-chunk redundancy using parameter `λ ∈ [0, 1]`:'
          ],
          codeOrFormula: `MMR = argmax_{d_i ∈ R \\ S} [ λ * Sim(d_i, Q) - (1 - λ) * max_{d_j ∈ S} Sim(d_i, d_j) ]`
        },
        practicalRelevance: {
          summary: 'Prevents all 5 retrieved slots from being consumed by 5 nearly identical paragraphs.',
          examples: [
            'Retrieving `k=25` candidates in L1 hybrid search and passing the top `k=5` reranked, deduplicated chunks to the LLM.'
          ]
        },
        whatToLearn: [
          'Tune L1 retrieval `k` vs L2 final synthesis `k` using Precision@k and Recall@k metrics.',
          'Explain how MMR promotes result diversity.'
        ],
        resources: [
          {
            id: 'res-p05-12a',
            title: 'Qdrant — Querying, Grouping, and Result Diversity',
            url: 'https://qdrant.tech/documentation/concepts/search/',
            type: 'Official Documentation',
            whyStudy: 'Covers `query_points_groups` (limiting max chunks per `doc_id`) and top-k selection.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-reranking', 'p07-precision-at-k', 'p07-recall-at-k']
      },
      {
        id: 'p05-query-rewriting',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 13,
        title: 'Query Rewriting',
        subtitle: 'De-contextualizing conversational pronouns and normalizing ill-formed user queries',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p01-message-roles', 'p05-hybrid-retrieval'],
        technologies: ['Conversational Coreference Resolution', 'Fast LLM Rewriter'],
        whatIsIt: [
          'In a multi-turn chat session, a user first asks `"How does Qdrant HNSW indexing work?"` and in Turn 2 asks `"How do I tune its memory usage?"`. If you embed the literal Turn 2 string `"How do I tune its memory usage?"`, the vector database has no idea what `"its"` refers to! Query rewriting uses a fast LLM call (e.g., Gemini 2.5 Flash) to rewrite the latest message + chat history into a standalone, self-contained search query: `"Qdrant HNSW index memory usage tuning parameters"`.'
        ],
        whyItExists: [
          'Users type conversational fragments, typos, pronouns ("it", "that method", "the second option"), and filler words that degrade direct vector and BM25 search.'
        ],
        howItWorks: {
          explanation: [
            'Pass the last 3–5 conversation turns and current user input to a fast low-latency rewriter prompt before calling the retriever.'
          ]
        },
        practicalRelevance: {
          summary: 'Mandatory for any multi-turn conversational RAG system; without coreference query rewriting, Turn 2+ retrieval accuracy collapses.',
          examples: [
            'Rewriting `"What about in Python?"` after a question on gRPC timeouts into `"Configure gRPC client timeout in Python"`.'
          ]
        },
        whatToLearn: [
          'Implement conversational coreference query rewriting for multi-turn RAG.',
          'Keep query rewriting latency under 250ms using a lightweight Flash model.'
        ],
        resources: [
          {
            id: 'res-p05-13a',
            title: 'Microsoft RAG Guide — Query Rewriting & Contextualization',
            url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation',
            type: 'Architecture Guide',
            whyStudy: 'Explains query transformation patterns for multi-turn RAG conversations.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-query-expansion', 'p05-multi-query', 'p05-query-decomposition']
      },
      {
        id: 'p05-query-expansion',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 14,
        title: 'Query Expansion',
        subtitle: 'Enriching short ambiguous queries with domain synonyms, technical terms, and HyDE',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-query-rewriting'],
        technologies: ['Synonym Expansion', 'HyDE (Hypothetical Document Embeddings)'],
        whatIsIt: [
          'Query expansion augments a terse user query with canonical domain terminology, acronyms, or a brief hypothetical answer structural template (HyDE — Hypothetical Document Embeddings) to bridge the lexical and stylistic gap between how users ask questions and how technical documentation is written.'
        ],
        whyItExists: [
          'A user might search `"slow db requests"`, whereas the engineering runbook is titled `"Diagnosing P99 Latency Spikes and Connection Pool Exhaustion in PostgreSQL"`.'
        ],
        howItWorks: {
          explanation: [
            'Expand key terms into technical synonyms for BM25/hybrid search, or generate a hypothetical passage structure for dense vector matching. Always evaluate expansion against latency budget (+200–400ms) and ensure hypothetical hallucinated terms do not pollute exact lexical matching.'
          ]
        },
        practicalRelevance: {
          summary: 'Particularly effective when non-expert users search deep technical or legal repositories.',
          examples: [
            'Appending canonical technical synonyms (`["OOM", "Out Of Memory", "ContainerKilled", "Exit Code 137"]`) to an infrastructure troubleshooting query.'
          ]
        },
        whatToLearn: [
          'Understand term-based query expansion and Hypothetical Document Embeddings (HyDE).',
          'Know when query expansion helps vs when it introduces retrieval drift and extra latency.'
        ],
        resources: [
          {
            id: 'res-p05-14a',
            title: 'Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE — Gao et al.)',
            url: 'https://arxiv.org/abs/2212.10496',
            type: 'Research Paper',
            whyStudy: 'Introduces Hypothetical Document Embeddings and analyzes query-to-document alignment.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-query-rewriting', 'p05-multi-query']
      },
      {
        id: 'p05-multi-query',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 15,
        title: 'Multi-Query Retrieval',
        subtitle: 'Fan-out retrieval across multiple perspective phrasings fused with RRF',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-rrf', 'p05-query-rewriting', 'p02-async-await'],
        technologies: ['Async Fan-Out', 'RRF Fusion'],
        whatIsIt: [
          'Multi-query retrieval generates 3 distinct search queries exploring different facets or terminology of an ambiguous user question, executes all 3 hybrid searches concurrently via `asyncio.gather()`, and merges their ranked results into a single deduplicated list using Reciprocal Rank Fusion (RRF).'
        ],
        whyItExists: [
          'Distance in embedding space can be sensitive to specific phrasing. Averaging across 3 distinct query formulations via RRF dramatically improves recall on nuanced questions.'
        ],
        howItWorks: {
          explanation: [
            '1. Single structured LLM call generates `queries: list[str]` (length 3).',
            '2. `await asyncio.gather(*(hybrid_search(q) for q in queries))` runs all 3 searches in parallel (zero sequential search penalty).',
            '3. `reciprocal_rank_fusion([hits_1, hits_2, hits_3])` produces the unified candidate pool.'
          ]
        },
        practicalRelevance: {
          summary: 'Combines directly with async I/O (Phase 02) and RRF (Phase 05) to boost Recall@k.',
          examples: [
            'Turning `"How do we secure RAG?"` into 3 parallel queries covering `"prompt injection and untrusted retrieved documents"`, `"RBAC metadata filtering in vector search"`, and `"PII redaction in ingestion pipelines"`.'
          ]
        },
        whatToLearn: [
          'Implement concurrent multi-query fan-out and RRF deduplication in async Python.'
        ],
        resources: [
          {
            id: 'res-p05-15a',
            title: 'Qdrant — Multi-Query and Batch Hybrid Prefetching',
            url: 'https://qdrant.tech/documentation/hybrid-queries/',
            type: 'Official Documentation',
            whyStudy: 'Shows how multiple prefetch queries can be fused in a single Qdrant operation.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-rrf', 'p05-query-decomposition']
      },
      {
        id: 'p05-query-decomposition',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 16,
        title: 'Query Decomposition',
        subtitle: 'Breaking multi-hop and comparative questions into atomic sub-questions',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-multi-query'],
        technologies: ['Sub-Query Planning', 'Comparative Retrieval'],
        whatIsIt: [
          'Unlike Multi-Query Retrieval (which generates 3 variations of the *same* question), Query Decomposition takes a compound or comparative question—such as `"Compare how Qdrant HNSW and PostgreSQL pgvector IVFFlat handle memory usage and dynamic inserts"`—and breaks it into atomic, independent sub-questions: (1) `"Qdrant HNSW memory usage and dynamic vector insertion"`, and (2) `"pgvector IVFFlat memory usage and index rebuild on insert"`.'
        ],
        whyItExists: [
          'If you search a single combined vector for `"Compare X and Y"`, you might retrieve 5 chunks all about X and 0 chunks about Y (if X has more documents in the corpus), leaving the LLM unable to compare them!'
        ],
        howItWorks: {
          explanation: [
            'Decompose the compound query into `N` atomic sub-queries, allocate a guaranteed retrieval quota (`top_k / N` chunks) to each sub-query independently, and pass the balanced union of evidence to the synthesizer.'
          ]
        },
        practicalRelevance: {
          summary: 'Essential for comparative queries and multi-hop reasoning; serves as a direct bridge to Agentic RAG in Phase 10.',
          examples: [
            'Ensuring a comparison between v1 and v2 API specifications retrieves top-3 chunks filtered to `version=v1` and top-3 chunks filtered to `version=v2`.'
          ]
        },
        whatToLearn: [
          'Distinguish between Multi-Query Expansion (paraphrases of one intent) and Query Decomposition (splitting multi-part/comparative intents into atomic sub-queries with balanced retrieval quotas).'
        ],
        resources: [
          {
            id: 'res-p05-16a',
            title: 'Microsoft RAG Guide — Query Decomposition & Multi-Hop Retrieval',
            url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation',
            type: 'Architecture Guide',
            whyStudy: 'Explains sub-question decomposition for complex analytical queries.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-multi-query', 'p10-query-decomposition']
      },
      {
        id: 'p05-reranking',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 17,
        title: 'Reranking',
        subtitle: 'Refining L1 candidate recall into high-precision top-k order for the LLM context',
        difficulty: 'Intermediate',
        estimatedEffort: '1 hour',
        prerequisites: ['p05-ir-fundamentals', 'p05-hybrid-retrieval'],
        technologies: ['L2 Reranking', 'Cohere Rerank', 'BAAI/bge-reranker', 'FlashRank'],
        whatIsIt: [
          'Reranking is the second stage (L2) of the retrieval funnel. After L1 hybrid retrieval quickly fetches the top 25–50 candidate chunks from millions of records, a specialized Reranker model scores each `(query, candidate_chunk)` pair directly and re-sorts them so the top 5 most genuinely relevant passages sit at positions 1..5.'
        ],
        whyItExists: [
          'Bi-encoders (dense vector search) must compress a 400-token chunk into a single 768-float vector *without knowing what question the user will ask*. Fine-grained interactions between query tokens and document tokens are lost during vector pooling. A reranker inspects the query and the document *together*, recovering that lost precision.'
        ],
        howItWorks: {
          explanation: [
            'Why not run the reranker over all 1,000,000 chunks? Because running a full transformer forward pass on 1,000,000 `(query, chunk)` pairs at query time would take hours! Running it only on the top 25 L1 candidates takes ~40–80 milliseconds.'
          ],
          diagram: {
            type: 'hybrid-retrieval',
            caption: 'Inspect how Stage L2 Cross-Encoder Reranking re-orders L1 hybrid candidates.'
          }
        },
        practicalRelevance: {
          summary: 'Adding a Cross-Encoder Reranker on top of Hybrid RRF search consistently delivers the largest single jump in Context Precision@5 in RAG benchmarks.',
          examples: [
            'Retrieving 25 candidates via Qdrant Hybrid RRF, reranking them with `bge-reranker-v2-m3` or Cohere Rerank, and passing only the top 5 to Gemini.'
          ]
        },
        whatToLearn: [
          'Explain why two-stage retrieval (L1 fast Bi-Encoder/BM25 → L2 precise Reranker) achieves both low latency and high precision.',
          'Integrate a reranking step into your retrieval pipeline.'
        ],
        resources: [
          {
            id: 'res-p05-17a',
            title: 'Pinecone — Rerankers and Two-Stage Retrieval Guide',
            url: 'https://www.pinecone.io/learn/series/rag/rerankers/',
            type: 'Architecture Guide',
            whyStudy: 'Must-read engineering guide on why and how rerankers dramatically boost RAG quality.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-cross-encoders', 'p05-context-compression']
      },
      {
        id: 'p05-cross-encoders',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 18,
        title: 'Cross-Encoders',
        subtitle: 'Full token-to-token cross-attention mechanics vs Bi-Encoder dot products',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-dense-retrieval', 'p05-reranking'],
        technologies: ['Cross-Attention', 'Bi-Encoder vs Cross-Encoder', 'ColBERT Late Interaction'],
        whatIsIt: [
          'A Cross-Encoder concatenates the query tokens and document chunk tokens into a single sequence `[CLS] Query Tokens [SEP] Document Tokens [SEP]` and feeds them jointly through a Transformer encoder. Every query token attends directly to every document token across all 12–24 attention layers, outputting a single calibrated relevance logit `s ∈ ℝ`.'
        ],
        whyItExists: [
          'Because every query token interacts with every document token via self-attention before any pooling occurs, Cross-Encoders accurately resolve negations, multi-word relational constraints, and subtle semantic nuances that single-vector Bi-Encoders miss.'
        ],
        howItWorks: {
          explanation: [
            'Compare the architecture spectrum:',
            '• Bi-Encoder: `sim(E(Q), E(D))` — Offline indexable, O(1) dot product per candidate, lower precision.',
            '• Late Interaction (ColBERT): Keeps per-token vectors and computes `MaxSim` operator — indexable with higher memory footprint.',
            '• Cross-Encoder: `Classifier(Transformer([Q; D]))` — Cannot be pre-indexed offline; requires 1 forward pass per candidate at query time; highest relevance accuracy.'
          ],
          codeOrFormula: `Bi-Encoder Score    = Cosine( Pool(Transformer(Q)), Pool(Transformer(D)) )
Cross-Encoder Score = Sigmoid( Linear( Pool(Transformer(Concat(Q, D))) ) )`
        },
        practicalRelevance: {
          summary: 'Deeply understanding Bi-Encoder vs Cross-Encoder attention mechanics is a hallmark of a strong RAG systems engineer.',
          examples: [
            'Batching 20 `(query, chunk_i)` pairs into a single GPU tensor forward pass through a Cross-Encoder to score all 20 candidates in 45ms.'
          ]
        },
        whatToLearn: [
          'Contrast Bi-Encoders, Late-Interaction models (ColBERT), and Cross-Encoders across indexing capability, memory, latency, and attention depth.'
        ],
        resources: [
          {
            id: 'res-p05-18a',
            title: 'Pinecone — Bi-Encoders vs Cross-Encoders Architecture Deep Dive',
            url: 'https://www.pinecone.io/learn/series/rag/rerankers/',
            type: 'Architecture Guide',
            whyStudy: 'Provides architectural diagrams comparing bi-encoder pooling with cross-encoder full self-attention.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-reranking', 'p05-latency-optimization']
      },
      {
        id: 'p05-context-compression',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 19,
        title: 'Context Compression',
        subtitle: 'Pruning irrelevant sentences from retrieved chunks before LLM synthesis',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-reranking', 'p04-parent-child-retrieval'],
        technologies: ['Sentence Filtering', 'Extractive Compression'],
        isOptionalOrAdvanced: true,
        whatIsIt: [
          'Even inside a relevant 800-token Parent chunk, perhaps only 200 tokens directly address the user’s question while the remaining 600 tokens discuss adjacent config flags. Context compression scores individual sentences or sub-paragraphs within retrieved chunks and strips out low-relevance boilerplate before assembling the final LLM prompt.'
        ],
        whyItExists: [
          'Reduces input token cost, decreases LLM prefill latency (TTFT), and prevents irrelevant sibling paragraphs from distracting the generation model.'
        ],
        howItWorks: {
          explanation: [
            'Prefer fast embedding-based or cross-encoder sentence-level filtering over making a slow extra generative LLM call just to compress context (an extra LLM call for compression often adds more latency than it saves!).'
          ]
        },
        practicalRelevance: {
          summary: 'Always verify that your context compression step saves more prefill latency/cost than the compute it takes to run.',
          examples: [
            'Using sentence-level similarity scores to keep relevant sentences plus a ±1 sentence neighborhood window inside large Parent chunks.'
          ]
        },
        whatToLearn: [
          'Implement fast extractive sentence filtering over retrieved chunks.',
          'Evaluate the latency net-benefit of context compression before enabling it in production.'
        ],
        resources: [
          {
            id: 'res-p05-19a',
            title: 'Microsoft RAG Guide — Context Optimization & Compression',
            url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation',
            type: 'Architecture Guide',
            whyStudy: 'Discusses post-retrieval context refinement and token budget optimization.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p01-tokens-cost', 'p04-parent-child-retrieval']
      },
      {
        id: 'p05-precision-recall',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 20,
        title: 'Retrieval Precision and Recall',
        subtitle: 'Quantifying retrieval completeness vs noise ratio at cutoff k',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-top-k-retrieval'],
        technologies: ['Precision@K', 'Recall@K', 'Trade-off Curve'],
        whatIsIt: [
          'Given a query with a set of truly relevant ground-truth chunks `G` and a top-k retrieved set `R_k`:',
          '• `Precision@k = |R_k ∩ G| / k`: What fraction of the `k` retrieved chunks are actually relevant? (Measures signal-to-noise ratio in the prompt).',
          '• `Recall@k = |R_k ∩ G| / |G|`: What fraction of all truly relevant chunks in the entire database did we manage to capture inside the top `k`? (Measures completeness).'
        ],
        whyItExists: [
          'In a two-stage retrieval funnel, Stage L1 (Hybrid search at `k = 30`) optimizes for **Recall@30** (make sure the right answer is somewhere in those 30 candidates!), whereas Stage L2 (Reranker narrowing to `k = 5`) optimizes for **Precision@5** (make sure the 5 chunks sent to the LLM contain minimal noise!).'
        ],
        howItWorks: {
          explanation: [
            'As `k` increases, `Recall@k` monotonically increases (or stays flat), while `Precision@k` typically decreases.'
          ],
          codeOrFormula: `Precision@k = (# of relevant chunks in top k) / k
Recall@k    = (# of relevant chunks in top k) / (Total # of relevant chunks for query)`
        },
        practicalRelevance: {
          summary: 'Understanding that L1 optimizes Recall@K_large and L2 Reranking optimizes Precision@K_small guides every tuning decision in Phase 05 and Phase 07.',
          examples: [
            'Diagnosing that Recall@25 is 0.96 (L1 hybrid search found the answer) while Recall@5 without reranking was 0.62—proving a reranker is needed.'
          ]
        },
        whatToLearn: [
          'Calculate Precision@k and Recall@k by hand and in Python.',
          'Explain why L1 retrieval targets high Recall and L2 reranking targets high Precision.'
        ],
        resources: [
          {
            id: 'res-p05-20a',
            title: 'Ragas Documentation — Context Precision and Context Recall',
            url: 'https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/',
            type: 'Official Documentation',
            whyStudy: 'Formalizes precision and recall metrics for RAG retrieval evaluation.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p07-precision-at-k', 'p07-recall-at-k']
      },
      {
        id: 'p05-latency-optimization',
        phaseId: 'phase-05',
        phaseNumber: '05',
        order: 21,
        title: 'Retrieval Latency and Optimization',
        subtitle: 'End-to-end latency budgets across query rewriting, embedding, ANN search, and reranking',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-hybrid-retrieval', 'p05-reranking'],
        technologies: ['Latency Profiling', 'gRPC', 'Batching', 'Semantic Caching'],
        whatIsIt: [
          'Every component added to an advanced retrieval pipeline consumes wall-clock latency before the generative LLM even starts its first token prefill. Retrieval latency optimization budgets and parallelizes each stage so total retrieval stays under 150–350ms.'
        ],
        whyItExists: [
          'Chaining synchronous LLM query rewriting (500ms) + sequential multi-query embedding (400ms) + HTTP REST vector search (60ms) + CPU cross-encoder reranking (900ms) adds nearly 2 full seconds of delay before generation even begins.'
        ],
        howItWorks: {
          explanation: [
            '1. Use gRPC (`prefer_grpc=True` in Qdrant) instead of HTTP/JSON for vector queries.',
            '2. Batch all multi-query strings into a single `embed_content` API call.',
            '3. Skip LLM query rewriting on Turn 1 when the query is already standalone.',
            '4. Cap Cross-Encoder candidate depth to `top 15–20` fused hits rather than 100.'
          ],
          codeOrFormula: `Typical Optimized Retrieval Budget (~180ms total):
- Query Embedding (Batch): ~45ms
- Qdrant Hybrid Prefetch + RRF (gRPC): ~12ms
- GPU/Quantized Reranker (Top 15 → Top 5): ~55ms`
        },
        practicalRelevance: {
          summary: 'Keeps your RAG pipeline snappy while retaining hybrid + reranking quality gains.',
          examples: [
            'Enabling gRPC in `AsyncQdrantClient(url=..., prefer_grpc=True)` and batching embeddings.'
          ]
        },
        whatToLearn: [
          'Profile the wall-clock duration of every sub-stage in a retrieval pipeline.',
          'Apply gRPC transport, embedding batching, and conditional query rewriting to minimize P95 retrieval latency.'
        ],
        resources: [
          {
            id: 'res-p05-21a',
            title: 'Qdrant — Optimizing Retrieval Latency & Performance',
            url: 'https://qdrant.tech/documentation/guides/optimize/',
            type: 'Official Documentation',
            whyStudy: 'Practical engineering guide to tuning Qdrant latency, memory, and throughput.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-vectordb-performance', 'p12-latency-optimization']
      }
    ]
  },
  {
    id: 'phase-06',
    number: '06',
    title: 'Vector Databases',
    shortTitle: 'Vector Databases',
    objective: 'Understand vector databases from their internal data structures (HNSW graphs, quantization, inverted payload indexes, WAL persistence) to production operations using Qdrant.',
    description: 'Because you have a strong background in C/C++ and Data Structures & Algorithms, this phase takes you under the hood of vector search engines: how HNSW navigable small-world graphs work, memory vs disk storage, payload indexing, multitenancy, and how Qdrant compares with pgvector.',
    milestone: 'Deploy a persistent Qdrant instance via Docker, configure a collection with dense + sparse vectors and payload indexes, populate it with chunked embeddings, and benchmark filtered hybrid queries.',
    topics: [
      {
        id: 'p06-what-is-vectordb',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 1,
        title: 'What is a Vector Database?',
        subtitle: 'How a full vector database differs from a standalone ANN library like FAISS',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p03-vector-search'],
        technologies: ['Qdrant', 'pgvector', 'FAISS vs Vector DB'],
        whatIsIt: [
          'A Vector Database (such as Qdrant, Milvus, Weaviate, or PostgreSQL with `pgvector`) is a full storage and query engine purpose-built to store, index, filter, update, and durably persist high-dimensional vectors alongside structured JSON payloads.',
          'Contrast this with an in-memory ANN algorithm library like FAISS (C++): FAISS provides raw mathematical vector index structures over flat arrays of floats, but has no built-in crash-safe Write-Ahead Log (WAL), no live concurrent CRUD mutations without index rebuilds, no JSON payload metadata filtering, and no distributed sharding or REST/gRPC API.'
        ],
        whyItExists: [
          'Production RAG systems require live document insertions, deletions by `doc_id`, strict RBAC metadata pre-filtering, disk persistence across restarts, and concurrent multi-client network access.'
        ],
        howItWorks: {
          explanation: [
            'A vector database segments data into independent shards/segments, where each segment maintains: (1) Vector Storage (in-RAM or memory-mapped `mmap` on disk), (2) an ANN Vector Index (HNSW graph), (3) Payload Storage (JSON documents), (4) an Inverted Payload Index, and (5) a Write-Ahead Log (WAL) for crash durability.'
          ]
        },
        practicalRelevance: {
          summary: 'Explains why you use Qdrant (written in Rust) or PostgreSQL + pgvector in production rather than saving raw `.npy` files to disk.',
          examples: [
            'Using Qdrant as a unified dense + sparse + metadata filtering engine, or choosing `pgvector` when a team wants to keep relational tables and embeddings inside a single existing PostgreSQL cluster.'
          ]
        },
        whatToLearn: [
          'Contrast a standalone ANN library (FAISS) with a full Vector Database (Qdrant).',
          'Compare purpose-built vector databases (Qdrant) with relational extensions (`pgvector`) across scale, filtering performance, and operational footprint.'
        ],
        resources: [
          {
            id: 'res-p06-1a',
            title: 'Qdrant Documentation — Architecture & Core Concepts Overview',
            url: 'https://qdrant.tech/documentation/',
            type: 'Official Documentation',
            whyStudy: 'Official documentation for Qdrant’s storage engine, collections, points, and indexing architecture.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-vector-indexing', 'p06-collections-records']
      },
      {
        id: 'p06-vector-indexing',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 2,
        title: 'Vector Indexing',
        subtitle: 'Why traditional B-trees and kd-trees fail in high dimensions (The Curse of Dimensionality)',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p06-what-is-vectordb'],
        technologies: ['Curse of Dimensionality', 'IVF', 'HNSW', 'DiskANN'],
        whatIsIt: [
          'From your algorithms background, you know how B-trees index 1D scalars in `O(log N)` time and how kd-trees or R-trees index 2D/3D spatial coordinates. However, for `D > 20` (and embeddings have `D = 768` to `3072`), space-partitioning trees degrade completely to `O(N)` linear scans due to the Curse of Dimensionality.'
        ],
        whyItExists: [
          'In a 768-dimensional space, the volume of a hypersphere concentrates entirely in its outer shell, and any query ball intersects almost every hyper-rectangle partition of a kd-tree. Therefore, high-dimensional vector indexing requires specialized approximate paradigms: Clustering/Inverted File indexes (`IVF`), Proximity Graph indexes (`HNSW`, `DiskANN/Vamana`), and Quantization (`PQ`, `SQ`).'
        ],
        howItWorks: {
          explanation: [
            '1. Inverted File (IVF): Runs k-means clustering to partition the space into `C` Voronoi centroids. At query time, searches only the `nprobe` closest clusters.',
            '2. Proximity Graphs (HNSW): Connects vectors by edges to their nearest neighbors in a multi-layer graph and traverses greedily toward the query.'
          ]
        },
        practicalRelevance: {
          summary: 'Connects your Design and Analysis of Algorithms background directly to modern high-dimensional indexing theory.',
          examples: [
            'Understanding why HNSW dominates IVF on recall-vs-latency curves and supports incremental point insertion without global k-means re-clustering.'
          ]
        },
        whatToLearn: [
          'Explain why kd-trees fail in 768 dimensions.',
          'Contrast clustering-based indexes (IVF) against proximity-graph indexes (HNSW).'
        ],
        resources: [
          {
            id: 'res-p06-2a',
            title: 'Qdrant Documentation — Vector Indexing Internals',
            url: 'https://qdrant.tech/documentation/concepts/indexing/',
            type: 'Official Documentation',
            whyStudy: 'Details how Qdrant builds and maintains vector and payload indexes across segments.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-ann-search', 'p06-hnsw']
      },
      {
        id: 'p06-ann-search',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 3,
        title: 'Approximate Nearest Neighbor (ANN) Search',
        subtitle: 'Trading 1% theoretical exactness for a 100x–1000x latency speedup',
        difficulty: 'Intermediate',
        estimatedEffort: '30 mins',
        prerequisites: ['p06-vector-indexing'],
        technologies: ['ANN Recall@K', 'Queries Per Second (QPS)'],
        whatIsIt: [
          'Approximate Nearest Neighbor (ANN) search relaxes the strict guarantee of finding the mathematical exact top-k vectors across all `N` points, instead returning a top-k set that overlaps 95%–99%+ (`ANN Recall@k`) with the exact brute-force top-k while inspecting only a tiny fraction (e.g., 0.1%) of the vectors.'
        ],
        whyItExists: [
          'Note that embedding models themselves are statistical approximations of semantic meaning! Spending 500ms of brute-force CPU compute to guarantee 100.0% exact geometric neighbors on an approximate embedding vector is a terrible engineering trade-off compared to spending 3ms with 99% ANN recall.'
        ],
        howItWorks: {
          explanation: [
            'Every ANN algorithm exposes a tunable runtime knob (such as `hnsw_ef` in HNSW) that lets you dynamically slide along the Recall-vs-Latency (QPS) Pareto curve at query time without rebuilding the index.'
          ]
        },
        practicalRelevance: {
          summary: 'Distinguish between Index Recall (ANN vs Exact k-NN) and End-to-End Retrieval Recall (Retrieved Chunks vs Ground-Truth Relevant Documents).',
          examples: [
            'Setting `hnsw_ef=128` at query time to achieve 99% ANN recall in <5ms.'
          ]
        },
        whatToLearn: [
          'Define ANN Recall@k relative to exact k-NN search.',
          'Understand the Recall-vs-QPS trade-off curve.'
        ],
        resources: [
          {
            id: 'res-p06-3a',
            title: 'Qdrant — Search Quality and ANN Recall Tuning',
            url: 'https://qdrant.tech/documentation/concepts/search/',
            type: 'Official Documentation',
            whyStudy: 'Explains how ANN search parameters trade off search speed against recall accuracy.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-exact-vs-approx', 'p06-hnsw']
      },
      {
        id: 'p06-exact-vs-approx',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 4,
        title: 'Exact vs Approximate Search',
        subtitle: 'When vector databases automatically switch between flat exact scans and HNSW graphs',
        difficulty: 'Intermediate',
        estimatedEffort: '30 mins',
        prerequisites: ['p06-ann-search'],
        technologies: ['indexing_threshold', 'Exact Mode', 'SIMD Brute Force'],
        whatIsIt: [
          'Vector databases like Qdrant do not use HNSW for small collections or highly restrictive metadata filters! Below a configurable threshold (e.g., `indexing_threshold = 20,000` vectors, or when a metadata filter matches fewer than a few thousand points), Qdrant automatically executes an exact SIMD brute-force vector scan.'
        ],
        whyItExists: [
          'Modern CPUs with AVX-512 / NEON SIMD instructions can compute 10,000 dot products in under 1 millisecond—faster than pointer-chasing through a non-contiguous HNSW graph in RAM, while giving 100% exact accuracy!'
        ],
        howItWorks: {
          explanation: [
            'You can also force `exact=True` in `SearchParams` during debugging to measure whether a missed chunk was caused by the HNSW graph approximation or by the embedding model itself.'
          ]
        },
        practicalRelevance: {
          summary: 'Running a query with `exact=True` vs `exact=False` is the definitive diagnostic test for verifying HNSW index health.',
          examples: [
            'Toggling `SearchParams(exact=True)` in a test script to verify that your HNSW index achieves >98% overlap with exact search.'
          ]
        },
        whatToLearn: [
          'Understand why SIMD flat scans outperform graph pointer-chasing on small vector sets (<10k–20k vectors).',
          'Use `exact=True` as a diagnostic benchmark tool.'
        ],
        resources: [
          {
            id: 'res-p06-4a',
            title: 'Qdrant — Optimizer & Indexing Threshold Configuration',
            url: 'https://qdrant.tech/documentation/concepts/optimizer/',
            type: 'Official Documentation',
            whyStudy: 'Explains how segments transition from unindexed exact scan to HNSW indexed segments.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-hnsw', 'p06-vectordb-performance']
      },
      {
        id: 'p06-hnsw',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 5,
        title: 'HNSW (Hierarchical Navigable Small World)',
        subtitle: 'Multi-layer skip-list proximity graphs and tuning m, ef_construct, and hnsw_ef',
        difficulty: 'Advanced',
        estimatedEffort: '1.5 hours',
        prerequisites: ['p06-vector-indexing', 'p06-ann-search'],
        technologies: ['HNSW (Malkov & Yashunin, 2016)', 'Skip Lists', 'Small-World Graphs'],
        whatIsIt: [
          'HNSW (Malkov & Yashunin, 2016) is the dominant graph-based ANN algorithm in modern vector databases. Given your background in Data Structures and Algorithms, the cleanest way to understand HNSW is as the marriage of two classic data structures: a **Probabilistic Skip List** (hierarchical layers with exponentially decaying node counts from bottom Layer 0 up to top Layer L) and a **Navigable Small-World (NSW) Proximity Graph** (where nodes are connected by edges to their nearest neighbors).'
        ],
        whyItExists: [
          'In a single-layer proximity graph, greedy routing from a random entry node requires many short hops across the graph and can get trapped in local minima. Adding hierarchical expressway layers allows the search to start at the sparse top layer (taking huge long-range geometric leaps across the vector space) and progressively zoom in down to Layer 0 (which contains all N vectors) in logarithmic `O(log N)` hops!'
        ],
        howItWorks: {
          explanation: [
            'During search, traversal begins at the entry point in the highest layer `L`, greedily moving to any neighbor closer to query `q` until reaching a local minimum, then drops down to `L - 1` from that node, repeating until Layer 0 where a dynamic priority queue of size `hnsw_ef` explores the local neighborhood.',
            'Three Critical Hyperparameters you must master:',
            '1. `m` (default 16): Maximum number of bidirectional edges per node in graph layers. Higher `m` (e.g., 32–64) increases recall on high-dimensional data but increases RAM usage and index build time.',
            '2. `ef_construct` (default 100): Size of the dynamic candidate list during *index building*. Higher `ef_construct` builds a higher-quality graph (slower indexing, zero impact on query RAM).',
            '3. `hnsw_ef` (query time): Size of the dynamic candidate priority queue during *search*. Higher `hnsw_ef` inspects more neighbors at query time (higher recall, higher query latency).'
          ],
          codeOrFormula: `// HNSW Complexity & Tuning Summary:
Search Time Complexity: O(log N) expected distance evaluations
Graph RAM Overhead per Vector ≈ M * 2 * 4 bytes (on top of raw vector bytes)
- m (16..64): Graph degree (RAM vs Recall)
- ef_construct (100..400): Build-time beam width (Build speed vs Graph quality)
- hnsw_ef (32..256): Query-time beam width (Query latency vs Recall)`
        },
        practicalRelevance: {
          summary: 'Understanding how `m`, `ef_construct`, and `hnsw_ef` control the HNSW skip-list graph separates engineers who understand vector databases from those who only copy-paste tutorials.',
          examples: [
            'Increasing `hnsw_ef` from 64 to 128 at query time to boost recall without having to rebuild the collection.'
          ]
        },
        whatToLearn: [
          'Explain the Skip-List + Proximity Graph structure of HNSW.',
          'Trace greedy layer descent from Layer L down to Layer 0.',
          'Explain the exact role and trade-offs of `m`, `ef_construct`, and `hnsw_ef`.'
        ],
        resources: [
          {
            id: 'res-p06-5a',
            title: 'Efficient and Robust Approximate Nearest Neighbor Search Using HNSW Graphs (Malkov & Yashunin, 2016)',
            url: 'https://arxiv.org/abs/1603.09320',
            type: 'Research Paper',
            whyStudy: 'The original HNSW paper—remarkably readable for anyone with a Data Structures & Algorithms background.',
            priority: 'Essential'
          },
          {
            id: 'res-p06-5b',
            title: 'Qdrant Documentation — HNSW Index Configuration & Parameters',
            url: 'https://qdrant.tech/documentation/concepts/indexing/#vector-index',
            type: 'Official Documentation',
            whyStudy: 'Shows how `m`, `ef_construct`, and ` payload_m` are configured in Qdrant.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-vector-indexing', 'p06-filtering', 'p06-storage-memory']
      },
      {
        id: 'p06-distance-metrics',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 6,
        title: 'Distance Metrics in Vector Databases',
        subtitle: 'Configuring Cosine, Dot, Euclid, and Manhattan metrics at collection creation',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p03-similarity-measures'],
        technologies: ['Distance.COSINE', 'Distance.DOT', 'SIMD Hardware Acceleration'],
        whatIsIt: [
          'When creating a vector collection, each vector field must be bound to an immutable distance metric (`Distance.COSINE`, `Distance.DOT`, `Distance.EUCLID`, or `Distance.MANHATTAN`) because the HNSW graph links neighbors according to that metric.'
        ],
        whyItExists: [
          'Matching the database distance metric to the metric used during the embedding model’s contrastive pre-training ensures optimal geometric neighbor neighborhoods.'
        ],
        howItWorks: {
          explanation: [
            'When `Distance.COSINE` is selected in Qdrant, Qdrant normalizes every incoming vector to unit L2 length once on write and executes hardware-accelerated SIMD Dot Product instructions during HNSW traversal.'
          ]
        },
        practicalRelevance: {
          summary: 'Default to `Distance.COSINE` for dense text embeddings unless a model specifically requires unnormalized dot products.',
          examples: [
            'Configuring `VectorParams(size=768, distance=Distance.COSINE)` when initializing a collection for `gemini-embedding-001`.'
          ]
        },
        whatToLearn: [
          'Configure vector distance metrics properly upon collection creation.'
        ],
        resources: [
          {
            id: 'res-p06-6a',
            title: 'Qdrant — Distance Metrics Reference',
            url: 'https://qdrant.tech/documentation/concepts/search/#metrics',
            type: 'Official Documentation',
            whyStudy: 'Specifies mathematical formulas and normalization rules in Qdrant.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p03-similarity-measures', 'p06-collections-records']
      },
      {
        id: 'p06-collections-records',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 7,
        title: 'Collections and Records (Points)',
        subtitle: 'Designing named vector schemas and point lifecycles',
        difficulty: 'Foundational',
        estimatedEffort: '45 mins',
        prerequisites: ['p06-what-is-vectordb'],
        technologies: ['Collections', 'Points', 'Named Vectors'],
        whatIsIt: [
          'In Qdrant terminology, a **Collection** is an indexed namespace of items (analogous to a table in SQL), and a **Point** (record) is the fundamental data unit consisting of three components: `(id: UUID | uint64, vector: NamedVectors, payload: JSONDict)`.'
        ],
        whyItExists: [
          'A single Point can hold multiple named vectors simultaneously—for instance, `"dense": float32[768]` and `"sparse_bm25": SparseVector`—allowing hybrid search over a single unified record without data duplication.'
        ],
        howItWorks: {
          explanation: [
            'Never create a separate collection per user or per document! Instead, use one collection per logical domain/embedding schema and partition documents or tenants via indexed payload fields.'
          ],
          codeOrFormula: `from qdrant_client import QdrantClient, models

client = QdrantClient(url="http://localhost:6333")
client.create_collection(
    collection_name="knowledge_base",
    vectors_config={"dense": models.VectorParams(size=768, distance=models.Distance.COSINE)},
    sparse_vectors_config={"sparse_bm25": models.SparseVectorParams()}
)`
        },
        practicalRelevance: {
          summary: 'Establishes the schema you will use in your Phase 06 milestone and Phase 13 Capstone.',
          examples: [
            'Upserting batches of 100 `PointStruct` records containing dense vectors, sparse BM25 vectors, and chunk metadata.'
          ]
        },
        whatToLearn: [
          'Create collections with both dense and sparse named vector configurations.',
          'Perform batch `upsert`, `retrieve`, `scroll`, and `delete` operations on points.'
        ],
        resources: [
          {
            id: 'res-p06-7a',
            title: 'Qdrant Documentation — Collections and Points',
            url: 'https://qdrant.tech/documentation/concepts/collections/',
            type: 'Official Documentation',
            whyStudy: 'Official guide to collection lifecycle, named vectors, and point operations.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-payloads-metadata', 'p06-multitenancy']
      },
      {
        id: 'p06-payloads-metadata',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 8,
        title: 'Payloads and Metadata Storage',
        subtitle: 'Storing chunk text, provenance fields, and typed attributes alongside vectors',
        difficulty: 'Foundational',
        estimatedEffort: '30 mins',
        prerequisites: ['p04-doc-metadata', 'p06-collections-records'],
        technologies: ['Payload Types', 'On-Disk Payload Storage'],
        whatIsIt: [
          'A point’s `payload` is a schemaless JSON object stored alongside its vectors. It holds both filterable attributes (`doc_id`, `tenant_id`, `category`, `created_at`, `allowed_roles`) and retrieval display fields (`chunk_text`, `source_uri`, `title`, `section_path`).'
        ],
        whyItExists: [
          'Storing `chunk_text` and citation metadata directly in the payload (configured with `on_disk_payload=True` for large collections) allows a single Qdrant query to return ready-to-use text and citations in one network roundtrip.'
        ],
        howItWorks: {
          explanation: [
            'Keep large unindexed text (`chunk_text`) on disk (`on_disk_payload=True`) so RAM is reserved strictly for HNSW graphs and frequently filtered payload indexes.'
          ]
        },
        practicalRelevance: {
          summary: 'Saves RAM on large collections while preserving single-hop retrieval hydration.',
          examples: [
            'Using `with_payload=["chunk_text", "source_uri", "doc_id"]` to fetch only necessary payload fields over the wire.'
          ]
        },
        whatToLearn: [
          'Structure point payloads cleanly and configure `on_disk_payload` for memory efficiency.'
        ],
        resources: [
          {
            id: 'res-p06-8a',
            title: 'Qdrant Documentation — Payload Concepts',
            url: 'https://qdrant.tech/documentation/concepts/payload/',
            type: 'Official Documentation',
            whyStudy: 'Covers payload data types, storage options, and field projection.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-filtering', 'p06-indexing']
      },
      {
        id: 'p06-filtering',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 9,
        title: 'Filtering in Vector Databases',
        subtitle: 'How Filterable HNSW avoids the disconnected-graph problem during filtered search',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p05-metadata-filtering', 'p06-hnsw'],
        technologies: ['Filterable HNSW', 'Subgraph Connectivity', 'Cardinality Switching'],
        whatIsIt: [
          'When you apply a metadata filter (`category == "security"`) during an HNSW search, disallowing visits to non-matching nodes can break the connectivity of the HNSW graph ("disconnected graph problem"), marooning the greedy search before it reaches the true nearest neighbors.'
        ],
        whyItExists: [
          'Understanding how the query planner solves filtered HNSW search is essential for configuring payload indexes properly.'
        ],
        howItWorks: {
          explanation: [
            'Qdrant solves this via two mechanisms:',
            '1. Adaptive Query Planner: If the payload index estimates that the filter matches fewer points than `full_scan_threshold`, Qdrant skips HNSW altogether and runs an exact SIMD scan over only the matching points from the inverted payload index.',
            '2. Additional Subgraph Edges (`payload_m`): For indexed keyword fields, Qdrant builds extra HNSW edges connecting points that share the same payload value (e.g., same `tenant_id`), guaranteeing graph connectivity within each filter value!'
          ]
        },
        practicalRelevance: {
          summary: 'Explains why creating a payload index in Qdrant not only speeds up bitmap filtering, but actually alters the HNSW graph topology to preserve recall!',
          examples: [
            'Creating a keyword payload index on `tenant_id` so every tenant gets a connected subgraph inside the shared HNSW index.'
          ]
        },
        whatToLearn: [
          'Explain the disconnected-graph problem in filtered HNSW search and how subgraph edge augmentation (`payload_m`) + cardinality switching resolve it.'
        ],
        resources: [
          {
            id: 'res-p06-9a',
            title: 'Qdrant — Filtered Vector Search & Filterable HNSW Internals',
            url: 'https://qdrant.tech/documentation/concepts/filtering/',
            type: 'Official Documentation',
            whyStudy: 'Explains Qdrant’s filterable HNSW algorithm and query planner.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-indexing', 'p06-multitenancy']
      },
      {
        id: 'p06-indexing',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 10,
        title: 'Payload and Vector Indexing Operations',
        subtitle: 'Creating secondary payload indexes and managing background segment optimizers',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p06-filtering', 'p06-hnsw'],
        technologies: ['create_payload_index', 'Segment Optimizer'],
        whatIsIt: [
          'In Qdrant, vector HNSW indexing happens automatically in background optimizer threads once a segment exceeds `indexing_threshold`, whereas **Payload Indexes** on metadata fields (`doc_id`, `tenant_id`, `created_at`) must be explicitly declared via `client.create_payload_index(...)`.'
        ],
        whyItExists: [
          'Without declaring a payload index on filtered fields, the database must scan every JSON payload sequentially during filtering AND cannot build filterable HNSW subgraph links.'
        ],
        howItWorks: {
          explanation: [
            'Always call `create_payload_index` for every field used in `Filter` clauses (`KEYWORD`, `INTEGER`, `DATETIME`, `UUID`) right after creating the collection.'
          ],
          codeOrFormula: `client.create_payload_index(
    collection_name="knowledge_base",
    field_name="tenant_id",
    field_schema=models.PayloadSchemaType.KEYWORD,
)
client.create_payload_index(
    collection_name="knowledge_base",
    field_name="doc_id",
    field_schema=models.PayloadSchemaType.KEYWORD,
)`
        },
        practicalRelevance: {
          summary: 'Forgetting `create_payload_index` is the #1 configuration mistake engineers make when deploying Qdrant.',
          examples: [
            'Declaring payload indexes on `doc_id`, `tenant_id`, and `allowed_roles` in your collection bootstrap script.'
          ]
        },
        whatToLearn: [
          'Create payload indexes for all filtered metadata fields.',
          'Understand how Qdrant’s background Segment Optimizer merges small append segments into indexed HNSW segments.'
        ],
        resources: [
          {
            id: 'res-p06-10a',
            title: 'Qdrant Documentation — Payload & Vector Indexing Guide',
            url: 'https://qdrant.tech/documentation/concepts/indexing/',
            type: 'Official Documentation',
            whyStudy: 'Complete reference on `create_payload_index` schema types and HNSW index creation.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-filtering', 'p06-storage-memory']
      },
      {
        id: 'p06-storage-memory',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 11,
        title: 'Storage, Memory, and Vector Quantization',
        subtitle: 'In-RAM vs mmap disk storage, Scalar Quantization (INT8), and Binary Quantization',
        difficulty: 'Advanced',
        estimatedEffort: '1 hour',
        prerequisites: ['p03-vector-representations', 'p06-hnsw'],
        technologies: ['mmap', 'Scalar Quantization (INT8)', 'Product Quantization', 'Binary Quantization'],
        whatIsIt: [
          'Vector databases can consume significant RAM if all `float32` vectors and HNSW graphs live in memory. Storage and Quantization techniques compress vectors and manage the boundary between fast RAM and NVMe SSDs (`mmap`):',
          '• **Scalar Quantization (SQ8)**: Compresses each `float32` (4 bytes) coordinate into an `int8` (1 byte) bucket—cutting vector memory by **75%** (4x reduction) with <0.5% recall loss and faster SIMD integer CPU caches!',
          '• **Binary Quantization (BQ)**: Compresses each dimension to a single `1-bit` sign (`>0` → 1, `<=0` → 0) with Hamming XOR distance—a **32x** memory reduction for high-dimensional embeddings, paired with exact `float32` rescoring from disk (`oversampling`).'
        ],
        whyItExists: [
          'Storing 10 million 1536-dim `float32` vectors in RAM requires ~61 GB of raw vector memory plus ~10 GB of HNSW graph pointers. With `on_disk=True` (`mmap`) + Scalar Quantization in RAM, RAM drops from >70 GB down to ~18 GB while keeping sub-10ms latency.'
        ],
        howItWorks: {
          explanation: [
            'During search, the engine traverses the HNSW graph using the compact quantized vectors in RAM to gather top `oversampling * k` candidates (e.g., top 30), then reads only those 30 original `float32` vectors from the `mmap` disk file to re-score and return the final top `k`.'
          ],
          codeOrFormula: `Memory Calculation (N vectors, dimension D):
Raw float32 RAM  = N * D * 4 bytes * 1.25 (HNSW overhead)
Scalar INT8 RAM  = N * D * 1 byte  * 1.25 (75% reduction!)`
        },
        practicalRelevance: {
          summary: 'Enabling Scalar Quantization (INT8) with rescoring is virtually a free lunch in production vector databases.',
          examples: [
            'Configuring `ScalarQuantization(scalar=ScalarQuantizationConfig(type=ScalarType.INT8, always_ram=True))` in Qdrant.'
          ]
        },
        whatToLearn: [
          'Calculate RAM requirements for raw `float32`, Scalar Quantized `int8`, and Binary Quantized `1-bit` vectors.',
          'Understand how quantized graph traversal + `float32` disk oversampling/rescoring recovers near-100% accuracy.'
        ],
        resources: [
          {
            id: 'res-p06-11a',
            title: 'Qdrant Documentation — Vector Quantization (Scalar, Product, Binary)',
            url: 'https://qdrant.tech/documentation/guides/quantization/',
            type: 'Official Documentation',
            whyStudy: 'Detailed engineering guide to SQ, PQ, and BQ compression and rescoring mechanics.',
            priority: 'Essential'
          },
          {
            id: 'res-p06-11b',
            title: 'Qdrant Documentation — Storage & Memory-Mapped Files (mmap)',
            url: 'https://qdrant.tech/documentation/concepts/storage/',
            type: 'Official Documentation',
            whyStudy: 'Explains in-memory vs `mmap` on-disk vector and HNSW storage.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-persistence', 'p06-vectordb-performance']
      },
      {
        id: 'p06-persistence',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 12,
        title: 'Persistence, WAL, and Snapshots',
        subtitle: 'Ensuring crash durability, Docker volume mounts, and collection backups',
        difficulty: 'Intermediate',
        estimatedEffort: '30 mins',
        prerequisites: ['p02-docker-containers', 'p06-storage-memory'],
        technologies: ['Write-Ahead Log (WAL)', 'Snapshots', 'Docker Volumes'],
        whatIsIt: [
          'Persistence ensures that vector collections survive process restarts, container redeployments, and power failures. Qdrant records every incoming mutation to an append-only on-disk Write-Ahead Log (WAL) before acknowledging an upsert (`wait=True`), and supports point-in-time Collection Snapshots for backup and disaster recovery.'
        ],
        whyItExists: [
          'Running a Docker container without mounting `/qdrant/storage` to a persistent host volume or cloud block disk means every `docker compose down` wipes your entire embedded knowledge base!'
        ],
        howItWorks: {
          explanation: [
            'Mount a persistent volume to `/qdrant/storage`, use `wait=True` on critical transactional writes, and automate periodic snapshot exports (`client.create_snapshot(collection_name)`).'
          ]
        },
        practicalRelevance: {
          summary: 'Prevents catastrophic loss of indexed embeddings across container restarts.',
          examples: [
            'Restoring a pre-indexed Qdrant collection snapshot onto a new staging server in 5 seconds instead of re-embedding 100,000 chunks.'
          ]
        },
        whatToLearn: [
          'Configure persistent Docker volumes for Qdrant storage.',
          'Create and restore Qdrant collection snapshots.'
        ],
        resources: [
          {
            id: 'res-p06-12a',
            title: 'Qdrant Documentation — Snapshots and Backup Recovery',
            url: 'https://qdrant.tech/documentation/concepts/snapshots/',
            type: 'Official Documentation',
            whyStudy: 'Shows how to create, download, and restore collection snapshots.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p02-docker-containers', 'p06-scalability']
      },
      {
        id: 'p06-scalability',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 13,
        title: 'Scalability: Sharding and Replication',
        subtitle: 'Horizontal partitioning across nodes and high-availability read replicas',
        difficulty: 'Advanced',
        estimatedEffort: '45 mins',
        prerequisites: ['p06-persistence'],
        technologies: ['Sharding', 'Replication Factor', 'Consistent Hashing'],
        isOptionalOrAdvanced: true,
        whatIsIt: [
          'When a collection grows beyond the RAM/disk capacity of a single machine (e.g., >50M vectors) or requires zero-downtime high availability, distributed vector databases scale via two mechanisms:',
          '• **Sharding (`shard_number`)**: Partitioning points horizontally across multiple shards (either automatically via consistent hashing of Point IDs, or explicitly via custom shard keys like `tenant_id`).',
          '• **Replication (`replication_factor`)**: Maintaining `R` synchronized copies of each shard across distinct physical nodes for fault tolerance and parallel read throughput.'
        ],
        whyItExists: [
          'Allows linear horizontal scaling of both storage capacity (sharding) and concurrent query throughput QPS (replication).'
        ],
        howItWorks: {
          explanation: [
            'During an unfiltered search, the coordinator node fans the query out to all shards in parallel and merges their top-k lists; if custom shard keys are used (e.g., sharding by enterprise tenant region), queries only hit the single relevant shard!'
          ]
        },
        practicalRelevance: {
          summary: 'Equips you to design multi-node distributed vector deployments when scaling beyond a single vertical instance.',
          examples: [
            'Setting `replication_factor=2` so a single node maintenance restart causes zero retrieval downtime.'
          ]
        },
        whatToLearn: [
          'Distinguish between Sharding (capacity partitioning) and Replication (availability and read QPS scaling).'
        ],
        resources: [
          {
            id: 'res-p06-13a',
            title: 'Qdrant Documentation — Distributed Deployment, Sharding & Replication',
            url: 'https://qdrant.tech/documentation/guides/distributed_deployment/',
            type: 'Official Documentation',
            whyStudy: 'Explains Raft consensus, shard placement, and replication factors.',
            priority: 'Recommended'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p06-multitenancy', 'p12-scaling-considerations']
      },
      {
        id: 'p06-multitenancy',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 14,
        title: 'Multitenancy in Vector Databases',
        subtitle: 'Why payload-partitioned shared collections beat one-collection-per-tenant',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p06-filtering', 'p06-indexing'],
        technologies: ['is_tenant Payload Index', 'Tiered Multitenancy', 'Custom Shard Keys'],
        whatIsIt: [
          'Multitenancy isolates data belonging to thousands of distinct users or customer organizations (`tenant_id`) inside your vector database so Tenant A can never retrieve vectors belonging to Tenant B.'
        ],
        whyItExists: [
          'A catastrophic beginner anti-pattern is creating a separate Qdrant collection for every user (`collection_user_1`, `collection_user_2`, ..., `collection_user_10000`). Because every collection allocates its own background optimizer threads, WAL files, and memory buffers, creating 5,000 collections will crash the database server with OS file-descriptor and thread exhaustion!'
        ],
        howItWorks: {
          explanation: [
            'The correct architecture uses a **Single Shared Collection** where every point carries `payload.tenant_id`, indexed with Qdrant’s specialized tenant keyword index (`is_tenant=True`, `m=0` global HNSW + dedicated per-tenant HNSW subgraphs). For huge enterprise "whale" tenants, combine with custom shard keys (`shard_key_selector`).'
          ],
          codeOrFormula: `# Configure dedicated tenant-isolated HNSW subgraphs inside a single collection:
client.create_payload_index(
    collection_name="knowledge_base",
    field_name="tenant_id",
    field_schema=models.KeywordIndexParams(
        type="keyword",
        is_tenant=True,  # Optimizes disk locality and subgraph links per tenant!
    ),
)`
        },
        practicalRelevance: {
          summary: 'Prevents the #1 architectural failure mode in multi-user SaaS RAG applications.',
          examples: [
            'Serving 10,000 tenants smoothly inside one Qdrant collection using `is_tenant=True` payload indexing and mandatory `tenant_id` pre-filters.'
          ]
        },
        whatToLearn: [
          'Explain why creating one collection per user/tenant is an anti-pattern.',
          'Configure single-collection multitenancy using `is_tenant=True` payload indexing and mandatory query filters.'
        ],
        resources: [
          {
            id: 'res-p06-14a',
            title: 'Qdrant Documentation — Multitenancy Architecture Guide',
            url: 'https://qdrant.tech/documentation/guides/multiple-partitions/',
            type: 'Official Documentation',
            whyStudy: 'Essential engineering guide detailing payload-based partitioning and tiered multitenancy.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p04-doc-permissions', 'p11-multitenancy']
      },
      {
        id: 'p06-db-security',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 15,
        title: 'Vector Database Security',
        subtitle: 'API keys, TLS encryption, network isolation, and scoped JWT bearer tokens',
        difficulty: 'Intermediate',
        estimatedEffort: '30 mins',
        prerequisites: ['p06-multitenancy'],
        technologies: ['TLS', 'API Key Auth', 'Collection/Payload-Scoped JWTs'],
        whatIsIt: [
          'By default, a local Docker container running Qdrant listens on port `6333` without authentication for local convenience. In any non-local environment, a vector database must be secured via private VPC network isolation, TLS encryption in transit, API keys, and role-scoped access control.'
        ],
        whyItExists: [
          'Exposing port `6333` or `6334` directly to the public internet without authentication allows anyone to dump your entire proprietary document corpus and payload texts in minutes.'
        ],
        howItWorks: {
          explanation: [
            '1. Bind the vector database strictly to a private internal container network (never expose port 6333 publicly; only your FastAPI backend talks to Qdrant).',
            '2. Configure `QDRANT__SERVICE__API_KEY` and read-only keys, or generate Qdrant JWT tokens that cryptographically enforce a mandatory payload filter (e.g., `tenant_id == "org_42"`) at the database engine level!'
          ]
        },
        practicalRelevance: {
          summary: 'Defense-in-depth security ensuring that even a bug in application query code cannot bypass database-level tenant isolation.',
          examples: [
            'Keeping the Qdrant container on an internal Docker network accessible only to the FastAPI backend service with API key authentication enabled.'
          ]
        },
        whatToLearn: [
          'Configure authentication, TLS, and network isolation for Qdrant.',
          'Understand how payload-scoped JWT tokens enforce hardware/engine-level tenant isolation.'
        ],
        resources: [
          {
            id: 'res-p06-15a',
            title: 'Qdrant Documentation — Security, Authentication & Granular Access Control',
            url: 'https://qdrant.tech/documentation/guides/security/',
            type: 'Official Documentation',
            whyStudy: 'Official security hardening checklist covering API keys, TLS, and JWT access control.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p11-authentication', 'p11-authorization']
      },
      {
        id: 'p06-vectordb-performance',
        phaseId: 'phase-06',
        phaseNumber: '06',
        order: 16,
        title: 'Vector Database Performance and Benchmarking',
        subtitle: 'Batch upsert tuning, gRPC transport, and pgvector vs Qdrant comparison',
        difficulty: 'Intermediate',
        estimatedEffort: '45 mins',
        prerequisites: ['p06-hnsw', 'p06-storage-memory'],
        technologies: ['gRPC', 'Batch Upserts', 'pgvector vs Qdrant'],
        whatIsIt: [
          'Vector database performance spans two distinct workloads: Bulk Write Throughput (ingesting millions of vectors rapidly without thrashing the HNSW builder) and Concurrent Read QPS / P99 Latency.'
        ],
        whyItExists: [
          'Inserting 500,000 vectors one point at a time over HTTP with `wait=True` and active HNSW rebuilding can take hours; batching 250–500 points per gRPC call while deferring HNSW indexing until bulk load completes finishes in seconds.'
        ],
        howItWorks: {
          explanation: [
            'Comparison — Qdrant vs PostgreSQL `pgvector`:',
            '• **PostgreSQL + `pgvector`**: Great when vector counts are modest (<1M–5M vectors) and you want ACID transactional joins between relational tables and embeddings inside a single existing Postgres database without operating a second storage engine.',
            '• **Qdrant (Purpose-Built Rust Engine)**: Superior when you need native single-stage Filterable HNSW (`is_tenant`), native Sparse + Dense Hybrid RRF in one query, built-in Scalar/Binary Quantization with disk oversampling, and high concurrent QPS at lower RAM footprints.'
          ]
        },
        practicalRelevance: {
          summary: 'Gives you an objective, engineering-grounded framework for choosing between Qdrant and pgvector in real system design interviews and projects.',
          examples: [
            'Using gRPC batch upserts of 256 points during ingestion and comparing Qdrant vs pgvector trade-offs.'
          ]
        },
        whatToLearn: [
          'Optimize bulk vector ingestion throughput and query P99 latency.',
          'Articulate the concrete architectural trade-offs between Qdrant and PostgreSQL `pgvector`.'
        ],
        resources: [
          {
            id: 'res-p06-16a',
            title: 'Qdrant Documentation — Bulk Upload & Performance Optimization Guide',
            url: 'https://qdrant.tech/documentation/guides/optimize/',
            type: 'Official Documentation',
            whyStudy: 'Actionable recipes for optimizing memory, CPU, and bulk indexing speed.',
            priority: 'Essential'
          }
        ],
        checklist: DEFAULT_CHECKLIST,
        relatedTopics: ['p05-latency-optimization', 'p02-sql-postgresql']
      }
    ]
  }
];
