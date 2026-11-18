from typing import Optional, Any
from config import settings

langfuse_client = None

if settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY and "your-public-key" not in settings.LANGFUSE_PUBLIC_KEY:
    try:
        from langfuse import Langfuse
        langfuse_client = Langfuse(
            public_key=settings.LANGFUSE_PUBLIC_KEY,
            secret_key=settings.LANGFUSE_SECRET_KEY,
            host=settings.LANGFUSE_HOST
        )
        print("Langfuse Observability successfully initialized.")
    except Exception as e:
        print(f"Warning: Failed to initialize Langfuse: {e}")

class ObservabilityTracer:
    @staticmethod
    def start_pipeline_trace(
        name: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        input_data: Optional[Any] = None,
        metadata: Optional[dict] = None
    ):
        if not langfuse_client:
            return None, None
        try:
            from langfuse.types import TraceContext
            trace_id = langfuse_client.create_trace_id()
            ctx = TraceContext(trace_id=trace_id, user_id=user_id, session_id=session_id)
            root_span = langfuse_client.start_observation(
                name=name,
                as_type="chain",
                trace_context=ctx,
                input=input_data,
                metadata=metadata or {}
            )
            return root_span, ctx
        except Exception as e:
            print(f"Langfuse trace warning: {e}")
            return None, None

    @staticmethod
    def log_generation(
        ctx: Any,
        name: str,
        model: str,
        prompt: Any,
        output: Any,
        metadata: Optional[dict] = None
    ):
        if not langfuse_client or not ctx:
            return None
        try:
            obs = langfuse_client.start_observation(
                name=name,
                as_type="generation",
                trace_context=ctx,
                model=model,
                input=prompt,
                output=output,
                metadata=metadata or {}
            )
            obs.end()
            return obs
        except Exception as e:
            print(f"Langfuse generation warning: {e}")
            return None

    @staticmethod
    def log_span(
        ctx: Any,
        name: str,
        as_type: str = "span",
        input_data: Any = None,
        output_data: Any = None,
        metadata: Optional[dict] = None
    ):
        if not langfuse_client or not ctx:
            return None
        try:
            obs = langfuse_client.start_observation(
                name=name,
                as_type=as_type,
                trace_context=ctx,
                input=input_data,
                output=output_data,
                metadata=metadata or {}
            )
            obs.end()
            return obs
        except Exception as e:
            print(f"Langfuse span warning: {e}")
            return None

    @staticmethod
    def end_trace(root_span: Any, output_data: Any = None):
        if not root_span:
            return
        try:
            if output_data is not None:
                root_span.update(output=output_data)
            root_span.end()
            if langfuse_client:
                langfuse_client.flush()
        except Exception as e:
            print(f"Langfuse end warning: {e}")

tracer = ObservabilityTracer()
