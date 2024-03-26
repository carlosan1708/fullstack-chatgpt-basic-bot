import os
from typing import List
import json

import openai

assistant_message = {
    'role': 'system',
    'content': os.getenv("SYSTEM_PROMPT")
}

def generate_response(request_body: str, api_key: str):
    try:
        openai_client = openai.OpenAI(api_key=api_key)
        if isinstance(request_body, str):
            try:
                # Attempt to deserialize the JSON data
                data = json.loads(request_body)
            except json.JSONDecodeError:
                return 'Invalid JSON data'
        elif isinstance(request_body, dict):
            # If data request_body is already a dictionary, use it directly
            data = request_body
        else:
            return 'Unsupported data type'
        messages = data['messages']
        filtered_messages = [message for message in messages if message['role'] != 'system']
        filtered_messages.insert(0, assistant_message)

        response = openai_client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=filtered_messages,
            temperature=0.5
        )
        print(response)
        bot_response = response.choices[0].message.content
        return {"bot_response": bot_response}
    except Exception as e:
        return {"error": str(e)}

def lambda_handler(event, context):
    try:
        api_key = os.getenv("API_KEY")
        if "body" in event:
            request_body = event['body']
        else:
            request_body = event
        response = generate_response(request_body, api_key)
        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({"message": "Internal Server Error, error: {e}"})
        }
