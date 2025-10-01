'use server';

import { config } from 'dotenv';
config();

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This is the Genkit development server configuration.
// It is used to run the Genkit flows locally.
//
// The `googleAI` plugin is required to use the Google AI models.
// It is configured with the `GEMINI_API_KEY` environment variable.
export default genkit({
  plugins: [googleAI()],
});

// This line imports the flow and makes it available to the development server.
import '@/ai/flows/conversion-format-recommendation.ts';
