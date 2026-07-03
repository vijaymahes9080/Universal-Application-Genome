import re
from typing import List, Dict, Any
from backend.app.models.schemas import Gene

class DNAExtractionEngine:
    @staticmethod
    def extract_architecture_dna(genes: List[Gene], language: str, framework: str) -> Dict[str, Any]:
        """Classifies architecture paradigms (MVC, DDD, Event-driven, clean architecture)."""
        architectures = []
        
        # Check frameworks/structures
        fw = framework.lower()
        if "fastapi" in fw or "django" in fw or "express" in fw:
            architectures.append("MVC (Model-View-Controller)")
        if any("db" in g.name.lower() or "schema" in g.name.lower() for g in genes):
            architectures.append("Layered Persistence Architecture")
        if any("sync" in g.name.lower() or "socket" in g.name.lower() for g in genes):
            architectures.append("EDA (Event-Driven Architecture)")
            
        if not architectures:
            architectures.append("Monolith / Scripted Structure")
            
        return {
            "style": " & ".join(architectures),
            "design_patterns": ["Singleton", "Dependency Injection", "Repository Pattern"] if "Python" in language else ["Factory", "Observer", "Module"],
            "complexity": "Medium" if len(genes) > 3 else "Low",
            "scalability_rating": "High" if "EDA" in architectures or "fastapi" in fw else "Medium"
        }

    @staticmethod
    def extract_business_dna(genes: List[Gene]) -> Dict[str, Any]:
        """Identifies revenue loops, CRM patterns, billing schemes, etc."""
        revenue_model = "Free / Open-Source"
        features = []
        
        for g in genes:
            desc = g.description.lower()
            name = g.name.lower()
            if "payment" in name or "stripe" in desc or "checkout" in desc:
                revenue_model = "SaaS Subscriptions / Transactional"
                features.append("Stripe Checkout Portal")
            if "wallet" in name or "bank" in desc or "escrow" in desc:
                features.append("Digital Escrow / Multi-Party Wallets")
                
        return {
            "revenue_model": revenue_model,
            "monetization_features": features if features else ["Developer Tooling"],
            "pricing_tiers": ["Usage-Based"] if "transactional" in revenue_model.lower() else ["Standard Free Plan"],
            "growth_loops": ["Open Source developer network", "Platform API integrations"]
        }

    @staticmethod
    def extract_ux_dna(genes: List[Gene]) -> Dict[str, Any]:
        """Deduces design language, layout systems, navigation and spacing patterns."""
        design_system = "HTML Browser Defaults"
        nav_pattern = "Router / Linear"
        
        for g in genes:
            desc = g.description.lower()
            name = g.name.lower()
            if "tailwind" in desc or "tailwindcss" in desc:
                design_system = "Tailwind CSS Utility Styling"
            elif "react" in desc or "component" in name:
                design_system = "Modular Component UI (shadcn/ui)"
            if "navigation" in name or "route" in desc:
                nav_pattern = "Dynamic Client-Side Routing"
                
        return {
            "design_system": design_system,
            "navigation_schema": nav_pattern,
            "dark_mode_supported": True,
            "accessibility_score": 8.8,
            "spacing_layout": "CSS Flexbox & Grid Grid System"
        }

    @staticmethod
    def extract_workflow_dna(genes: List[Gene]) -> List[Dict[str, Any]]:
        """Maps functional workflows (e.g. checkout, login, message board, real-time sync)."""
        workflows = []
        
        has_auth = any("auth" in g.name.lower() for g in genes)
        has_pay = any("payment" in g.name.lower() or "transactional" in g.name.lower() for g in genes)
        
        if has_auth:
            workflows.append({
                "name": "User Registration & Authentication",
                "trigger": "User inputs credentials",
                "steps": ["Validate email format", "Hash password & verify", "Generate signed JWT bearer token", "Establish user session cookies"]
            })
        if has_pay:
            workflows.append({
                "name": "Checkout Ledger & Order Capture",
                "trigger": "Click purchase checkout button",
                "steps": ["Initialize payment gateway session", "Verify items stock count", "Capture credit payload / transaction signature", "Email invoice & notify inventory queue"]
            })
            
        if not workflows:
            workflows.append({
                "name": "Standard Request Handling",
                "trigger": "HTTP GET Request to path",
                "steps": ["Parse URL route query params", "Execute handler controller callback", "Format JSON API dict response payload"]
            })
            
        return workflows
        
    @classmethod
    def classify_software_species(cls, language: str, framework: str, genes: List[Gene]) -> str:
        """Determines the biological category classification of this code genome."""
        has_sync = any("sync" in g.name.lower() or "socket" in g.name.lower() for g in genes)
        has_billing = any("payment" in g.name.lower() or "stripe" in g.name.lower() for g in genes)
        
        if "react" in framework.lower() or "next.js" in framework.lower():
            if has_billing:
                return "SaaS Client Application (E-Commerce variant)"
            return "Modular UI Client (Web Portal variant)"
        elif "fastapi" in framework.lower() or "django" in framework.lower() or "express" in framework.lower():
            if has_sync:
                return "Event-Driven Distributed API Server"
            if has_billing:
                return "SaaS Billing Microservice"
            return "RESTful Application Server Gateway"
            
        return "Command Line Utility / Library Package"
