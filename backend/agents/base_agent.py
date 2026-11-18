from typing import Optional, AsyncGenerator
from core.llm import llm_service
from rag.retriever import clinical_retriever

class BaseAgent:
    def __init__(
        self,
        name: str,
        domain: str,
        system_prompt: str,
        temperature: float = 0.7
    ):
        self.name = name
        self.domain = domain
        self.system_prompt = system_prompt
        self.temperature = temperature

    def _build_augmented_context(self, query: str, context: Optional[str] = None) -> Optional[str]:
        # Active RAG retrieval across domain knowledge (NIH MedQuAD & clinical monographs)
        rag_hits = clinical_retriever.retrieve(query=query, domain=self.domain, top_k=2)
        rag_context = clinical_retriever.format_for_prompt(rag_hits)

        augmented = context or ""
        if rag_context:
            augmented = (
                f"{augmented}\n\n"
                f"### [CLINICAL EVIDENCE & THEORETICAL MONOGRAPHS: {self.domain.upper()}]\n"
                f"{rag_context}\n"
                f"Incorporate relevant pathophysiological considerations and clinical guidelines from the evidence above."
            ).strip()
        return augmented if augmented else None

    async def process(
        self,
        query: str,
        context: Optional[str] = None,
        temperature: Optional[float] = None,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> str:
        augmented_context = self._build_augmented_context(query, context)
        prompt_parts = []
        if augmented_context:
            prompt_parts.append(f"Context:\n{augmented_context}")
        
        prompt_parts.append(f"User Query:\n{query}")
        
        # Explicit formatting reminder directly attached to query for smaller models
        formatting_directive = (
            "\n\n[FORMATTING INSTRUCTION: Output your response with clear Markdown structure:\n"
            "- Use **bold** for key concepts, warnings, and vital takeaways.\n"
            "- Use bullet points (-) or numbered lists (1.) for multi-step guidance, recommendations, or symptoms.\n"
            "- If presenting comparisons, schedules, diets, or plans, format them using a Markdown table (| Col 1 | Col 2 |).\n"
            "- Keep paragraphs short (2-3 sentences max). Do not output a single solid wall of text.]"
        )
        prompt_parts.append(formatting_directive)

        prompt = "\n\n".join(prompt_parts)

        temp = temperature if temperature is not None else self.temperature
        return await llm_service.generate_response(
            prompt=prompt,
            system_prompt=self.system_prompt,
            model=model,
            temperature=temp,
            api_key=api_key,
            api_base=api_base,
            provider=provider
        )

    async def process_stream(
        self,
        query: str,
        context: Optional[str] = None,
        temperature: Optional[float] = None,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> AsyncGenerator[str, None]:
        augmented_context = self._build_augmented_context(query, context)
        prompt_parts = []
        if augmented_context:
            prompt_parts.append(f"Context:\n{augmented_context}")
        
        prompt_parts.append(f"User Query:\n{query}")
        
        formatting_directive = (
            "\n\n[FORMATTING INSTRUCTION: Output your response with clear Markdown structure:\n"
            "- Use **bold** for key concepts, warnings, and vital takeaways.\n"
            "- Use bullet points (-) or numbered lists (1.) for multi-step guidance, recommendations, or symptoms.\n"
            "- If presenting comparisons, schedules, diets, or plans, format them using a Markdown table (| Col 1 | Col 2 |).\n"
            "- Keep paragraphs short (2-3 sentences max). Do not output a single solid wall of text.]"
        )
        prompt_parts.append(formatting_directive)

        prompt = "\n\n".join(prompt_parts)
        temp = temperature if temperature is not None else self.temperature

        async for chunk in llm_service.generate_response_stream(
            prompt=prompt,
            system_prompt=self.system_prompt,
            model=model,
            temperature=temp,
            api_key=api_key,
            api_base=api_base,
            provider=provider
        ):
            yield chunk
