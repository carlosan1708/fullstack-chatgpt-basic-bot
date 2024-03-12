# Importing necessary modules
from fastapi import FastAPI, Form, Request
from typing import Annotated
from pydantic import BaseModel
from mangum import Mangum
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

# Initializing OpenAI
openai = OpenAI(
    api_key=os.getenv("API_KEY")
)

# Creating FastAPI app instance
app = FastAPI()
handler = Mangum(app)

# Allow all origins, methods, and headers (not recommended for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]

class ChatResponse(BaseModel):
    bot_response: str

assistant_message = {
    'role': 'system',
    'content': os.getenv("SYSTEM_PROMPT")
}
@app.post("/chat", response_model=ChatResponse)
def chat(chat_request: ChatRequest):
    print(os.getenv("API_KEY"))
    # Extract messages from the request
    messages = chat_request.messages
    filtered_messages = [message for message in messages if message.role != 'system']
    filtered_messages.insert(0, assistant_message)

    # Generate bot response using the provided conversation history
    response = openai.chat.completions.create(
        model='gpt-3.5-turbo',
        messages=filtered_messages,
        temperature=0.5
    )

    # Extract bot response from the completion
    bot_response = response.choices[0].message.content

    # Return the bot response
    return {"bot_response": bot_response}
