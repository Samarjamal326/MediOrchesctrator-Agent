from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from core.memory import ConversationMemory

router = APIRouter(prefix="/v1/conversations", tags=["Conversations"])

class CreateConversationRequest(BaseModel):
    user_id: str
    title: Optional[str] = "New Consultation"
    primary_domain: Optional[str] = "general_medicine"

class UpdateConversationRequest(BaseModel):
    title: str

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    primary_domain: str
    created_at: str
    updated_at: str

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    user_id: str
    role: str
    content: str
    domain: Optional[str] = None
    is_safe: bool = True
    safety_note: Optional[str] = None
    created_at: str

@router.get("", response_model=List[ConversationResponse])
async def list_conversations(user_id: str):
    return ConversationMemory.list_conversations(user_id=user_id)

@router.post("", response_model=ConversationResponse)
async def create_conversation(req: CreateConversationRequest):
    return ConversationMemory.create_conversation(
        user_id=req.user_id,
        title=req.title or "New Consultation",
        primary_domain=req.primary_domain or "general_medicine"
    )

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(conversation_id: str):
    messages = ConversationMemory.get_messages(conversation_id=conversation_id)
    return messages

@router.patch("/{conversation_id}")
async def update_conversation(conversation_id: str, req: UpdateConversationRequest):
    ConversationMemory.update_title(conversation_id=conversation_id, title=req.title)
    return {"status": "ok", "title": req.title}

@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str, user_id: str):
    ConversationMemory.delete_conversation(conversation_id=conversation_id, user_id=user_id)
    return {"status": "deleted"}
