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
        stream: bool = False,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> Dict[str, Any]:
        selected_model = model or self.default_model

        # Support OpenAI, Groq, OpenRouter, etc. if an API key is provided
        if api_key and api_key.strip():
            target_base = (api_base or "https://api.openai.com/v1").rstrip("/")
            if "groq" in (provider or "").lower() and not api_base:
                target_base = "https://api.groq.com/openai/v1"
            elif "openrouter" in (provider or "").lower() and not api_base:
                target_base = "https://openrouter.ai/api/v1"

            url = f"{target_base}/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key.strip()}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": selected_model,
                "messages": messages,
                "temperature": temperature
            }
            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    response = await client.post(url, json=payload, headers=headers)
                    response.raise_for_status()
                    data = response.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    return {"message": {"content": content, "role": "assistant"}}
            except Exception as exc:
                raise OllamaServiceError(f"External Provider ({provider}) error: {str(exc)}")

        # Fallback to local Ollama
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
        temperature: float = 0.7,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        data = await self.chat(
            messages=messages,
            model=model,
            temperature=temperature,
            stream=False,
            api_key=api_key,
            api_base=api_base,
            provider=provider
        )
        message = data.get("message", {})
        return message.get("content", "")

llm_service = LLMService()
