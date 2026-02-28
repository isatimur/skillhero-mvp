
import React, { useState, useEffect } from 'react';
import { adminFetchAll, adminUpsert, adminDelete } from '../lib/supabase';
import { FantasyButton, ParchmentPanel } from './ui';
import { ArrowLeft, Save, Trash2, Plus, RefreshCw, Database, Search, Edit3, Check, X, Code } from 'lucide-react';

const TABLES = [
    { key: 'quests', label: 'Quests', icon: '⚔️' },
    { key: 'library_books', label: 'Books', icon: '📖' },
    { key: 'cosmetic_items', label: 'Items', icon: '🛡️' },
    { key: 'world_npcs', label: 'NPCs', icon: '🧙' },
    { key: 'questions', label: 'Questions', icon: '❓' },
    { key: 'hero_races', label: 'Races', icon: '🧬' },
    { key: 'hero_classes', label: 'Classes', icon: '⚔️' },
    { key: 'spells', label: 'Spells', icon: '🔥' },
    { key: 'skill_nodes', label: 'Skills', icon: '🌳' },
];

export const AdminScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeTable, setActiveTable] = useState('quests');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { loadTableData(); }, [activeTable]);

    const loadTableData = async () => {
        setLoading(true);
        setEditingItem(null);
        try {
            const res = await adminFetchAll(activeTable);
            setData(res || []);
        } catch (err: any) {
            setMessage({ text: `Failed: ${err.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingItem) return;
        try {
            // Attempt to parse JSON fields before saving
            const payload = { ...editingItem };
            Object.keys(payload).forEach(key => {
                const val = payload[key];
                if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
                    try { payload[key] = JSON.parse(val); } catch (e) {}
                }
            });

            await adminUpsert(activeTable, payload);
            setMessage({ text: 'Record Inscribed.', type: 'success' });
            loadTableData();
        } catch (err: any) {
            setMessage({ text: `Save Failed: ${err.message}`, type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this record? This action cannot be undone.")) return;
        try {
            await adminDelete(activeTable, id);
            setMessage({ text: 'Record Obliterated.', type: 'success' });
            loadTableData();
        } catch (err: any) {
            setMessage({ text: `Delete Failed: ${err.message}`, type: 'error' });
        }
    };

    const filteredData = data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col font-sans text-slate-200">
            {/* Top Bar */}
            <div className="h-16 border-b border-indigo-900 bg-indigo-950/50 flex items-center px-6 justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <FantasyButton onClick={onBack} size="sm" variant="secondary"><ArrowLeft size={16} /></FantasyButton>
                    <h1 className="text-xl font-fantasy text-indigo-300 flex items-center gap-2">
                        <Database className="text-indigo-500" /> 
                        Dungeon Master's Console 
                        <span className="text-xs font-mono bg-indigo-900 text-indigo-400 px-2 py-0.5 rounded border border-indigo-700">v2.0</span>
                    </h1>
                </div>
                {message && (
                    <div className={`px-4 py-1.5 rounded border text-xs font-mono animate-pop-in ${message.type === 'success' ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-red-900/50 border-red-500 text-red-300'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="flex flex-grow overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-[#0a0a0c] border-r border-indigo-900/30 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Database Tables</div>
                    {TABLES.map(t => (
                        <button 
                            key={t.key}
                            onClick={() => setActiveTable(t.key)}
                            className={`px-6 py-3 text-left flex items-center gap-3 transition-all border-r-2 ${activeTable === t.key ? 'bg-indigo-900/20 text-indigo-300 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'}`}
                        >
                            <span>{t.icon}</span>
                            <span className="font-fantasy tracking-wide">{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main View */}
                <div className="flex-grow flex bg-[#0f172a] relative">
                    <div className="absolute inset-0 bg-hex-pattern opacity-5 pointer-events-none"></div>
                    
                    {/* List Column */}
                    <div className="w-1/3 border-r border-indigo-900/30 flex flex-col bg-[#0a0a0c]/80 backdrop-blur">
                        <div className="p-4 border-b border-indigo-900/30 flex gap-2">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                                <input 
                                    className="w-full bg-black border border-indigo-900/50 rounded-md pl-9 pr-3 py-2 text-xs text-indigo-100 focus:border-indigo-500 focus:outline-none placeholder-slate-600 font-mono"
                                    placeholder="Query Records..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button onClick={() => setEditingItem({ id: `new_${Date.now()}` })} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow-lg transition-colors"><Plus size={16}/></button>
                            <button onClick={loadTableData} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors"><RefreshCw size={16}/></button>
                        </div>
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {loading ? <div className="text-center p-8 text-slate-500 text-xs font-mono">Fetching Data...</div> : filteredData.map((item, i) => (
                                <div 
                                    key={item.id || i}
                                    onClick={() => setEditingItem(item)}
                                    className={`p-3 rounded border cursor-pointer transition-all group ${editingItem?.id === item.id ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-900/50 border-transparent hover:border-slate-700'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-sm text-slate-200 group-hover:text-white truncate">{item.title || item.name || item.text || "Untitled"}</div>
                                        <code className="text-[10px] text-slate-600 font-mono">{item.id}</code>
                                    </div>
                                    <div className="text-[10px] text-slate-500 line-clamp-2 font-mono">{JSON.stringify(item)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Editor Column */}
                    <div className="w-2/3 flex flex-col bg-[#050505] relative">
                        {editingItem ? (
                            <>
                                <div className="p-4 border-b border-indigo-900/30 flex justify-between items-center bg-[#0a0a0c]">
                                    <div className="flex items-center gap-2">
                                        <Edit3 size={16} className="text-indigo-500" />
                                        <span className="font-mono text-sm text-indigo-300">Editing: {editingItem.id}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <FantasyButton onClick={() => handleDelete(editingItem.id)} variant="danger" size="sm" icon={<Trash2 size={14}/>}>Delete</FantasyButton>
                                        <FantasyButton onClick={handleSave} variant="tech" size="sm" icon={<Save size={14}/>}>Commit Changes</FantasyButton>
                                    </div>
                                </div>
                                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
                                    {Object.keys(editingItem).map(key => {
                                        const val = editingItem[key];
                                        const isJson = typeof val === 'object' && val !== null;
                                        const isLong = typeof val === 'string' && val.length > 60;

                                        return (
                                            <div key={key} className="group">
                                                <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1 font-mono tracking-wider flex items-center gap-2">
                                                    {key} {isJson && <Code size={10} />}
                                                </label>
                                                {isJson || isLong || key === 'description' ? (
                                                    <textarea 
                                                        className="w-full bg-[#0a0a0c] border border-indigo-900/30 rounded p-3 text-xs font-mono text-green-400 focus:border-indigo-500 outline-none min-h-[100px] leading-relaxed"
                                                        value={isJson ? JSON.stringify(val, null, 2) : val}
                                                        onChange={(e) => {
                                                            let newVal: any = e.target.value;
                                                            // If it was object, try to keep it valid JSON string in state for now
                                                            setEditingItem({...editingItem, [key]: newVal});
                                                        }}
                                                    />
                                                ) : (
                                                    <input 
                                                        type={typeof val === 'number' ? 'number' : 'text'}
                                                        className="w-full bg-[#0a0a0c] border border-indigo-900/30 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none font-mono"
                                                        value={val || ''}
                                                        onChange={(e) => setEditingItem({...editingItem, [key]: typeof val === 'number' ? parseFloat(e.target.value) : e.target.value})}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-slate-700">
                                <Database size={64} className="mb-4 opacity-20" />
                                <p className="font-fantasy text-xl">Select a Record to Inscribe</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
