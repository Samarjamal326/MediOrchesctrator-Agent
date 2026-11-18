from typing import List, Dict, Any, Optional, AsyncGenerator
import json
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
            elif "gemini" in (provider or "").lower() and not api_base:
                # Gemini OpenAI-compatible endpoint
                target_base = "https://generativelanguage.googleapis.com/v1beta/openai"

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

    async def chat_stream(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> AsyncGenerator[str, None]:
        selected_model = model or self.default_model

        # 1. External Cloud Providers (OpenAI, Groq, Gemini, OpenRouter)
        if api_key and api_key.strip():
            target_base = (api_base or "https://api.openai.com/v1").rstrip("/")
            if "groq" in (provider or "").lower() and not api_base:
                target_base = "https://api.groq.com/openai/v1"
            elif "openrouter" in (provider or "").lower() and not api_base:
                target_base = "https://openrouter.ai/api/v1"
            elif "gemini" in (provider or "").lower() and not api_base:
                target_base = "https://generativelanguage.googleapis.com/v1beta/openai"

            url = f"{target_base}/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key.strip()}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": selected_model,
                "messages": messages,
                "temperature": temperature,
                "stream": True
            }

            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    async with client.stream("POST", url, json=payload, headers=headers) as resp:
                        resp.raise_for_status()
                        async for line in resp.aiter_lines():
                            if not line or not line.strip():
                                continue
                            line_str = line.strip()
                            if line_str.startswith("data: "):
                                data_str = line_str[6:].strip()
                                if data_str == "[DONE]":
                                    break
                                try:
                                    chunk = json.loads(data_str)
                                    delta = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                                    if delta:
                                        yield delta
                                except Exception:
                                    continue
                return
            except Exception as exc:
                raise OllamaServiceError(f"Streaming error with {provider}: {str(exc)}")

        # 2. Local Ollama Streaming
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": selected_model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": temperature
            }
        }

        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT) as client:
                async with client.stream("POST", url, json=payload) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line or not line.strip():
                            continue
                        try:
                            chunk = json.loads(line)
                            content = chunk.get("message", {}).get("content", "")
                            if content:
                                yield content
                            if chunk.get("done", False):
                                break
                        except Exception:
                            continue
        except httpx.ConnectError:
            raise OllamaServiceError(f"Ollama service is unreachable. Ensure Ollama is running at {self.base_url}")
        except httpx.RequestError as exc:
            raise OllamaServiceError(f"Failed streaming from Ollama: {str(exc)}")

    async def generate_response_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        provider: str = "ollama"
    ) -> AsyncGenerator[str, None]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        async for token in self.chat_stream(
            messages=messages,
            model=model,
            temperature=temperature,
            api_key=api_key,
            api_base=api_base,
            provider=provider
        ):
            yield token

llm_service = LLMService()
