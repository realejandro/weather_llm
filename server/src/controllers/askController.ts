import { type Request, type Response } from 'express';
import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
import { PromptTemplate } from '@langchain/core/prompts';

dotenv.config();

// Get the OpenAI API key from the environment variables
const apiKey = process.env.OPENAI_API_KEY;
let model: ChatOpenAI | null ;

if (apiKey) {
  // Initialize the OpenAI model if the API key is provided
  //What is temperature doing?
  //
  model = new ChatOpenAI({ temperature: 1, openAIApiKey: apiKey, model: "gpt-6-astra" });
} else {
  console.error('OPENAI_API_KEY is not configured.');
}


const promptTemplate = new PromptTemplate({
  inputVariables: ["question"],
  template: "You are a programming expert, \n{question}",
});

// Format the prompt using the prompt template with the user's question
const formatPrompt = async (question: string): Promise<string> => {
  return await promptTemplate.format({ question });
};

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

    //using formating of the prompt
    const formattedPrompt : string = await formatPrompt(userQuestion)
    const answer: string = await promptFunc(formattedPrompt);
    res.json({ question: userQuestion, response: answer });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    res.status(500).json({ question: userQuestion, response: 'Internal Server Error' });
  }
};
