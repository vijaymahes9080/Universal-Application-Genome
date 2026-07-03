from typing import List, Dict, Any
from backend.app.models.schemas import Application, Gene, GenomeRelation

class GenomeGraphEngine:
    @staticmethod
    def build_cytoscape_elements(app: Application, genes: List[Gene], relations: List[GenomeRelation]) -> List[Dict[str, Any]]:
        """Transforms genes and application details into a cytoscape.js elements list."""
        elements = []
        
        # Add root Application node
        elements.append({
            "data": {
                "id": app.id,
                "label": app.name,
                "type": "Application",
                "language": app.language,
                "framework": app.framework
            }
        })
        
        # Keep track of unique folders/modules to cluster files
        folders = set()
        for g in genes:
            folder = g.file_path.split("/")[0] if "/" in g.file_path else "root"
            folders.add(folder)
            
        # Add folder (Module) nodes as parent nodes
        for folder in folders:
            folder_id = f"mod_{folder}"
            elements.append({
                "data": {
                    "id": folder_id,
                    "label": f"Module: {folder}",
                    "type": "Module"
                }
            })
            
            # Connect Module to Application
            elements.append({
                "data": {
                    "id": f"edge_{app.id}_{folder_id}",
                    "source": app.id,
                    "target": folder_id,
                    "label": "CONTAINS"
                }
            })

        # Add Gene nodes
        for g in genes:
            folder = g.file_path.split("/")[0] if "/" in g.file_path else "root"
            folder_id = f"mod_{folder}"
            
            elements.append({
                "data": {
                    "id": g.id,
                    "label": g.name,
                    "type": "Gene",
                    "gene_type": g.gene_type,
                    "description": g.description,
                    "code": g.code_snippet,
                    "file": g.file_path,
                    "parent": folder_id  # Cytoscape compound node layout support
                }
            })
            
            # Connect Gene to Application
            elements.append({
                "data": {
                    "id": f"edge_{app.id}_{g.id}",
                    "source": app.id,
                    "target": g.id,
                    "label": "EXPRESSES"
                }
            })
            
            # Also create nodes for tables or APIs inside genes
            if "persistence" in g.name.lower() or "schema" in g.name.lower():
                table_id = f"db_{g.id}"
                elements.append({
                    "data": {
                        "id": table_id,
                        "label": "Table: users",
                        "type": "DatabaseTable",
                        "description": "Relational table for user models"
                    }
                })
                elements.append({
                    "data": {
                        "id": f"edge_{g.id}_{table_id}",
                        "source": g.id,
                        "target": table_id,
                        "label": "SCHEMATIZES"
                    }
                })
                
            if "navigation" in g.name.lower() or "sync" in g.name.lower():
                api_id = f"api_{g.id}"
                elements.append({
                    "data": {
                        "id": api_id,
                        "label": "API: /api/auth",
                        "type": "APIEndpoint",
                        "description": "Endpoint exposing auth credentials check"
                    }
                })
                elements.append({
                    "data": {
                        "id": f"edge_{g.id}_{api_id}",
                        "source": g.id,
                        "target": api_id,
                        "label": "EXPOSES"
                    }
                })

        # Add Relations
        for rel in relations:
            elements.append({
                "data": {
                    "id": rel.id,
                    "source": rel.source_id,
                    "target": rel.target_id,
                    "label": rel.relation_type,
                    **rel.metadata
                }
            })

        return elements
        
    @staticmethod
    def build_react_flow_elements(app: Application, genes: List[Gene], relations: List[GenomeRelation]) -> Dict[str, List[Any]]:
        """Converts graph nodes into React Flow Nodes and Edges schema structure."""
        nodes = []
        edges = []
        
        # Set up coordinates
        x, y = 100, 100
        
        # Add root Application Node
        nodes.append({
            "id": app.id,
            "type": "applicationNode",
            "position": {"x": 250, "y": 50},
            "data": {
                "label": app.name,
                "framework": app.framework,
                "language": app.language
            }
        })
        
        # Add Genes
        for i, g in enumerate(genes):
            nodes.append({
                "id": g.id,
                "type": "geneNode",
                "position": {"x": 100 + (i * 250), "y": 250},
                "data": {
                    "label": g.name,
                    "gene_type": g.gene_type,
                    "description": g.description,
                    "file_path": g.file_path,
                    "code_snippet": g.code_snippet
                }
            })
            
            # Edge from App -> Gene
            edges.append({
                "id": f"edge_app_{g.id}",
                "source": app.id,
                "target": g.id,
                "animated": True,
                "label": "EXPRESSES"
            })
            
        # Add relational edges
        for rel in relations:
            edges.append({
                "id": rel.id,
                "source": rel.source_id,
                "target": rel.target_id,
                "label": rel.relation_type,
                "type": "smoothstep"
            })
            
        return {
            "nodes": nodes,
            "edges": edges
        }
