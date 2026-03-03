'use server';
/**
 * @fileOverview An AI learning path assistant that suggests tailored learning paths and supplementary resources.
 *
 * - personalizedLearningPath - A function that handles the personalized learning path generation process.
 * - PersonalizedLearningPathInput - The input type for the personalizedLearningPath function.
 * - PersonalizedLearningPathOutput - The return type for the personalizedLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema for the personalized learning path flow
const PersonalizedLearningPathInputSchema = z.object({
  studentProfile: z
    .string()
    .describe('A summary of the student\'s learning preferences, goals, or role (e.g., "visual learner", "aims for game development", "mastery in digital media").'),
  completedModuleTitles: z
    .array(z.string())
    .describe('List of titles of modules the student has successfully completed.'),
  moduleScores: z
    .array(
      z.object({
        moduleTitle: z.string().describe('The title of the module.'),
        humanismoScore: z.number().describe('The humanism score achieved in the module activities.'),
        innovacionScore: z.number().describe('The innovation score achieved in the module activities.'),
      })
    )
    .describe('Performance scores in specific modules, broken down by humanism and innovation metrics.'),
  skillGaps: z
    .array(z.string())
    .describe('Identified areas where the student needs improvement (e.g., "composition theory", "audio engineering", "ethical implications of AI").'),
  courseOverview: z
    .string()
    .describe('A complete overview of the course structure, including all modules, their subtopics, and available resources, formatted for AI consumption.'),
});

export type PersonalizedLearningPathInput = z.infer<typeof PersonalizedLearningPathInputSchema>;

// Output Schema for the personalized learning path flow
const PersonalizedLearningPathOutputSchema = z.object({
  suggestedLearningPaths: z
    .array(
      z.object({
        title: z.string().describe('The title of the suggested module or topic.'),
        reason: z.string().describe('Explanation for why this module or topic is suggested.'),
      })
    )
    .describe('A prioritized list of modules or topics recommended for the student, each with a reason for its suggestion.'),
  suggestedResources: z
    .array(z.string())
    .describe('A list of supplementary resources (e.g., article titles, video names, external links) recommended to address skill gaps or deepen understanding.'),
  areasForImprovement: z
    .array(z.string())
    .describe('Specific areas or skills the student should focus on based on their performance and identified gaps.'),
  rationale: z
    .string()
    .describe('A comprehensive explanation of why these specific paths and resources are suggested, tailored to the student\'s profile and progress.'),
});

export type PersonalizedLearningPathOutput = z.infer<typeof PersonalizedLearningPathOutputSchema>;

export async function personalizedLearningPath(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  return personalizedLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedLearningPathPrompt',
  input: {schema: PersonalizedLearningPathInputSchema},
  output: {schema: PersonalizedLearningPathOutputSchema},
  prompt: `You are an AI learning path assistant for the "AcademIA UNIAT" platform.
Your goal is to analyze a student's profile, course progress, activity performance, and identified skill gaps to suggest tailored learning paths and supplementary resources. This will help the student focus on areas needing improvement and optimize their learning journey in the "Teoría de la Imagen" course.

Here is the student's information:
Student Profile: {{{studentProfile}}}
Completed Modules:
{{#if completedModuleTitles}}
  {{#each completedModuleTitles}}
    - {{{this}}}
  {{/each}}
{{else}}
  None specified.
{{/if}}

Module Performance Scores (Humanism / Innovation):
{{#if moduleScores}}
  {{#each moduleScores}}
    - {{{moduleTitle}}}: Humanism Score = {{{humanismoScore}}}, Innovation Score = {{{innovacionScore}}}
  {{/each}}
{{else}}
  No specific scores provided.
{{/if}}

Identified Skill Gaps:
{{#if skillGaps}}
  {{#each skillGaps}}
    - {{{this}}}
  {{/each}}
{{else}}
  No specific skill gaps identified.
{{/if}}

Course Overview (structure, modules, subtopics, and available resources):
{{{courseOverview}}}

Based on this information, provide a personalized learning plan.
Focus on suggesting the NEXT logical steps in their learning journey, prioritizing modules or resources that address their identified skill gaps or build upon their current progress.
Your suggestions for learning paths should be a prioritized list of objects, each with a 'title' (module title) and a 'reason' (explanation for the suggestion).
Your suggestions for resources should be a list of relevant supplementary materials.
Clearly state the specific areas for improvement.
Finally, provide a comprehensive rationale explaining your recommendations.`,
});

const personalizedLearningPathFlow = ai.defineFlow(
  {
    name: 'personalizedLearningPathFlow',
    inputSchema: PersonalizedLearningPathInputSchema,
    outputSchema: PersonalizedLearningPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
