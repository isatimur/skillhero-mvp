// lib/aiTraining.ts
import { Question, SETopic } from '../types';
import { supabase } from './supabase';

export const generateAIQuiz = async (topic: SETopic, count = 5): Promise<Question[]> => {
  const { data, error } = await supabase.functions.invoke('generate-quiz', {
    body: { topic, count },
  });

  if (error) throw new Error(error.message || 'AI quiz generation failed');
  if (!data?.questions?.length) throw new Error('AI returned no valid questions.');

  return data.questions as Question[];
};
