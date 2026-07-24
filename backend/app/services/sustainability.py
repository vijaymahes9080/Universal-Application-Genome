from typing import Dict, Any

class SustainabilityEngine:
    @staticmethod
    def calculate_carbon_footprint(genes_count: int, framework: str) -> Dict[str, Any]:
        """Calculates carbon footprint and computing energy efficiency metrics."""
        base_watts = 15.0
        coef = 0.8 if "fastapi" in framework.lower() else 1.2
        
        estimated_watts = round(base_watts * coef + (genes_count * 0.4), 2)
        co2_grams_per_10k = round(estimated_watts * 0.12, 2)
        rating = "A+" if co2_grams_per_10k < 2.5 else "B+"
        
        return {
            "framework": framework,
            "genes_evaluated": genes_count,
            "estimated_watts": estimated_watts,
            "co2_grams_per_10k": co2_grams_per_10k,
            "green_rating": rating
        }
