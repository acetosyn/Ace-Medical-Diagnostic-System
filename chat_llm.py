# chat_llm.py – Handles general LLM health Q&A on the Chat Page

import os
from dotenv import load_dotenv
from groq import Groq



load_dotenv()
chat_api_key = os.getenv("Chat_llm")
client = Groq(api_key=chat_api_key)

SYSTEM_PROMPT = (
    "You are ACE, a warm and professional AI medical assistant who responds like a caring doctor. "
    "Your tone is friendly, brief, and conversational, like a human doctor. "
    "You provide evidence-based health information, answer questions about symptoms, medications, and chronic conditions, "
    "and guide patients with empathy. "
    "If a question requires a diagnosis or prescription, you advise consulting a licensed professional."
)

conversation_history = [
    {"role": "system", "content": SYSTEM_PROMPT},
]

asked_small_talk = set()  # Track which casual questions were already answered

SMALL_TALK_KEYWORDS = {
    "how are you": "I'm fine, thank you. How about you? Is there anything medical I can help you with today?",
    "who are you": "I'm ACE, your friendly medical & diagnostic assistant. I'm here to help you with health-related questions.",
    "what are you": "I'm ACE, an AI medical assistant designed to help with medical and diagnostic guidance."
}

def is_small_talk(prompt):
    lower_prompt = prompt.lower()
    for key in SMALL_TALK_KEYWORDS:
        if key in lower_prompt:
            return key
    return None

def stream_response(user_prompt):
    key = is_small_talk(user_prompt)
    if key:
        if key in asked_small_talk:
            yield f"Still doing well, thanks again for asking! Ready to help with your medical questions anytime."
            conversation_history.append({"role": "assistant", "content": "Still doing well, thanks again for asking!"})
            return
        else:
            asked_small_talk.add(key)
            reply = SMALL_TALK_KEYWORDS[key]
            yield reply
            conversation_history.append({"role": "assistant", "content": reply})
            return

    # Normal conversation flow
    conversation_history.append({"role": "user", "content": user_prompt})
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=conversation_history,
            stream=True
        )
        full_reply = ""
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_reply += content
                yield content

        conversation_history.append({"role": "assistant", "content": full_reply})

    except Exception as e:
        yield f"[LLM Error]: {str(e)}"
