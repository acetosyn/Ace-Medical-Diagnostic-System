# llm_server.py – Handles LLM-based medical report summarization, tagging, and Q&A

import os
from dotenv import load_dotenv
from groq import Groq

# Load .env API key
load_dotenv()
groq_api_key = os.getenv("groq_api")
client = Groq(api_key=groq_api_key)

# Define system prompt
SYSTEM_PROMPT = (
    "You are a clinical assistant AI designed to support doctors and nurses.\n\n"
    "Your role is to help interpret radiology reports and assist with clinical workflow. "
    "When given a radiology report, perform the following:\n"
    "1. Summarize the findings clearly, using standard clinical language.\n"
    "2. Highlight any abnormalities or critical impressions.\n"
    "3. Map relevant terms to ICD-10 codes or disease tags (e.g., J18.9 for pneumonia).\n"
    "4. If the user asks questions, provide direct, medically appropriate answers based on the report content.\n\n"
    "Do NOT provide patient reassurance or generic advice. Focus strictly on supporting licensed healthcare workers "
    "with accurate clinical information.\n"
)

# 🧠 Stream response generator
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
