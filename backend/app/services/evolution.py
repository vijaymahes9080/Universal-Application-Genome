import uuid
import json
from typing import List, Dict, Any
from sqlmodel import Session
from backend.app.models.schemas import Application, Gene, Recombination
from backend.app.services.ai_engine import AIEngine

class EvolutionEngine:
    @classmethod
    async def evolve_applications(cls, parents: List[Application], app_name: str, session: Session) -> Recombination:
        """Evolves parent app genomes into a new hybrid application genome record."""
        # Collate genes of parents
        parents_data = []
        for parent in parents:
            # Query genes for this parent
            genes = session.query(Gene).filter(Gene.application_id == parent.id).all()
            parents_data.append({
                "id": parent.id,
                "name": parent.name,
                "language": parent.language,
                "framework": parent.framework,
                "genes": [
                    {
                        "name": g.name,
                        "type": g.gene_type,
                        "description": g.description
                    } for g in genes
                ]
            })
            
        # Recombine using AI engine
        recomb_result = await AIEngine.recombine_software_genomes(parents_data)
        
        # Override name if provided
        final_name = app_name if app_name else recomb_result.get("name", "Hybrid Recombination")
        
        # Calculate detail metrics
        scores = recomb_result.get("scores", {})
        
        recomb_id = str(uuid.uuid4())
        db_recomb = Recombination(
            id=recomb_id,
            name=final_name,
            parent_apps=json.dumps([p.id for p in parents]),
            description=recomb_result.get("description", "A recombined software genome."),
            mutations_json=json.dumps(recomb_result.get("mutated_genes", [])),
            score_innovation=scores.get("innovation", 8.0),
            score_security=scores.get("security", 8.0),
            score_scalability=scores.get("scalability", 8.0),
            score_maintainability=scores.get("maintainability", 8.0),
            score_overall=scores.get("overall", 8.0)
        )
        
        # Write evolved result as a new Application in database so it can be analyzed further!
        evolved_app = Application(
            id=recomb_id,
            name=final_name,
            tagline=recomb_result.get("tagline", "Evolved hybrid code genome"),
            language=parents[0].language if parents else "TypeScript React",
            framework=parents[0].framework if parents else "Next.js",
            path_or_url=f"evolved://{recomb_id}",
            genome_score=db_recomb.score_overall
        )
        session.add(evolved_app)
        
        # Write the mutated genes
        mutated_genes_list = recomb_result.get("mutated_genes", [])
        for i, mg in enumerate(mutated_genes_list):
            gene_id = str(uuid.uuid4())
            db_gene = Gene(
                id=gene_id,
                application_id=recomb_id,
                name=mg.get("name", "Evolved Gene"),
                gene_type=mg.get("type", "UX"),
                description=mg.get("description", "Mutated gene variant."),
                code_snippet=f"// Evolved gene implementation.\n// Mutation strategy: {mg.get('mutation_applied', 'Optimization')}\nexport function EvolvedCode() {{\n  console.log('Running hybridized workflow');\n}}",
                file_path=f"src/evolved/gene_{i}.ts",
                confidence_score=0.9
            )
            session.add(db_gene)
            
        session.add(db_recomb)
        session.commit()
        session.refresh(db_recomb)
        return db_recomb
