# chat_llm.py – Handles general LLM health Q&A on the Chat Page

import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
chat_api_key = os.getenv("Chat_llm")
client = Groq(api_key=chat_api_key)

SYSTEM_PROMPT = (
    "You are a compassionate AI medical assistant specialized in providing evidence-based health information.\n"
    "You can answer general medical questions, symptoms, medications, chronic diseases, and preventive care.\n"
    "If a question requires diagnosis or prescription, advise the user to consult a licensed professional."
)

def stream_response(user_prompt):
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            stream=True
        )

        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    except Exception as e:
        yield f"[LLM Error]: {str(e)}"
