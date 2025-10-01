'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending conversion result display templates using AI.
 *
 * The flow takes a description of the desired format and returns a recommended template.
 *
 * @remarks
 * - conversionFormatRecommendation - A function that handles the conversion format recommendation process.
 * - ConversionFormatRecommendationInput - The input type for the conversionFormatRecommendation function.
 * - ConversionFormatRecommendationOutput - The return type for the conversionFormatRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversionFormatRecommendationInputSchema = z.object({
  description: z
    .string()
    .describe(
      'A description of the desired conversion format, including the desired elements and their arrangement.'
    ),
  lang: z.enum(['en', 'id']),
});
export type ConversionFormatRecommendationInput = z.infer<
  typeof ConversionFormatRecommendationInputSchema
>;

const ConversionFormatRecommendationOutputSchema = z.object({
  template: z
    .string()
    .describe(
      'A recommended template for displaying the conversion result, using placeholders like {input_amount_str}, {harga_dasar_str}, {laba_str}, {total_laba_str}, {harga_jual_str}, {harga_beli_str}, {output_currency}, etc.'
    ),
});
export type ConversionFormatRecommendationOutput = z.infer<
  typeof ConversionFormatRecommendationOutputSchema
>;

export async function conversionFormatRecommendation(
  input: ConversionFormatRecommendationInput
): Promise<ConversionFormatRecommendationOutput> {
  return conversionFormatRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversionFormatRecommendationPrompt',
  input: {schema: ConversionFormatRecommendationInputSchema},
  output: {schema: ConversionFormatRecommendationOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a template creation expert. Your response must be in {{{lang}}}. Please analyze the user's description and generate a suitable template for displaying conversion results.

The available placeholders are: {input_amount_str}, {input_currency}, {output_currency}, {harga_dasar_str}, {laba_str}, {total_laba_str}, {harga_jual_per_ton_str}, {harga_beli_per_ton_str}, {harga_jual_str}, {harga_beli_str}.

Description: {{{description}}}

Template:`,
});

const conversionFormatRecommendationFlow = ai.defineFlow(
  {
    name: 'conversionFormatRecommendationFlow',
    inputSchema: ConversionFormatRecommendationInputSchema,
    outputSchema: ConversionFormatRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
