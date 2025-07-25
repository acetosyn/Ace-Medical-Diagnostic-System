# report_llm.py – Supports LLM features on the Clinic Report Page

import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
report_api_key = os.getenv("Groq_report_llm")
client = Groq(api_key=report_api_key)

SYSTEM_PROMPT = (
    "You are ACE, a clinical AI assistant specialized in interpreting diagnostic and radiology reports. "
    "You support doctors and nurses by clarifying findings, highlighting abnormalities, and mapping relevant terms to ICD-10 codes. "
    "You keep responses clear, precise, and professional. "
    "You can answer brief greetings or casual questions politely but keep your focus on the report."
)

conversation_history = [
    {"role": "system", "content": SYSTEM_PROMPT},
]

asked_small_talk = set()

SMALL_TALK_KEYWORDS = {
    "how are you": "I'm doing well, thank you. Ready to discuss your report.",
    "who are you": "I'm ACE, your clinical report assistant. I help explain diagnostic findings and answer your questions.",
    "what are you": "I'm ACE, an AI tool designed to help interpret and explain diagnostic reports."
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
            yield f"Still doing well, thank you again for asking! Let's continue focusing on your report."
            conversation_history.append({"role": "assistant", "content": "Still doing well, thank you again for asking!"})
            return
        else:
            asked_small_talk.add(key)
            reply = SMALL_TALK_KEYWORDS[key]
            yield reply
            conversation_history.append({"role": "assistant", "content": reply})
            return

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
