'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Video, FileText, AlignLeft, HelpCircle, CheckCircle, ChevronLeft, ChevronRight, Menu, X, ArrowLeft } from 'lucide-react';

type CoursePlayerProps = {
  course: any;
  modules: any[];
  completedLessonIds: string[];
  enrollmentId: string;
};

export function CoursePlayer({ course, modules, completedLessonIds: initialCompleted, enrollmentId }: CoursePlayerProps) {
  const router = useRouter();
  const supabase = createClient();
  
  // Flatten lessons for easy navigation
  const allLessons = useMemo(() => {
    const list: any[] = [];
    modules.forEach(m => m.course_lessons?.forEach((l: any) => list.push({ ...l, moduleTitle: m.title })));
    return list;
  }, [modules]);

  const [activeLessonId, setActiveLessonId] = useState<string | null>(allLessons.length > 0 ? allLessons[0].id : null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set(initialCompleted));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar
  const [submittingProgress, setSubmittingProgress] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{ score: number, total: number, passed: boolean } | null>(null);

  const activeLessonIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);
  const activeLesson = allLessons[activeLessonIndex];

  const hasNext = activeLessonIndex < allLessons.length - 1;
  const hasPrev = activeLessonIndex > 0;

  const goToLesson = (id: string) => {
    setActiveLessonId(id);
    setQuizResult(null);
    setQuizAnswers({});
    setIsSidebarOpen(false);
  };

  const markAsComplete = async () => {
    if (!activeLesson || completedLessons.has(activeLesson.id)) return;
    setSubmittingProgress(true);

    const { error } = await supabase.from('course_progress').insert({
      enrollment_id: enrollmentId,
      lesson_id: activeLesson.id
    });

    setSubmittingProgress(false);

    if (!error) {
      setCompletedLessons(prev => {
        const next = new Set(prev);
        next.add(activeLesson.id);
        return next;
      });
      router.refresh();
      
      // Auto advance
      if (hasNext) {
        goToLesson(allLessons[activeLessonIndex + 1].id);
      }
    }
  };

  const submitQuiz = () => {
    if (!activeLesson || activeLesson.type !== 'QUIZ') return;
    
    const questions = activeLesson.course_quiz_questions || [];
    let correctCount = 0;

    questions.forEach((q: any) => {
      const selectedOptionId = quizAnswers[q.id];
      const correctOption = q.course_quiz_options.find((o: any) => o.is_correct);
      if (correctOption && selectedOptionId === correctOption.id) {
        correctCount++;
      }
    });

    const score = (correctCount / questions.length) * 100;
    const passed = score >= 60; // Arbitrary 60% pass mark

    setQuizResult({ score, total: questions.length, passed });

    if (passed) {
      markAsComplete();
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // simple youtube embed conversion
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url; // fallback
  };

  const renderLessonContent = () => {
    if (!activeLesson) return <div className="p-8 text-center text-neutral-500">Aucune leçon disponible.</div>;

    switch (activeLesson.type) {
      case 'VIDEO':
        return (
          <div className="space-y-6">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
              {activeLesson.video_url ? (
                <iframe 
                  src={getEmbedUrl(activeLesson.video_url)} 
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-500">URL de vidéo manquante</div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={markAsComplete}
                disabled={submittingProgress || completedLessons.has(activeLesson.id)}
                className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {completedLessons.has(activeLesson.id) ? (
                  <><CheckCircle className="h-5 w-5" /> Terminée</>
                ) : (
                  'Marquer comme terminée'
                )}
              </button>
            </div>
          </div>
        );

      case 'DOCUMENT':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
              <FileText className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Document PDF</h3>
              <p className="text-sm text-neutral-500 max-w-md mb-6">
                Cliquez sur le bouton ci-dessous pour ouvrir et consulter le document associé à cette leçon.
              </p>
              {activeLesson.document_url ? (
                <a 
                  href={activeLesson.document_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="rounded-xl bg-neutral-900 text-white px-6 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Ouvrir le document
                </a>
              ) : (
                <span className="text-sm text-red-500 font-medium">URL du document manquante</span>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={markAsComplete}
                disabled={submittingProgress || completedLessons.has(activeLesson.id)}
                className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {completedLessons.has(activeLesson.id) ? (
                  <><CheckCircle className="h-5 w-5" /> Terminée</>
                ) : (
                  'J\'ai lu ce document'
                )}
              </button>
            </div>
          </div>
        );

      case 'TEXT':
        return (
          <div className="space-y-8">
            <div className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-headings:text-neutral-900">
              {activeLesson.content?.split('\n').map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <div className="flex justify-end pt-6 border-t border-neutral-100">
              <button
                onClick={markAsComplete}
                disabled={submittingProgress || completedLessons.has(activeLesson.id)}
                className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {completedLessons.has(activeLesson.id) ? (
                  <><CheckCircle className="h-5 w-5" /> Terminée</>
                ) : (
                  'Marquer comme lue'
                )}
              </button>
            </div>
          </div>
        );

      case 'QUIZ':
        return (
          <div className="space-y-8">
            {quizResult ? (
              <div className={`rounded-2xl p-8 text-center ${quizResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full mb-4 ${quizResult.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {quizResult.passed ? <CheckCircle className="h-8 w-8" /> : <HelpCircle className="h-8 w-8" />}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${quizResult.passed ? 'text-green-800' : 'text-red-800'}`}>
                  {quizResult.passed ? 'Félicitations !' : 'Oups, encore un effort !'}
                </h3>
                <p className={`text-sm mb-6 ${quizResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                  Vous avez obtenu un score de <strong>{Math.round(quizResult.score)}%</strong>.
                </p>
                <button
                  onClick={() => setQuizResult(null)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ${quizResult.passed ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                  Recommencer le quiz
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {activeLesson.course_quiz_questions?.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                    Ce quiz n'a pas encore de questions.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeLesson.course_quiz_questions?.map((q: any, qIndex: number) => (
                      <div key={q.id} className="rounded-2xl bg-white border border-neutral-200 p-6 shadow-sm">
                        <h4 className="font-semibold text-neutral-900 mb-4">
                          {qIndex + 1}. {q.question}
                        </h4>
                        <div className="space-y-2">
                          {q.course_quiz_options?.map((opt: any) => (
                            <label 
                              key={opt.id} 
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                quizAnswers[q.id] === opt.id 
                                  ? 'border-brand-primary bg-brand-primary/5' 
                                  : 'border-neutral-200 hover:bg-neutral-50'
                              }`}
                            >
                              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                quizAnswers[q.id] === opt.id ? 'border-brand-primary' : 'border-neutral-300'
                              }`}>
                                {quizAnswers[q.id] === opt.id && <div className="h-2 w-2 rounded-full bg-brand-primary" />}
                              </div>
                              <span className="text-sm text-neutral-700">{opt.option_text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end">
                      <button
                        onClick={submitQuiz}
                        disabled={Object.keys(quizAnswers).length !== activeLesson.course_quiz_questions?.length}
                        className="flex items-center gap-2 rounded-xl bg-brand-primary px-8 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                      >
                        Valider mes réponses
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  const progressPercentage = Math.round((completedLessons.size / (allLessons.length || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex bg-white flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
        <Link href={`/dashboard/courses/${course.id}`} className="text-neutral-500 hover:text-neutral-900">
          <X className="h-6 w-6" />
        </Link>
        <span className="font-semibold text-sm line-clamp-1">{course.title}</span>
        <button onClick={() => setIsSidebarOpen(true)} className="text-neutral-500">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-neutral-50 border-r border-neutral-200 flex flex-col transition-transform transform lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-neutral-200 bg-white hidden lg:block">
          <Link href={`/dashboard/courses/${course.id}`} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-4 transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" /> Quitter le cours
          </Link>
          <h2 className="font-bold text-neutral-900 leading-tight mb-3">{course.title}</h2>
          
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-neutral-500">
              <span>Progression</span>
              <span className="text-brand-primary">{progressPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        </div>

        <div className="lg:hidden p-4 border-b border-neutral-200 flex justify-between items-center bg-white">
          <span className="font-bold">Programme</span>
          <button onClick={() => setIsSidebarOpen(false)}><X className="h-5 w-5 text-neutral-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-neutral-50">
          {modules.map((mod, mIndex) => (
            <div key={mod.id}>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Module {mIndex + 1} : {mod.title}
              </h3>
              <div className="space-y-1">
                {mod.course_lessons?.map((lesson: any, lIndex: number) => {
                  const isActive = activeLessonId === lesson.id;
                  const isCompleted = completedLessons.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => goToLesson(lesson.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                        isActive ? 'bg-white shadow-sm border border-neutral-200/60' : 'hover:bg-neutral-100/80 border border-transparent'
                      }`}
                    >
                      <div className={`flex items-center justify-center h-6 w-6 rounded-full shrink-0 ${
                        isCompleted ? 'bg-green-500 text-white' : 
                        isActive ? 'bg-brand-primary/10 text-brand-primary' : 'bg-neutral-200 text-neutral-500'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : (
                          lesson.type === 'VIDEO' ? <Video className="h-3 w-3" /> :
                          lesson.type === 'DOCUMENT' ? <FileText className="h-3 w-3" /> :
                          lesson.type === 'QUIZ' ? <HelpCircle className="h-3 w-3" /> :
                          <AlignLeft className="h-3 w-3" />
                        )}
                      </div>
                      <span className={`text-sm flex-1 line-clamp-2 ${isActive ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-600'}`}>
                        {lesson.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-white lg:overflow-hidden relative">
        {/* Top bar */}
        <div className="hidden lg:flex items-center px-8 py-4 border-b border-neutral-100 min-h-[72px]">
          <h1 className="text-xl font-bold text-neutral-900">{activeLesson?.title || 'Chargement...'}</h1>
        </div>

        {/* Lesson View */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-12 pb-32 lg:pb-12 max-w-4xl mx-auto w-full">
          <div className="lg:hidden mb-6">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1 block">
              {activeLesson?.moduleTitle}
            </span>
            <h1 className="text-2xl font-bold text-neutral-900">{activeLesson?.title}</h1>
          </div>

          {renderLessonContent()}
        </div>

        {/* Footer Navigation */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/80 backdrop-blur-xl p-4 lg:px-8 flex justify-between items-center z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => hasPrev && goToLesson(allLessons[activeLessonIndex - 1].id)}
            disabled={!hasPrev}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 disabled:opacity-30 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Précédent
          </button>
          
          <button
            onClick={() => hasNext && goToLesson(allLessons[activeLessonIndex + 1].id)}
            disabled={!hasNext}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 disabled:opacity-30 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Suivant <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
