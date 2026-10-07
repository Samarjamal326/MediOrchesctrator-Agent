from typing import Optional
from core.llm import llm_service

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
        prompt_parts = []
        if context:
            prompt_parts.append(f"Context:\n{context}")
        
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
