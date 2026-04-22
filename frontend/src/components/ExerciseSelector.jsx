import { useState } from 'react';
import ExerciseDetailModal from './ExerciseDetailModal';

/**
 * ExerciseSelector Component
 * Bottom sheet style modal to select exercises grouped by muscle group.
 */
export default function ExerciseSelector({ isOpen, onClose, onSelect, exercises }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('Todos');
    const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    if (!isOpen) return null;

    const handleShowDetail = (e, ex) => {
        e.stopPropagation();
        setSelectedExerciseForDetail(ex);
        setIsDetailOpen(true);
    };

    // Group exercises by muscle group
    const groups = ['Todos', ...new Set(exercises.map(ex => ex.grupoMuscular).filter(Boolean))];

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = selectedGroup === 'Todos' || ex.grupoMuscular === selectedGroup;
        return matchesSearch && matchesGroup;
    });

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <div 
                    className="absolute inset-0" 
                    onClick={onClose}
                />
                
                <div className="relative w-full max-w-md bg-[#14141e] rounded-t-[32px] p-6 max-h-[85vh] overflow-hidden flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10 animate-[slideUp_0.3s_ease-out_forwards]">
                    
                    {/* Handle */}
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-['Syne'] font-extrabold text-2xl text-white">Ejercicios</h2>
                        <button onClick={onClose} className="text-white/40 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <input 
                            type="text"
                            placeholder="Buscar ejercicio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#e05c2a] transition-colors"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-3.5 w-5 h-5 text-white/30">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>

                    {/* Muscle Groups Chips */}
                    <div className="flex gap-3 overflow-x-auto pb-6 mb-2 no-scrollbar">
                        {groups.map(group => (
                            <button
                                key={group}
                                onClick={() => setSelectedGroup(group)}
                                className={`px-6 py-3 rounded-2xl text-[15px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                                    selectedGroup === group 
                                    ? 'bg-[#e05c2a] text-white shadow-xl shadow-[#e05c2a]/20' 
                                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                                }`}
                            >
                                {group}
                            </button>
                        ))}
                    </div>

                    {/* Exercise List */}
                    <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
                        <div className="grid grid-cols-1 gap-2">
                            {filteredExercises.map(ex => (
                                <div key={ex.id} className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            onSelect(ex);
                                            onClose();
                                        }}
                                        className="flex-1 flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all text-left group"
                                    >
                                        <div>
                                            <p className="font-semibold text-[#f5f0e8] group-hover:text-white transition-colors">{ex.nombre}</p>
                                            <p className="text-xs text-white/40 mt-0.5">{ex.grupoMuscular}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-[#e05c2a]/10 flex items-center justify-center text-[#e05c2a] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={(e) => handleShowDetail(e, ex)}
                                        className="w-12 h-[60px] rounded-2xl bg-white/5 flex items-center justify-center text-white/20 hover:text-[#6B7AFF] hover:bg-[#6B7AFF]/10 transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        {filteredExercises.length === 0 && (
                            <div className="py-12 text-center text-white/20">
                                <p>No se encontraron ejercicios</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ExerciseDetailModal 
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                exercise={selectedExerciseForDetail}
            />
        </>
    );
}
