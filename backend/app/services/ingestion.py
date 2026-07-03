import os
import uuid
import json
from datetime import datetime
from sqlmodel import Session
from backend.app.models.schemas import Application, Gene, GenomeRelation
from backend.app.services.ai_engine import AIEngine

class IngestionEngine:
    @staticmethod
    def detect_languages_and_frameworks(dir_path: str) -> dict:
        """Counts extensions and configuration files to determine codebase dna."""
        extensions = {}
        framework = "Custom App"
        primary_lang = "Python"
        dependencies = []
        
        ignored_dirs = {".git", "node_modules", "venv", ".venv", "build", "dist", "__pycache__"}
        
        for root, dirs, files in os.walk(dir_path):
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext:
                    extensions[ext] = extensions.get(ext, 0) + 1
                    
                # Framework detectors
                if file == "package.json":
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                            pj = json.load(f)
                            deps = pj.get("dependencies", {})
                            dev_deps = pj.get("devDependencies", {})
                            dependencies.extend(list(deps.keys()))
                            if "next" in deps:
                                framework = "Next.js React WebApp"
                            elif "react" in deps:
                                framework = "React UI"
                            elif "express" in deps:
                                framework = "Express Node API"
                    except Exception:
                        pass
                elif file == "requirements.txt":
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                            for line in f:
                                line = line.strip()
                                if line and not line.startswith('#'):
                                    dep = line.split('==')[0].split('>=')[0].strip()
                                    dependencies.append(dep)
                                    if dep.lower() == "fastapi":
                                        framework = "FastAPI Python Service"
                                    elif dep.lower() == "django":
                                        framework = "Django Python Server"
                    except Exception:
                        pass
                        
        # Pick primary language
        ext_to_lang = {
            ".py": "Python",
            ".js": "JavaScript",
            ".jsx": "JavaScript React",
            ".ts": "TypeScript",
            ".tsx": "TypeScript React",
            ".go": "Go",
            ".rs": "Rust",
            ".java": "Java",
            ".cs": "C#",
            ".cpp": "C++",
            ".c": "C"
        }
        
        if extensions:
            sorted_exts = sorted(extensions.items(), key=lambda x: x[1], reverse=True)
            top_ext = sorted_exts[0][0]
            primary_lang = ext_to_lang.get(top_ext, "Plain Text / Other")
            
        return {
            "language": primary_lang,
            "framework": framework,
            "dependencies": list(set(dependencies))
        }

    @classmethod
    async def ingest_directory(cls, path_or_url: str, app_name: str, session: Session) -> Application:
        """Walks directory, extracts files, structures application and saves records."""
        # Generate ID
        app_id = str(uuid.uuid4())
        
        # Determine language/framework
        meta = {"language": "Python", "framework": "FastAPI Service", "dependencies": []}
        if os.path.exists(path_or_url):
            meta = cls.detect_languages_and_frameworks(path_or_url)
        else:
            # If path doesn't exist, we'll treat it as a mock URL or remote repo and mock its stats
            meta = {
                "language": "TypeScript React",
                "framework": "Next.js / TailwindCSS",
                "dependencies": ["react", "next", "tailwindcss", "lucide-react", "framer-motion"]
            }

        # Create Application record
        db_app = Application(
            id=app_id,
            name=app_name,
            tagline=f"Decoded {meta['framework']} repository",
            language=meta['language'],
            framework=meta['framework'],
            path_or_url=path_or_url,
            genome_score=7.5
        )
        
        session.add(db_app)
        
        # Walk directory and analyze files
        files_to_read = []
        if os.path.exists(path_or_url):
            ignored_dirs = {".git", "node_modules", "venv", ".venv", "build", "dist", "__pycache__"}
            for root, dirs, files in os.walk(path_or_url):
                dirs[:] = [d for d in dirs if d not in ignored_dirs]
                for file in files:
                    ext = os.path.splitext(file)[1].lower()
                    if ext in {".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".java", ".cs"}:
                        files_to_read.append(os.path.join(root, file))
        
        # Limit to first 25 files to avoid long local waits
        files_to_read = files_to_read[:25]
        
        extracted_genes = []
        
        # If no files read (e.g. mock URL or empty path), generate standard mock genes to demonstrate UAG
        if not files_to_read:
            mock_files = [
                ("src/components/Navigation.tsx", "import React from 'react'; export const Navbar = () => { return <nav>Home</nav>; };"),
                ("src/pages/api/auth.ts", "import jwt from 'jsonwebtoken'; export default function handler(req, res) { res.status(200).json({ token: 'jwt-token' }); }"),
                ("src/services/stripe.ts", "import Stripe from 'stripe'; const stripe = new Stripe(process.env.STRIPE_KEY);"),
                ("src/db/schema.sql", "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100) UNIQUE);")
            ]
            for file_path, content in mock_files:
                semantics = await AIEngine.analyze_code_semantics(file_path, content)
                for gene_meta in semantics.get("genes", []):
                    gene_id = str(uuid.uuid4())
                    db_gene = Gene(
                        id=gene_id,
                        application_id=app_id,
                        name=gene_meta['name'],
                        gene_type=gene_meta['type'],
                        description=gene_meta['description'],
                        code_snippet=content,
                        file_path=file_path,
                        confidence_score=0.9
                    )
                    session.add(db_gene)
                    extracted_genes.append(db_gene)
        else:
            for file_path in files_to_read:
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    rel_path = os.path.relpath(file_path, path_or_url)
                    semantics = await AIEngine.analyze_code_semantics(rel_path, content[:5000]) # read up to 5k chars
                    
                    for gene_meta in semantics.get("genes", []):
                        gene_id = str(uuid.uuid4())
                        db_gene = Gene(
                            id=gene_id,
                            application_id=app_id,
                            name=gene_meta['name'],
                            gene_type=gene_meta['type'],
                            description=gene_meta['description'],
                            code_snippet=content[:3000], # store snippet prefix
                            file_path=rel_path,
                            confidence_score=0.95
                        )
                        session.add(db_gene)
                        extracted_genes.append(db_gene)
                except Exception as e:
                    logger.error(f"Error reading file {file_path}: {str(e)}")

        # Build relationships between genes/files (DNA Graph)
        for i in range(len(extracted_genes)):
            for j in range(i+1, len(extracted_genes)):
                # If they are in the same directory, link them
                path_i = os.path.dirname(extracted_genes[i].file_path)
                path_j = os.path.dirname(extracted_genes[j].file_path)
                if path_i == path_j:
                    rel = GenomeRelation(
                        id=str(uuid.uuid4()),
                        application_id=app_id,
                        source_id=extracted_genes[i].id,
                        target_id=extracted_genes[j].id,
                        relation_type="DEPENDS_ON",
                        metadata_json=json.dumps({"reason": "Same parent directory package", "strength": 0.8})
                    )
                    session.add(rel)

        session.commit()
        session.refresh(db_app)
        return db_app
