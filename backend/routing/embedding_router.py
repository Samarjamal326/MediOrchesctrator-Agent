"""
Embedding-based fast router for MediOrchestrator.
Uses precomputed domain prototype centroids with all-MiniLM-L6-v2 embeddings.
Calculates cosine similarity across 12 clinical domains.
If margin between top-1 and top-2 domain is clear (top >= 0.38 and margin >= 0.12),
routes instantly (< 15ms) without invoking the LLM.
"""

import math
import logging
from typing import Optional, Dict, List, Tuple
from config import settings
from rag.embeddings import local_embeddings

logger = logging.getLogger("mediorchestrator.router.embedding")

DOMAIN_DESCRIPTIONS: Dict[str, List[str]] = {
    "general_medicine": [
        "general fatigue weakness fever chills body aches illness common cold cough sore throat",
        "routine checkup blood pressure dizziness malaise viral infection malaise infection flu symptoms"
    ],
    "dermatology": [
        "skin rash eczema psoriasis hives acne dry itchy skin dermatitis moles skin lesions peeling",
        "redness sunburn blister bumps on skin scalp ringworm fungal skin infection cutaneous issues"
    ],
    "nutrition": [
        "diet nutrition vitamins minerals calorie intake meal planning food macronutrients supplements",
        "weight loss weight gain iron deficiency protein intake ketogenic mediterranean diet balanced eating healthy meals"
    ],
    "dentistry": [
        "toothache bleeding gums cavities oral hygiene dental pain swollen gums tooth decay floss tooth sensitivity",
        "wisdom tooth jaw pain gingivitis mouth sores dental checkup teeth cleaning braces enamel pulpitis"
    ],
    "cardiology": [
        "heart palpitations chest tightness irregular heartbeat high blood pressure hypertension angina",
        "cardiovascular health tachycardia arrhythmia pulse rate shortness of breath on exertion"
    ],
    "orthopedics": [
        "joint pain back pain knee pain arthritis bone fracture tendonitis muscle strain ligament sprain",
        "spine spine pain hip pain shoulder stiffness posture musculoskeletal injury disc"
    ],
    "neurology": [
        "migraine headache severe headache tingling numbness tremors nerve pain neuropathy seizures",
        "memory loss vertigo brain fog involuntary twitching coordination problems reflex"
    ],
    "mental_health": [
        "anxiety depression panic attack insomnia stress mood swings emotional overwhelm grief therapy",
        "nervousness burnout feeling hopeless trauma obsessive thoughts mental fatigue psychiatric"
    ],
    "pharmacy": [
        "medication dosage drug interactions side effects prescription instructions pills capsules tablets",
        "contraindications antibiotic course over the counter pharmacology supplement interaction dosing"
    ],
    "emergency": [
        "sudden severe crushing chest pain difficulty breathing choking uncontrolled bleeding unconsciousness",
        "stroke symptoms face drooping arm weakness slurred speech acute anaphylaxis emergency room 911"
    ],
    "womens_health": [
        "menstrual cycle pregnancy obstetrics gynecology menopause cramps prenatal care ovarian hormonal",
        "irregular periods pelvic pain lactation postpartum contraceptive fertility reproductive"
    ],
    "pathology": [
        "blood test results lab report interpretation biopsy CBC panel urinalysis diagnostic markers",
        "elevated WBC liver enzymes lipid profile hemoglobin biopsy histology lab values biomarkers"
    ]
}

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

class EmbeddingRouter:
    def __init__(self, min_score: float = 0.38, min_margin: float = 0.12):
        self.min_score = min_score
        self.min_margin = min_margin
        self._centroids: Dict[str, List[float]] = {}
        self._initialized = False

    def _initialize_centroids(self):
        if self._initialized:
            return

        for domain, texts in DOMAIN_DESCRIPTIONS.items():
            vectors = [local_embeddings.embed_query(t) for t in texts]
            dim = len(vectors[0])
            centroid = [sum(v[i] for v in vectors) / len(vectors) for i in range(dim)]
            norm = math.sqrt(sum(x * x for x in centroid))
            if norm > 0:
                centroid = [x / norm for x in centroid]
            self._centroids[domain] = centroid

        self._initialized = True
        logger.info(f"Initialized {len(self._centroids)} domain centroid prototypes.")

    def route_fast(self, query: str) -> Tuple[Optional[str], float]:
        """
        Fast embedding similarity check against domain centroids.
        Requires top-1 score >= min_score and a decisive margin over top-2.
        """
        self._initialize_centroids()
        q_emb = local_embeddings.embed_query(query)
        if not q_emb:
            return None, 0.0

        scores = []
        for domain, centroid in self._centroids.items():
            sim = cosine_similarity(q_emb, centroid)
            scores.append((domain, sim))

        scores.sort(key=lambda x: x[1], reverse=True)
        top_domain, top_score = scores[0]
        second_score = scores[1][1] if len(scores) > 1 else 0.0
        margin = top_score - second_score

        if top_score >= self.min_score and margin >= self.min_margin:
            return top_domain, top_score

        return None, top_score

embedding_router = EmbeddingRouter()
