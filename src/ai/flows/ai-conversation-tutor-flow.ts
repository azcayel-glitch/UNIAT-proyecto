'use server';
/**
 * @fileOverview This file implements a Genkit flow for an AI-powered conversational tutor.
 * It allows students to ask questions and receive personalized, contextualized explanations
 * related to course content in "Teoría de la Imagen y Medios Digitales".
 *
 * - aiConversationTutor - The main function to interact with the AI tutor.
 * - AiConversationTutorInput - The input type for the aiConversationTutor function.
 * - AiConversationTutorOutput - The return type for the aiConversationTutor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiConversationTutorInputSchema = z.object({
  studentQuestion: z.string().describe('The question from the student.'),
  moduleContext: z
    .string()
    .optional()
    .describe(
      'Contextual information from the current course module, such as syllabus, module content, subtopic content, or activity instructions.'
    ),
});
export type AiConversationTutorInput = z.infer<typeof AiConversationTutorInputSchema>;

const AiConversationTutorOutputSchema = z.object({
  aiResponse: z.string().describe('The AI tutor\'s personalized and contextualized explanation or answer.'),
});
export type AiConversationTutorOutput = z.infer<typeof AiConversationTutorOutputSchema>;

export async function aiConversationTutor(input: AiConversationTutorInput): Promise<AiConversationTutorOutput> {
  return aiConversationTutorFlow(input);
}

const aiConversationTutorPrompt = ai.definePrompt({
  name: 'aiConversationTutorPrompt',
  input: {schema: AiConversationTutorInputSchema},
  output: {schema: AiConversationTutorOutputSchema},
  prompt: `You are an expert professor in "Teoría de la Imagen y Medios Digitales" at UNIAT University.
Your role is to act as a helpful and academic, yet accessible, AI tutor for students.
When answering, always refer to the provided course context first, if available.
Explain complex concepts clearly, provide analogies if helpful, and encourage critical thinking.
Keep your responses concise but comprehensive enough to answer the student's query thoroughly.

--- Course Context ---
{{#if moduleContext}}
{{moduleContext}}
{{else}}
No specific course context provided, but assume the student is learning about "Teoría de la Imagen y Medios Digitales".
{{/if}}

--- Student's Question ---
{{studentQuestion}}

Please provide your answer below.`,
});

const aiConversationTutorFlow = ai.defineFlow(
  {
    name: 'aiConversationTutorFlow',
    inputSchema: AiConversationTutorInputSchema,
    outputSchema: AiConversationTutorOutputSchema,
  },
  async input => {
    const {output} = await aiConversationTutorPrompt(input);
    return output!;
  }
);
