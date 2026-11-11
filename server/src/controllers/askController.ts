import { type Request, type Response } from 'express';
import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';

dotenv.config();

// Get the OpenAI API key from the environment variables
const apiKey = process.env.OPENAI_API_KEY;
let model: ChatOpenAI | null ;

if (apiKey) {
  // Initialize the OpenAI model if the API key is provided
  //What is temperature doing?
  //
  model = new ChatOpenAI({ temperature: 0.7, openAIApiKey: apiKey, model: "gpt-4.1-mini" });
} else {
  console.error('OPENAI_API_KEY is not configured.');
}

// Call the OpenAI API to get a response for the input
const promptFunc = async (input: string): Promise<string> => {
  try {
    if (model) {
      const response = await model.invoke(input);
      return response.content.toString();
    }
    return 'No OpenAI API key provided. Unable to provide a response.';
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Handle the POST request to ask a question
export const askQuestion = async (req: Request, res: Response): Promise<void> => {
  const userQuestion: string = req.body.question;

  try {
    if (!userQuestion) {
      res.status(400).json({ question: null, response: 'Please provide a question in the request body.' });
      return;
    }
    console.log("MODEL CONFIGURATION:", model?.model);

    const answer: string = await promptFunc(userQuestion);
    res.json({ question: userQuestion, response: answer });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    res.status(500).json({ question: userQuestion, response: 'Internal Server Error' });
  }
};
