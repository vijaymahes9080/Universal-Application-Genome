import httpx
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger("uag.ai_engine")

OLLAMA_URL = "http://localhost:11434/api/chat"
DEFAULT_MODEL = "deepseek-coder:6.7b" # Can be configured by user

class AIEngine:
    @staticmethod
    async def chat_completion(prompt: str, system_prompt: str = "") -> str:
        """Attempts to call Ollama chat api; falls back to mock logic on failure."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})
                
                response = await client.post(
                    OLLAMA_URL,
                    json={
                        "model": DEFAULT_MODEL,
                        "messages": messages,
                        "stream": False,
                        "options": {"temperature": 0.3}
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("message", {}).get("content", "")
        except Exception as e:
            logger.warning(f"Ollama integration unavailable: {str(e)}. Using fallback analyzer.")
        return ""

    @classmethod
    async def analyze_code_semantics(cls, file_name: str, code: str) -> Dict[str, Any]:
        """Analyzes code and extracts architectural patterns, dependencies and genes."""
        prompt = f"""
        Analyze this file '{file_name}' and extract its structural genes.
        Identify:
        1. Architecture style
        2. Key components/libraries
        3. Features present (Auth, DB, UI, Payments, etc.)
        
        Respond ONLY with a JSON object containing keys: 'architecture', 'libraries', 'genes' (list of dicts with name, type, description).
        
        Code:
        {code}
        """
        
        resp = await cls.chat_completion(prompt, "You are a software geneticist extracting genes from code.")
        if resp:
            try:
                # Find start of JSON
                start = resp.find("{")
                end = resp.rfind("}")
                if start != -1 and end != -1:
                    return json.loads(resp[start:end+1])
            except Exception:
                pass
                
        # Rule-based fallback parsing
        genes = []
        libraries = []
        arch = "Unknown"
        
        # Check imports/requires
        code_lower = code.lower()
        if "jwt" in code_lower or "login" in code_lower or "auth" in code_lower or "keycloak" in code_lower:
            genes.append({
                "name": "Authentication & Security",
                "type": "Security",
                "description": "Handles authentication flow, session management, or credential verification."
            })
            libraries.append("PyJWT" if ".py" in file_name else "jsonwebtoken")
            
        if "stripe" in code_lower or "payment" in code_lower or "checkout" in code_lower or "wallet" in code_lower:
            genes.append({
                "name": "Transactional Payments",
                "type": "Business",
                "description": "Integrates payment gates or manages billing and transactional ledgers."
            })
            libraries.append("stripe")

        if "route" in code_lower or "router" in code_lower or "navigation" in code_lower or "href" in code_lower:
            genes.append({
                "name": "Navigation Grid",
                "type": "UX",
                "description": "Declares URL routes, view paths, or page switching mechanics."
            })

        if "select" in code_lower or "db" in code_lower or "model" in code_lower or "table" in code_lower or "schema" in code_lower:
            genes.append({
                "name": "Data Schema & Persistence",
                "type": "Architecture",
                "description": "Declares entities, structures data schema, or performs DB query transactions."
            })
            
        if "socket" in code_lower or "websocket" in code_lower or "chat" in code_lower or "subscribe" in code_lower:
            genes.append({
                "name": "Real-time Sync & Streams",
                "type": "Workflow",
                "description": "Supports persistent server-client channels for live event streaming."
            })

        # Framework heuristics
        if "fastapi" in code_lower or "apirouter" in code_lower:
            arch = "FastAPI MVC / Microservices"
            libraries.append("FastAPI")
        elif "express" in code_lower:
            arch = "Express REST Server"
            libraries.append("express")
        elif "react" in code_lower or "useState" in code_lower:
            arch = "React Component Architecture"
            libraries.append("React")
        elif "spring" in code_lower or "autowired" in code_lower:
            arch = "Spring Boot DDD / Hexagonal"
            libraries.append("Spring Boot")
        else:
            arch = "Modular Functional Architecture"

        return {
            "architecture": arch,
            "libraries": list(set(libraries)),
            "genes": genes
        }

    @classmethod
    async def explain_architecture(cls, app_name: str, framework: str, language: str, genes: List[Dict[str, Any]]) -> str:
        prompt = f"""
        Explain the architectural blueprints of '{app_name}' built using {framework} in {language}.
        The application contains the following genes: {json.dumps(genes)}
        Discuss:
        1. Tradeoffs (Scalability vs. Complexity)
        2. Core patterns
        3. Potential anti-patterns or performance improvements.
        """
        resp = await cls.chat_completion(prompt, "You are a Principal AI Architect.")
        if resp:
            return resp
            
        return f"""### Architectural Breakdown of {app_name}

The application exhibits a modern modular architecture centered around the **{framework}** ecosystem in **{language}**.

#### Core Design Decisions & Patterns
- **Separation of Concerns**: Extracted genes show clear boundaries between business models, UX pathways, and security layers.
- **Dependency Isolation**: Uses lightweight service abstractions to perform calculations, ensuring testing is simplified.

#### Scalability & Tradeoffs
- **Pros**: The modular layout allows for easy migration to microservices if needed. Database abstractions support pooling.
- **Cons**: Overhead of data parsing and AST structure mapping can impact startup latency.

#### Anti-patterns Detected
- **Tightly Coupled Utilities**: Common helpers are directly imported across modules, suggesting helper creep.
- **Direct DB Queries**: Some genes query tables without going through service repositories, leading to potential data corruption vectors.
"""

    @classmethod
    async def recombine_software_genomes(cls, parents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Simulates combining two or three app genomes into a new application."""
        parent_names = " + ".join([p['name'] for p in parents])
        prompt = f"""
        Recombine the software genomes of these parent applications: {json.dumps(parents)}
        Create an entirely new application.
        Provide:
        1. Recombined App Name
        2. Tagline
        3. Workflows (combined workflows)
        4. Architecture summary
        5. Mutated features
        
        Respond only in JSON format with keys: 'name', 'tagline', 'description', 'workflows', 'architecture', 'mutated_genes', 'scores'.
        """
        resp = await cls.chat_completion(prompt, "You are an evolutionary AI software geneticist.")
        if resp:
            try:
                start = resp.find("{")
                end = resp.rfind("}")
                if start != -1 and end != -1:
                    return json.loads(resp[start:end+1])
            except Exception:
                pass
                
        # Deterministic Recombination Heuristics
        merged_name = f"Hybrid {' & '.join([p['name'].split()[0] for p in parents])} Platform"
        tagline = "Evolved code genome combining " + ", ".join([p['name'] for p in parents])
        
        workflows = [
            {"name": "Cross-Domain Orchestration", "steps": ["Ingest inputs from Parents", "Align APIs & Schemas", "Verify security token signatures"]},
            {"name": "Unified Commerce Flow", "steps": ["Initiate order", "Process checkout gene", "Broadcast real-time delivery coordinate stream"]}
        ]
        
        # Combine parent genes with modifications
        mutated = []
        for p in parents:
            for g in p.get('genes', []):
                mutated.append({
                    "name": f"Evolved {g['name']}",
                    "type": g['type'],
                    "description": f"Mutated version of gene from {p['name']}. Improved latency and unified bindings.",
                    "mutation_applied": "Unified token structures and added local offline sync hooks."
                })
                
        scores = {
            "innovation": 8.5,
            "security": 7.8,
            "scalability": 8.2,
            "maintainability": 8.0,
            "overall": 8.1
        }
        
        return {
            "name": merged_name,
            "tagline": tagline,
            "description": f"An evolved application genome recombining structures from: {parent_names}.",
            "workflows": workflows,
            "architecture": "Event-Driven Hexagonal Hybrid Architecture with unified schema mapping.",
            "mutated_genes": mutated,
            "scores": scores
        }
