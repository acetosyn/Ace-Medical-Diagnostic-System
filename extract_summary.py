# extract_summary.py
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("Chat_llm"))

def summarize_bot_responses(convo_turns):
    messages = [
        {
            "role": "system",
            "content": (
                "You are Ace, a helpful and intelligent AI medical assistant. Your task is to respond naturally "
                "by summarizing recent bot messages in a conversational tone. Avoid robotic or report-style summaries. \n\n"
                "✅ If the user says 'thanks', 'bye', or 'have a nice day', just reply kindly and end the chat.\n"
                "✅ Otherwise, give a helpful recap of the last exchange and follow up with something friendly like "
                "'Does that answer your question?' or 'Would you like to know more?'\n\n"
                "💡 Tips:\n"
                "- Mention what the user asked if it's important.\n"
                "- Rephrase your most recent answer naturally.\n"
                "- Never restate your job unless asked directly.\n"
                "- Never say 'This is a summary of...' or 'report'.\n"
                "- Your name is pronounced 'Ace', not A-C-E."
            )
        },
        {"role": "user", "content": "\n".join(convo_turns)}
    ]

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages
    )
    return response.choices[0].message.content


