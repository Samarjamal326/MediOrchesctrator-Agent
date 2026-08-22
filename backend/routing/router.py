import json
import re
from typing import List
from config import settings
from core.llm import llm_service

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

    async def classify(self, query: str) -> str:
        system_prompt = self._build_system_prompt()
        user_prompt = f"Query: {query}"

        try:
            raw_response = await llm_service.generate_response(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.0
            )
            return self._parse_response(raw_response)
        except Exception:
            return self.default_domain

intent_router = IntentRouter()
