from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List, Dict, Any, Optional
import os
import io

from backend.app.core.db import init_db, get_session
from backend.app.models.schemas import Application, Gene, GenomeRelation, Simulation, Recombination
from backend.app.services.ingestion import IngestionEngine
from backend.app.services.dna_extraction import DNAExtractionEngine
from backend.app.services.genome_graph import GenomeGraphEngine
from backend.app.services.evolution import EvolutionEngine
from backend.app.services.simulation import SimulationEngine
from backend.app.services.export import ExportEngine
from backend.app.services.ai_engine import AIEngine

app = FastAPI(
    title="Universal Application Genome API",
    description="Backend API platform for decoding application genomes, simulating, and evolving code DNA.",
    version="1.0.0"
)

# CORS setup for local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "universal-application-genome"}

# PHASE 1: Ingestion
class IngestRequest(SQLModel):
    path: str
    name: str

@app.post("/api/ingest", response_model=Application)
async def ingest_code(req: IngestRequest, session: Session = Depends(get_session)):
    try:
        # If folder doesn't exist, we will use mock structures to demonstrate UAG
        app_record = await IngestionEngine.ingest_directory(req.path, req.name, session)
        return app_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Applications Lists & Details
@app.get("/api/applications", response_model=List[Application])
def list_applications(session: Session = Depends(get_session)):
    return session.exec(select(Application)).all()

@app.get("/api/applications/{app_id}")
def get_application_details(app_id: str, session: Session = Depends(get_session)):
    app_record = session.get(Application, app_id)
    if not app_record:
        raise HTTPException(status_code=404, detail="Application genome not found")
        
    genes = session.exec(select(Gene).where(Gene.application_id == app_id)).all()
    
    # Calculate DNA sub-components
    arch_dna = DNAExtractionEngine.extract_architecture_dna(genes, app_record.language, app_record.framework)
    biz_dna = DNAExtractionEngine.extract_business_dna(genes)
    ux_dna = DNAExtractionEngine.extract_ux_dna(genes)
    workflow_dna = DNAExtractionEngine.extract_workflow_dna(genes)
    species = DNAExtractionEngine.classify_software_species(app_record.language, app_record.framework, genes)
    
    return {
        "application": app_record,
        "species": species,
        "architecture_dna": arch_dna,
        "business_dna": biz_dna,
        "ux_dna": ux_dna,
        "workflows": workflow_dna,
        "genes": genes
    }

# PHASE 3: Software Genome Graph
@app.get("/api/applications/{app_id}/graph")
def get_application_graph(app_id: str, format: str = "cytoscape", session: Session = Depends(get_session)):
    app_record = session.get(Application, app_id)
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
        
    genes = session.exec(select(Gene).where(Gene.application_id == app_id)).all()
    relations = session.exec(select(GenomeRelation).where(GenomeRelation.application_id == app_id)).all()
    
    if format == "react-flow":
        return GenomeGraphEngine.build_react_flow_elements(app_record, genes, relations)
    return GenomeGraphEngine.build_cytoscape_elements(app_record, genes, relations)

# PHASE 8: AI Explanation
@app.get("/api/applications/{app_id}/explanation")
async def get_ai_explanation(app_id: str, session: Session = Depends(get_session)):
    app_record = session.get(Application, app_id)
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
    genes = session.exec(select(Gene).where(Gene.application_id == app_id)).all()
    
    explanation = await AIEngine.explain_architecture(
        app_record.name, app_record.framework, app_record.language, 
        [{"name": g.name, "type": g.gene_type, "description": g.description} for g in genes]
    )
    return {"explanation": explanation}

# PHASE 9: Recombination Sandbox
class EvolveRequest(SQLModel):
    parent_ids: List[str]
    name: str

@app.post("/api/evolve", response_model=Recombination)
async def evolve_genome(req: EvolveRequest, session: Session = Depends(get_session)):
    parents = []
    for pid in req.parent_ids:
        p = session.get(Application, pid)
        if not p:
            raise HTTPException(status_code=404, detail=f"Parent App {pid} not found")
        parents.append(p)
        
    if not parents:
        raise HTTPException(status_code=400, detail="Provide at least one parent application genome")
        
    try:
        recomb = await EvolutionEngine.evolve_applications(parents, req.name, session)
        return recomb
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/evolved", response_model=List[Recombination])
def list_evolved_genomes(session: Session = Depends(get_session)):
    return session.exec(select(Recombination)).all()

# AI Simulations
@app.post("/api/applications/{app_id}/simulate")
def run_application_simulations(app_id: str, session: Session = Depends(get_session)):
    try:
        simulations = SimulationEngine.execute_full_simulation(app_id, session)
        return simulations
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/applications/{app_id}/simulations", response_model=List[Simulation])
def get_past_simulations(app_id: str, session: Session = Depends(get_session)):
    return session.exec(select(Simulation).where(Simulation.application_id == app_id)).all()

# Project Exports
@app.get("/api/applications/{app_id}/export")
def export_application_zip(app_id: str, session: Session = Depends(get_session)):
    app_record = session.get(Application, app_id)
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
    genes = session.exec(select(Gene).where(Gene.application_id == app_id)).all()
    
    zip_bytes = ExportEngine.compile_zip_archive(app_record, genes)
    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={app_record.name.lower().replace(' ', '_')}_evolved.zip"}
    )
