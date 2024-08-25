import { onCall } from "firebase-functions/v2/https";
import OpenAI from "openai";

import { defineString } from 'firebase-functions/params';
const openAiApiKey = defineString('OPENAI_API_KEY');

exports.adjustText = onCall(async (request) => {
	const openai = new OpenAI({ apiKey: openAiApiKey.value() });

	const data = request.data;
	const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ "role": "system", "content": "You are an assistant who helps the user adjust the text according to the given prompt." },
	{
		"role": "user",
		"content": `text: ${data.text}, userPrompt: ${data.prompt}`
	}];

	console.log("hello");

	const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
		{
			"type": "function",
			"function": {
				"name": "setNewText",
				"description": "Set the new text based on the prompt",
				"parameters": {
					"type": "object",
					"required": ["text"],
					"properties": {
						"text": {
							"type": "string",
						}
					}
				},
			}
		}
	];

	const response = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: messages,
		tools: tools,
		tool_choice: { "type": "function", "function": { "name": "setNewText" } },
	});

	return response.choices[0].message.tool_calls?.[0].function.arguments;
});

