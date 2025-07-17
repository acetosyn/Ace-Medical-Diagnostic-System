# report_llm.py – Supports LLM features on the Clinic Report Page

import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
report_api_key = os.getenv("Groq_report_llm")
client = Groq(api_key=report_api_key)

SYSTEM_PROMPT = (
    "You are a clinical assistant AI designed to support doctors and nurses.\n\n"
    "Your role is to help interpret radiology reports and assist with clinical workflow. "
    "When given a radiology report, perform the following:\n"
    "1. Summarize findings using clinical language.\n"
    "2. Highlight abnormalities or critical impressions.\n"
    "3. Map relevant medical terms to ICD-10 codes.\n"
    "4. If the user asks follow-up questions, reply as a clinical assistant.\n\n"
    "Do NOT provide patient reassurance or general advice."
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
