import React, { useState } from 'react';
import { FantasyButton, ParchmentPanel } from './ui';
import { ArrowLeft, Save, Plus, Trash2, Eye, Upload, CheckCircle } from 'lucide-react';
import { uploadQuiz, uploadImage } from '../lib/admin';
import { QuizUploadData } from '../lib/admin';
import { ImageUploader } from './ImageUploader';

type WizardStep = 'metadata' | 'questions' | 'images' | 'preview';

interface QuestionForm {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    xpReward: number;
}

export const QuizBuilder: React.FC<{ onBack: () => void; onSuccess: () => void }> = ({ onBack, onSuccess }) => {
    const [step, setStep] = useState<WizardStep>('metadata');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Quest metadata
    const [questId, setQuestId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [levelRequired, setLevelRequired] = useState(1);
    const [enemyName, setEnemyName] = useState('');
    const [enemyImage, setEnemyImage] = useState('');
    const [enemyMaxHp, setEnemyMaxHp] = useState(100);
    const [enemyAttackDamage, setEnemyAttackDamage] = useState(15);
    const [rewardXp, setRewardXp] = useState(300);
    const [narrativeIntro, setNarrativeIntro] = useState<string[]>(['']);
    const [narrativeOutro, setNarrativeOutro] = useState('');

    // Questions
    const [questions, setQuestions] = useState<QuestionForm[]>([
        { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', difficulty: 'Easy', xpReward: 50 }
    ]);

    const handleAddQuestion = () => {
        setQuestions([...questions, {
            text: '',
            options: ['', '', '', ''],
            correctIndex: 0,
            explanation: '',
            difficulty: 'Easy',
            xpReward: 50
        }]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, field: keyof QuestionForm, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
        const updated = [...questions];
        const options = [...updated[qIndex].options];
        options[optIndex] = value;
        updated[qIndex] = { ...updated[qIndex], options };
        setQuestions(updated);
    };

    const handleNarrativeChange = (index: number, value: string) => {
        const updated = [...narrativeIntro];
        updated[index] = value;
        setNarrativeIntro(updated);
    };

    const handleAddNarrative = () => {
        setNarrativeIntro([...narrativeIntro, '']);
    };

    const handleImageUpload = async (file: File) => {
        setLoading(true);
        setError(null);

        const result = await uploadImage(file, 'enemy-sprites', `enemy_${questId}`);

        if (result.success && result.url) {
            setEnemyImage(result.url);
        } else {
            setError(result.error || 'Failed to upload image');
        }

        setLoading(false);
    };

    const validateMetadata = (): boolean => {
        if (!questId.trim()) {
            setError('Quest ID is required');
            return false;
        }
        if (!title.trim()) {
            setError('Quest title is required');
            return false;
        }
        if (!enemyName.trim()) {
            setError('Enemy name is required');
            return false;
        }
        return true;
    };

    const validateQuestions = (): boolean => {
        if (questions.length === 0) {
            setError('At least one question is required');
            return false;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) {
                setError(`Question ${i + 1}: Text is required`);
                return false;
            }
            if (q.options.some(o => !o.trim())) {
                setError(`Question ${i + 1}: All options must be filled`);
                return false;
            }
            if (!q.explanation.trim()) {
                setError(`Question ${i + 1}: Explanation is required`);
                return false;
            }
        }

        return true;
    };

    const handlePublish = async () => {
        if (!validateMetadata() || !validateQuestions()) {
            return;
        }

        setLoading(true);
        setError(null);

        const quizData: QuizUploadData = {
            quest: {
                id: questId,
                title,
                description,
                levelRequired,
                narrativeIntro: narrativeIntro.filter(n => n.trim()),
                narrativeOutro,
                rewardXp,
                enemyName,
                enemyImage,
                enemyMaxHp,
                enemyAttackDamage,
            },
            questions: questions.map(q => ({
                text: q.text,
                options: q.options,
                correctIndex: q.correctIndex,
                explanation: q.explanation,
                difficulty: q.difficulty,
                xpReward: q.xpReward,
            }))
        };

        const result = await uploadQuiz(quizData);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || 'Failed to publish quiz');
        }

        setLoading(false);
    };

    const renderStepButtons = () => (
        <div className="flex gap-3 justify-between">
            <FantasyButton onClick={onBack} variant="secondary" size="sm">
                <ArrowLeft size={16} /> Cancel
            </FantasyButton>
            <div className="flex gap-2">
                {step === 'metadata' && (
                    <FantasyButton
                        onClick={() => {
                            setError(null);
                            if (validateMetadata()) setStep('questions');
                        }}
                        variant="tech"
                    >
                        Next: Questions
                    </FantasyButton>
                )}
                {step === 'questions' && (
                    <>
                        <FantasyButton onClick={() => setStep('metadata')} variant="secondary">Back</FantasyButton>
                        <FantasyButton
                            onClick={() => {
                                setError(null);
                                if (validateQuestions()) setStep('images');
                            }}
                            variant="tech"
                        >
                            Next: Images
                        </FantasyButton>
                    </>
                )}
                {step === 'images' && (
                    <>
                        <FantasyButton onClick={() => setStep('questions')} variant="secondary">Back</FantasyButton>
                        <FantasyButton onClick={() => setStep('preview')} variant="tech">
                            Preview
                        </FantasyButton>
                    </>
                )}
                {step === 'preview' && (
                    <>
                        <FantasyButton onClick={() => setStep('images')} variant="secondary">Back</FantasyButton>
                        <FantasyButton
                            onClick={handlePublish}
                            variant="primary"
                            disabled={loading}
                            icon={<Save size={16} />}
                        >
                            {loading ? 'Publishing...' : 'Publish Quest'}
                        </FantasyButton>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/95 z-[110] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-indigo-900 bg-indigo-950/50 flex items-center px-6 justify-between backdrop-blur-md">
                <h1 className="text-xl font-fantasy text-indigo-300 flex items-center gap-2">
                    <Upload className="text-indigo-500" />
                    Quest Builder Wizard
                    <span className="text-xs font-mono bg-indigo-900 text-indigo-400 px-2 py-0.5 rounded border border-indigo-700">
                        Step {['metadata', 'questions', 'images', 'preview'].indexOf(step) + 1}/4
                    </span>
                </h1>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-900">
                <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${((['metadata', 'questions', 'images', 'preview'].indexOf(step) + 1) / 4) * 100}%` }}
                />
            </div>

            {/* Error Display */}
            {error && (
                <div className="mx-6 mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Content */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Step 1: Metadata */}
                    {step === 'metadata' && (
                        <ParchmentPanel className="p-6 space-y-4">
                            <h2 className="text-2xl font-fantasy text-gold-400 mb-4">Quest Metadata</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Quest ID</label>
                                    <input
                                        className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                        value={questId}
                                        onChange={(e) => setQuestId(e.target.value)}
                                        placeholder="q_example"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Level Required</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                        value={levelRequired}
                                        onChange={(e) => setLevelRequired(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Quest Title</label>
                                <input
                                    className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="The Mysterious Bug"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Description</label>
                                <textarea
                                    className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none min-h-[80px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Quest description..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Enemy Name</label>
                                    <input
                                        className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                        value={enemyName}
                                        onChange={(e) => setEnemyName(e.target.value)}
                                        placeholder="Legacy Bugbear"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Enemy HP</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                        value={enemyMaxHp}
                                        onChange={(e) => setEnemyMaxHp(parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Enemy Damage</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                        value={enemyAttackDamage}
                                        onChange={(e) => setEnemyAttackDamage(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Reward XP</label>
                                <input
                                    type="number"
                                    className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                    value={rewardXp}
                                    onChange={(e) => setRewardXp(parseInt(e.target.value))}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">Narrative Intro (Dialogue Lines)</label>
                                {narrativeIntro.map((line, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input
                                            className="flex-grow bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                            value={line}
                                            onChange={(e) => handleNarrativeChange(i, e.target.value)}
                                            placeholder={`Line ${i + 1}`}
                                        />
                                    </div>
                                ))}
                                <FantasyButton onClick={handleAddNarrative} size="sm" variant="secondary">
                                    <Plus size={14} /> Add Line
                                </FantasyButton>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Narrative Outro</label>
                                <textarea
                                    className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none min-h-[60px]"
                                    value={narrativeOutro}
                                    onChange={(e) => setNarrativeOutro(e.target.value)}
                                    placeholder="Victory message..."
                                />
                            </div>
                        </ParchmentPanel>
                    )}

                    {/* Step 2: Questions */}
                    {step === 'questions' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-fantasy text-gold-400">Quest Questions</h2>
                                <FantasyButton onClick={handleAddQuestion} size="sm" icon={<Plus size={16} />}>
                                    Add Question
                                </FantasyButton>
                            </div>

                            {questions.map((q, qIndex) => (
                                <ParchmentPanel key={qIndex} className="p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-indigo-300">Question {qIndex + 1}</h3>
                                        {questions.length > 1 && (
                                            <button
                                                onClick={() => handleRemoveQuestion(qIndex)}
                                                className="text-red-400 hover:text-red-300 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Question Text</label>
                                        <textarea
                                            className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none min-h-[60px]"
                                            value={q.text}
                                            onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                            placeholder="What is...?"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex}>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">
                                                    Option {String.fromCharCode(65 + optIndex)}
                                                    {q.correctIndex === optIndex && <span className="text-green-400 ml-1">✓ Correct</span>}
                                                </label>
                                                <input
                                                    className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Correct Answer</label>
                                            <select
                                                className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                                value={q.correctIndex}
                                                onChange={(e) => handleQuestionChange(qIndex, 'correctIndex', parseInt(e.target.value))}
                                            >
                                                <option value={0}>A</option>
                                                <option value={1}>B</option>
                                                <option value={2}>C</option>
                                                <option value={3}>D</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Difficulty</label>
                                            <select
                                                className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                                value={q.difficulty}
                                                onChange={(e) => handleQuestionChange(qIndex, 'difficulty', e.target.value)}
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">XP Reward</label>
                                            <input
                                                type="number"
                                                className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                                                value={q.xpReward}
                                                onChange={(e) => handleQuestionChange(qIndex, 'xpReward', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Explanation</label>
                                        <textarea
                                            className="w-full bg-black border border-indigo-900/50 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none min-h-[60px]"
                                            value={q.explanation}
                                            onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                            placeholder="Explain the correct answer..."
                                        />
                                    </div>
                                </ParchmentPanel>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Images */}
                    {step === 'images' && (
                        <ParchmentPanel className="p-6 space-y-4">
                            <h2 className="text-2xl font-fantasy text-gold-400 mb-4">Enemy Sprite Upload</h2>

                            <ImageUploader
                                onUpload={handleImageUpload}
                                currentImage={enemyImage}
                                loading={loading}
                            />

                            {enemyImage && (
                                <div className="flex items-center gap-2 text-green-400 text-sm">
                                    <CheckCircle size={16} />
                                    Image uploaded successfully!
                                </div>
                            )}
                        </ParchmentPanel>
                    )}

                    {/* Step 4: Preview */}
                    {step === 'preview' && (
                        <ParchmentPanel className="p-6 space-y-4">
                            <h2 className="text-2xl font-fantasy text-gold-400 mb-4 flex items-center gap-2">
                                <Eye size={24} />
                                Quest Preview
                            </h2>

                            <div className="bg-black/50 p-4 rounded border border-indigo-900/30 space-y-3">
                                <div><span className="text-indigo-400 font-bold">ID:</span> {questId}</div>
                                <div><span className="text-indigo-400 font-bold">Title:</span> {title}</div>
                                <div><span className="text-indigo-400 font-bold">Description:</span> {description}</div>
                                <div><span className="text-indigo-400 font-bold">Level:</span> {levelRequired}</div>
                                <div><span className="text-indigo-400 font-bold">Enemy:</span> {enemyName} (HP: {enemyMaxHp}, DMG: {enemyAttackDamage})</div>
                                <div><span className="text-indigo-400 font-bold">Reward:</span> {rewardXp} XP</div>
                                <div><span className="text-indigo-400 font-bold">Questions:</span> {questions.length}</div>
                                {enemyImage && (
                                    <div>
                                        <span className="text-indigo-400 font-bold">Enemy Image:</span>
                                        <img src={enemyImage} alt="Enemy" className="mt-2 max-w-xs rounded border border-indigo-500" />
                                    </div>
                                )}
                            </div>
                        </ParchmentPanel>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-6">
                        {renderStepButtons()}
                    </div>
                </div>
            </div>
        </div>
    );
};
