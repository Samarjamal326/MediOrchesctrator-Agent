import json
import re
import logging
from typing import List, Tuple
from config import settings
from core.llm import llm_service
from routing.embedding_router import embedding_router

logger = logging.getLogger("mediorchestrator.router")

class IntentRouter:
    def __init__(
        self,
        allowed_domains: List[str] = settings.ALLOWED_DOMAINS,
        default_domain: str = settings.DEFAULT_DOMAIN
    ):
        self.allowed_domains = allowed_domains
        self.default_domain = default_domain

    def _build_system_prompt(self) -> str:
        domain_list = ", ".join(f'"{d}"' for d in self.allowed_domains)
        return (
            "You are a medical query intent classifier. "
            f"Classify the user query into exactly one of these domains: [{domain_list}]. "
            "Respond ONLY with a valid JSON object in this exact format: {\"domain\": \"<selected_domain>\"}. "
            "Do not include explanations, markdown formatting, or extra text."
        )

    def _parse_response(self, text: str) -> str:
        text = text.strip()
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict) and "domain" in parsed:
                candidate = str(parsed["domain"]).strip().lower()
                if candidate in self.allowed_domains:
                    return candidate
        except json.JSONDecodeError:
            pass

        match = re.search(r'\{.*?"domain"\s*:\s*"([^"]+)".*?\}', text, re.DOTALL)
        if match:
            candidate = match.group(1).strip().lower()
            if candidate in self.allowed_domains:
                return candidate

        for domain in self.allowed_domains:
            if domain in text.lower():
                return domain

        return self.default_domain

    async def classify_with_meta(self, query: str) -> Tuple[str, str, float]:
        """
        Hybrid router:
        1. Fast embedding prototype match (< 15ms).
        2. Fallback to LLM classification if confidence < threshold.
        Returns: (domain, method_used, score)
        """
        # Step 1: Fast embedding similarity check
        fast_domain, conf = embedding_router.route_fast(query)
        if fast_domain:
            logger.info(f"Fast embedding router HIT: {fast_domain} (conf={conf:.4f})")
            return fast_domain, "embedding_centroid", round(conf, 4)

        # Step 2: Fallback to LLM
        logger.info(f"Confidence {conf:.4f} < 0.72. Invoking LLM intent classification fallback.")
        system_prompt = self._build_system_prompt()
        user_prompt = f"Query: {query}"
        try:
            raw_response = await llm_service.generate_response(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.0
            )
            parsed_domain = self._parse_response(raw_response)
            return parsed_domain, "llm_fallback", 1.0
        except Exception as e:
            logger.warning(f"LLM routing failed: {e}. Using default domain {self.default_domain}.")
            return self.default_domain, "default_fallback", 0.0

    async def classify(self, query: str) -> str:
        domain, _, _ = await self.classify_with_meta(query)
        return domain

intent_router = IntentRouter()
