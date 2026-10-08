'use client';

import { useState } from 'react';
import { Plus, Video, FileText, AlignLeft, HelpCircle, ChevronDown, ChevronRight, GripVertical, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { QuizEditor } from './quiz-editor';

type Lesson = {
  id: string;
  title: string;
  type: string;
  video_url: string | null;
  document_url: string | null;
  order: number;
  is_required: boolean;
};

type Module = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  course_lessons: Lesson[];
};

export function CourseContent({
  courseId,
  modules,
  isAdmin
}: {
  courseId: string;
  modules: Module[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(
    modules.reduce((acc, mod) => ({ ...acc, [mod.id]: true }), {})
  );
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  // Lesson form state
  const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('VIDEO');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  
  // Quiz Editor state
  const [editingQuizLesson, setEditingQuizLesson] = useState<{id: string, title: string} | null>(null);
  
  const [loading, setLoading] = useState(false);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="h-4 w-4 text-blue-500" />;
      case 'DOCUMENT': return <FileText className="h-4 w-4 text-red-500" />;
      case 'TEXT': return <AlignLeft className="h-4 w-4 text-emerald-500" />;
      case 'QUIZ': return <HelpCircle className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-neutral-500" />;
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setLoading(true);

    const { error } = await supabase.from('course_modules').insert({
      course_id: courseId,
      title: newModuleTitle,
      order: modules.length
    });

    setLoading(false);
    if (!error) {
      setNewModuleTitle('');
      setIsAddingModule(false);
      router.refresh();
    }
  };

  const handleAddLesson = async (e: React.FormEvent, moduleId: string, currentLessonsLength: number) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    setLoading(true);

    const newLesson: any = {
      module_id: moduleId,
      title: lessonTitle,
      type: lessonType,
      order: currentLessonsLength,
    };

    if (lessonType === 'VIDEO') newLesson.video_url = lessonUrl;
    if (lessonType === 'DOCUMENT') newLesson.document_url = lessonUrl;
    if (lessonType === 'TEXT') newLesson.content = lessonContent;

    const { error } = await supabase.from('course_lessons').insert(newLesson);

    setLoading(false);
    if (!error) {
      setAddingLessonToModule(null);
      setLessonTitle('');
      setLessonType('VIDEO');
      setLessonUrl('');
      setLessonContent('');
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">Programme du cours</h2>
      </div>

      <div className="space-y-3">
        {modules.map((mod, index) => (
          <div key={mod.id} className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
            {/* Module Header */}
            <div 
              className="flex items-center gap-3 p-4 bg-neutral-50/50 cursor-pointer hover:bg-neutral-50 transition-colors"
              onClick={() => toggleModule(mod.id)}
            >
              <div className="flex h-6 w-6 items-center justify-center text-neutral-400">
                {expandedModules[mod.id] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
              <div className="flex-1 font-medium text-neutral-900">
                <span className="text-brand-primary mr-2">Module {index + 1}:</span>
                {mod.title}
              </div>
              <div className="text-xs text-neutral-500 font-medium">
                {mod.course_lessons?.length || 0} leçon(s)
              </div>
            </div>

            {/* Module Lessons */}
            {expandedModules[mod.id] && (
              <div className="border-t border-neutral-100 p-2 space-y-1 bg-white">
                {mod.course_lessons?.map((lesson, lIndex) => (
                  <div key={lesson.id} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-neutral-50 group">
                    <GripVertical className="h-4 w-4 text-neutral-300 cursor-grab" />
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-neutral-100">
                      {getIconForType(lesson.type)}
                    </div>
                    <div className="flex-1 text-sm font-medium text-neutral-700 flex items-center gap-2">
                      {lIndex + 1}. {lesson.title}
                      {isAdmin && lesson.type === 'QUIZ' && (
                        <button 
                          onClick={() => setEditingQuizLesson({ id: lesson.id, title: lesson.title })}
                          className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                        >
                          Configurer le Quiz
                        </button>
                      )}
                    </div>
                    {isAdmin && (
                      <button className="p-1.5 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {(!mod.course_lessons || mod.course_lessons.length === 0) && (
                  <div className="text-center py-4 text-sm text-neutral-400">
                    Ce module est vide.
                  </div>
                )}

                {isAdmin && (
                  <div className="pt-2 px-2 pb-1">
                    {addingLessonToModule === mod.id ? (
                      <form onSubmit={(e) => handleAddLesson(e, mod.id, mod.course_lessons?.length || 0)} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-neutral-700">Nouvelle leçon</span>
                          <button type="button" onClick={() => setAddingLessonToModule(null)} className="text-neutral-400 hover:text-neutral-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <input
                          required
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          placeholder="Titre de la leçon..."
                          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                        />
                        
                        <div className="flex gap-2">
                          <select
                            value={lessonType}
                            onChange={(e) => setLessonType(e.target.value)}
                            className="w-1/3 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                          >
                            <option value="VIDEO">Vidéo</option>
                            <option value="DOCUMENT">Document PDF</option>
                            <option value="TEXT">Texte libre</option>
                            <option value="QUIZ">Quiz</option>
                          </select>

                          {(lessonType === 'VIDEO' || lessonType === 'DOCUMENT') && (
                            <input
                              required
                              value={lessonUrl}
                              onChange={(e) => setLessonUrl(e.target.value)}
                              placeholder={lessonType === 'VIDEO' ? "URL de la vidéo (ex: YouTube)" : "URL du document PDF"}
                              className="w-2/3 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                            />
                          )}
                        </div>

                        {lessonType === 'TEXT' && (
                          <textarea
                            required
                            value={lessonContent}
                            onChange={(e) => setLessonContent(e.target.value)}
                            placeholder="Contenu de la leçon..."
                            rows={3}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                          />
                        )}

                        {lessonType === 'QUIZ' && (
                          <div className="text-xs text-brand-primary font-medium p-2 bg-brand-primary/10 rounded-md">
                            Le questionnaire pourra être configuré après sa création en cliquant dessus.
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            disabled={loading || !lessonTitle.trim()}
                            className="rounded-md bg-brand-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                          >
                            Ajouter
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        onClick={() => setAddingLessonToModule(mod.id)}
                        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-neutral-300 py-2.5 px-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-900 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter une leçon (Vidéo, PDF, etc.)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <>
          {isAddingModule ? (
            <form onSubmit={handleAddModule} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Titre du nouveau module</label>
              <div className="flex gap-2">
                <input
                  required
                  autoFocus
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Ex: Chapitre 1 - Les bases"
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !newModuleTitle.trim()}
                  className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  Sauvegarder
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingModule(false)}
                  className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingModule(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Ajouter un nouveau module
            </button>
          )}
        </>
      )}

      {editingQuizLesson && (
        <QuizEditor 
          lessonId={editingQuizLesson.id} 
          lessonTitle={editingQuizLesson.title} 
          onClose={() => setEditingQuizLesson(null)} 
        />
      )}
    </div>
  );
}
