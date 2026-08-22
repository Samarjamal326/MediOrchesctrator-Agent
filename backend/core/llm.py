from typing import List, Dict, Any, Optional
import httpx
from config import settings

class OllamaServiceError(Exception):
    pass

class LLMService:
    def __init__(self, base_url: str = settings.OLLAMA_BASE_URL, default_model: str = settings.OLLAMA_MODEL):
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        stream: bool = False
    ) -> Dict[str, Any]:
        selected_model = model or self.default_model
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": selected_model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": temperature
            }
        }

        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                return response.json()
        except httpx.ConnectError:
            raise OllamaServiceError("Ollama service is unreachable. Ensure Ollama is running at " + self.base_url)
        except httpx.HTTPStatusError as exc:
            raise OllamaServiceError(f"Ollama returned HTTP error {exc.response.status_code}: {exc.response.text}")
        except httpx.RequestError as exc:
            raise OllamaServiceError(f"Failed to communicate with Ollama: {str(exc)}")

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7
    ) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        data = await self.chat(messages=messages, model=model, temperature=temperature, stream=False)
        message = data.get("message", {})
        return message.get("content", "")

llm_service = LLMService()
