from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field
import json

class Application(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    tagline: Optional[str] = None
    language: str
    framework: str
    path_or_url: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    genome_score: float = Field(default=0.0)

class Gene(SQLModel, table=True):
    id: str = Field(primary_key=True)
    application_id: str = Field(foreign_key="application.id")
    name: str
    gene_type: str  # e.g., "UX", "Business", "Architecture", "Workflow", "Component"
    description: str
    code_snippet: str
    file_path: str
    confidence_score: float = Field(default=1.0)

class GenomeRelation(SQLModel, table=True):
    id: str = Field(primary_key=True)
    application_id: str
    source_id: str
    target_id: str
    relation_type: str  # e.g., "DEPENDS_ON", "CALLS", "DECLARES", "USES"
    metadata_json: str = Field(default="{}")

    @property
    def metadata(self) -> Dict[str, Any]:
        try:
            return json.loads(self.metadata_json)
        except Exception:
            return {}

    @metadata.setter
    def metadata(self, value: Dict[str, Any]):
        self.metadata_json = json.dumps(value)

class Simulation(SQLModel, table=True):
    id: str = Field(primary_key=True)
    application_id: str
    name: str
    simulation_type: str  # "Journey", "Scale", "Attack"
    failure_rate: float
    predicted_bugs: int
    frustration_index: float  # 0.0 to 10.0
    latency_ms: int
    logs_json: str = Field(default="[]")

    @property
    def logs(self) -> List[Dict[str, Any]]:
        try:
            return json.loads(self.logs_json)
        except Exception:
            return []

    @logs.setter
    def logs(self, value: List[Dict[str, Any]]):
        self.logs_json = json.dumps(value)

class Recombination(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    parent_apps: str  # JSON list of app IDs
    description: str
    mutations_json: str = Field(default="[]")
    score_innovation: float
    score_security: float
    score_scalability: float
    score_maintainability: float
    score_overall: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def mutations(self) -> List[Dict[str, Any]]:
        try:
            return json.loads(self.mutations_json)
        except Exception:
            return []

    @mutations.setter
    def mutations(self, value: List[Dict[str, Any]]):
        self.mutations_json = json.dumps(value)
