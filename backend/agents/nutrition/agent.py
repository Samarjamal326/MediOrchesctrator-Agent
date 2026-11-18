from typing import Optional, AsyncGenerator
from agents.base_agent import BaseAgent
from prompts import get_system_prompt, NUTRITION_SYSTEM_PROMPT
from rag.retriever import clinical_retriever

class NutritionAgent(BaseAgent):
    def __init__(self):
        prompt = get_system_prompt("nutrition", default=NUTRITION_SYSTEM_PROMPT)
        super().__init__(
            name="Nutrition & Metabolic Agent",
            domain="nutrition",
            system_prompt=prompt,
            temperature=0.6
        )

    async def process(
        self,
        query: str,
        context: Optional[str] = None,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> str:
        # 1. Retrieve evidence-based nutritional knowledge from ChromaDB
        rag_hits = clinical_retriever.retrieve(query=query, domain="nutrition", top_k=3)
        rag_context = clinical_retriever.format_for_prompt(rag_hits)

        # 2. Augment context with USDA reference data if hits found
        augmented_context = context or ""
        if rag_context:
            augmented_context = (
                f"{augmented_context}\n\n"
                f"### [USDA FOODDATA LAB REFERENCE DATA]\n"
                f"{rag_context}\n"
                f"Use the specific nutrient amounts, vitamins, and minerals from the reference data above to provide an exact, evidence-based nutritional breakdown."
            ).strip()

        return await super().process(
            query=query,
            context=augmented_context if augmented_context else None,
            model=model,
            api_key=api_key,
            api_base=api_base,
            provider=provider
        )

    async def process_stream(
        self,
        query: str,
        context: Optional[str] = None,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> AsyncGenerator[str, None]:
        # 1. Retrieve evidence-based nutritional knowledge from ChromaDB
        rag_hits = clinical_retriever.retrieve(query=query, domain="nutrition", top_k=3)
        rag_context = clinical_retriever.format_for_prompt(rag_hits)

        # 2. Augment context with USDA reference data if hits found
        augmented_context = context or ""
        if rag_context:
            augmented_context = (
                f"{augmented_context}\n\n"
                f"### [USDA FOODDATA LAB REFERENCE DATA]\n"
                f"{rag_context}\n"
                f"Use the specific nutrient amounts, vitamins, and minerals from the reference data above to provide an exact, evidence-based nutritional breakdown."
            ).strip()

        async for chunk in super().process_stream(
            query=query,
            context=augmented_context if augmented_context else None,
            model=model,
            api_key=api_key,
            api_base=api_base,
            provider=provider
        ):
            yield chunk

nutrition_agent = NutritionAgent()

