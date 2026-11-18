import os
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from config import settings

# If supabase credentials are provided, we can sync with Supabase
SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_KEY

supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase client: {e}")

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chat_memory.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        primary_domain TEXT DEFAULT 'general_medicine',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        domain TEXT,
        is_safe INTEGER DEFAULT 1,
        safety_note TEXT,
        execution_trace TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
    """)
    conn.commit()
    conn.close()

init_db()

class ConversationMemory:
    @staticmethod
    def create_conversation(user_id: str, title: str = "New Consultation", primary_domain: str = "general_medicine") -> Dict[str, Any]:
        conv_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        # 1. Local SQLite store
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO conversations (id, user_id, title, primary_domain, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (conv_id, user_id, title, primary_domain, now, now)
        )
        conn.commit()
        conn.close()

        # 2. Supabase Cloud Sync (if configured)
        if supabase_client:
            try:
                supabase_client.table("conversations").insert({
                    "id": conv_id,
                    "user_id": user_id,
                    "title": title,
                    "primary_domain": primary_domain,
                    "created_at": now,
                    "updated_at": now
                }).execute()
            except Exception as e:
                print(f"Supabase sync warning (create_conv): {e}")

        return {
            "id": conv_id,
            "user_id": user_id,
            "title": title,
            "primary_domain": primary_domain,
            "created_at": now,
            "updated_at": now
        }

    @staticmethod
    def list_conversations(user_id: str) -> List[Dict[str, Any]]:
        # Check Supabase first if available
        if supabase_client:
            try:
                res = supabase_client.table("conversations").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"Supabase sync warning (list_conv): {e}")

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,)
        )
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return rows

    @staticmethod
    def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def update_title(conversation_id: str, title: str):
        now = datetime.now(timezone.utc).isoformat()
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?",
            (title, now, conversation_id)
        )
        conn.commit()
        conn.close()

        if supabase_client:
            try:
                supabase_client.table("conversations").update({"title": title, "updated_at": now}).eq("id", conversation_id).execute()
            except Exception as e:
                print(f"Supabase sync warning (update_title): {e}")

    @staticmethod
    def delete_conversation(conversation_id: str, user_id: str):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM messages WHERE conversation_id = ?", (conversation_id,))
        cursor.execute("DELETE FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
        conn.commit()
        conn.close()

        if supabase_client:
            try:
                supabase_client.table("messages").delete().eq("conversation_id", conversation_id).execute()
                supabase_client.table("conversations").delete().eq("id", conversation_id).execute()
            except Exception as e:
                print(f"Supabase sync warning (delete_conv): {e}")

    @staticmethod
    def add_message(
        conversation_id: str,
        user_id: str,
        role: str,
        content: str,
        domain: Optional[str] = None,
        is_safe: bool = True,
        safety_note: Optional[str] = None,
        execution_trace: Optional[str] = None
    ) -> Dict[str, Any]:
        msg_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO messages 
               (id, conversation_id, user_id, role, content, domain, is_safe, safety_note, execution_trace, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (msg_id, conversation_id, user_id, role, content, domain, 1 if is_safe else 0, safety_note, execution_trace, now)
        )
        cursor.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conversation_id))
        conn.commit()
        conn.close()

        if supabase_client:
            try:
                supabase_client.table("messages").insert({
                    "id": msg_id,
                    "conversation_id": conversation_id,
                    "user_id": user_id,
                    "role": role,
                    "content": content,
                    "domain": domain,
                    "is_safe": is_safe,
                    "safety_note": safety_note,
                    "execution_trace": execution_trace,
                    "created_at": now
                }).execute()
                supabase_client.table("conversations").update({"updated_at": now}).eq("id", conversation_id).execute()
            except Exception as e:
                print(f"Supabase sync warning (add_msg): {e}")

        return {
            "id": msg_id,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "role": role,
            "content": content,
            "domain": domain,
            "is_safe": is_safe,
            "safety_note": safety_note,
            "created_at": now
        }

    @staticmethod
    def get_messages(conversation_id: str) -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"Supabase sync warning (get_msgs): {e}")

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            (conversation_id,)
        )
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        for r in rows:
            r["is_safe"] = bool(r.get("is_safe", 1))
        return rows

    @staticmethod
    def get_recent_context(conversation_id: str, limit: int = 6) -> str:
        """Returns formatted string of recent conversation turns for LLM prompt context injection."""
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?",
            (conversation_id, limit)
        )
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        if not rows:
            return ""
        
        # Reverse so chronological
        rows.reverse()
        formatted = []
        for r in rows:
            role_label = "Patient/User" if r["role"] == "user" else "Clinician/Assistant"
            formatted.append(f"{role_label}: {r['content']}")
        return "\n".join(formatted)
