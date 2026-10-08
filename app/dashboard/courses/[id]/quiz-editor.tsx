'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, X, CheckCircle, Circle, Save, Loader2 } from 'lucide-react';

type QuizOption = {
  id?: string;
  option_text: string;
  is_correct: boolean;
};

type QuizQuestion = {
  id?: string;
  question: string;
  options: QuizOption[];
};

export function QuizEditor({ 
  lessonId, 
  lessonTitle, 
  onClose 
}: { 
  lessonId: string; 
  lessonTitle: string;
  onClose: () => void;
}) {
  const supabase = createClient();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [lessonId]);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('course_quiz_questions')
      .select(`
        id, question, "order",
        course_quiz_options (id, option_text, is_correct, "order")
      `)
      .eq('lesson_id', lessonId)
      .order('order');

    if (data) {
      setQuestions(data.map(q => ({
        id: q.id,
        question: q.question,
        options: (q.course_quiz_options || []).sort((a: any, b: any) => a.order - b.order).map((o: any) => ({
          id: o.id,
          option_text: o.option_text,
          is_correct: o.is_correct
        }))
      })));
    }
    setLoading(false);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
        ]
      }
    ]);
  };

  const removeQuestion = (qIndex: number) => {
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };

  const updateQuestionText = (qIndex: number, text: string) => {
    const next = [...questions];
    next[qIndex].question = text;
    setQuestions(next);
  };

  const addOption = (qIndex: number) => {
    const next = [...questions];
    next[qIndex].options.push({ option_text: '', is_correct: false });
    setQuestions(next);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const next = [...questions];
    next[qIndex].options = next[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(next);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const next = [...questions];
    next[qIndex].options[oIndex].option_text = text;
    setQuestions(next);
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    const next = [...questions];
    next[qIndex].options.forEach((o, i) => {
      o.is_correct = (i === oIndex); // Single correct answer logic for now
    });
    setQuestions(next);
  };

  const saveQuiz = async () => {
    setSaving(true);
    
    // Simplest approach: Delete all existing and recreate
    // In production, an upsert is better, but this avoids complex diffs for now.
    await supabase.from('course_quiz_questions').delete().eq('lesson_id', lessonId);

    for (let qIndex = 0; qIndex < questions.length; qIndex++) {
      const q = questions[qIndex];
      if (!q.question.trim()) continue;

      const { data: qData, error: qError } = await supabase.from('course_quiz_questions').insert({
        lesson_id: lessonId,
        question: q.question,
        order: qIndex
      }).select('id').single();

      if (qData && !qError) {
        const validOptions = q.options.filter(o => o.option_text.trim() !== '');
        if (validOptions.length > 0) {
          await supabase.from('course_quiz_options').insert(
            validOptions.map((o, oIndex) => ({
              question_id: qData.id,
              option_text: o.option_text,
              is_correct: o.is_correct,
              order: oIndex
            }))
          );
        }
      }
    }

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Éditeur de Quiz</h2>
            <p className="text-sm text-neutral-500">Leçon : {lessonTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-neutral-50/50">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>
          ) : questions.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border border-dashed border-neutral-300">
              <p className="text-neutral-500 mb-4">Ce quiz n'a pas encore de questions.</p>
              <button onClick={addQuestion} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90">
                <Plus className="h-4 w-4" /> Ajouter la première question
              </button>
            </div>
          ) : (
            <>
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm relative group">
                  <div className="absolute top-4 right-4">
                    <button onClick={() => removeQuestion(qIndex)} className="text-neutral-300 hover:text-red-500 transition-colors p-1 bg-white">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">Question {qIndex + 1}</label>
                    <input
                      value={q.question}
                      onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                      placeholder="Ex: Que signifie l'acronyme HTML ?"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-600">Réponses possibles :</label>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <button 
                          onClick={() => setCorrectOption(qIndex, oIndex)}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${opt.is_correct ? 'border-green-500 text-green-500 bg-green-50' : 'border-neutral-300 text-neutral-300 hover:border-neutral-400'}`}
                        >
                          {opt.is_correct ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>
                        <input
                          value={opt.option_text}
                          onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 rounded-md border border-neutral-200 px-3 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
                        />
                        <button onClick={() => removeOption(qIndex, oIndex)} className="text-neutral-300 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addOption(qIndex)} className="text-sm text-brand-primary hover:underline font-medium flex items-center gap-1 mt-2">
                      <Plus className="h-3 w-3" /> Ajouter une option
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all font-medium flex items-center justify-center gap-2">
                <Plus className="h-5 w-5" /> Ajouter une nouvelle question
              </button>
            </>
          )}
        </div>

        <div className="p-6 border-t border-neutral-100 flex justify-end gap-3 bg-white rounded-b-2xl">
          <button onClick={onClose} disabled={saving} className="px-5 py-2.5 rounded-xl font-medium text-neutral-600 hover:bg-neutral-100 transition-colors">
            Annuler
          </button>
          <button 
            onClick={saveQuiz} 
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Enregistrement...' : 'Enregistrer le Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
