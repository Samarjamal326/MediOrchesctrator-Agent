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
        temperature: Optional[float] = None
    ) -> str:
        prompt = query
        if context:
            prompt = f"Context:\n{context}\n\nUser Query:\n{query}"

        temp = temperature if temperature is not None else self.temperature
        return await llm_service.generate_response(
            prompt=prompt,
            system_prompt=self.system_prompt,
            temperature=temp
        )
