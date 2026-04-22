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
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="w-6 h-6">
                                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
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
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="absolute left-3 top-3.5 w-5 h-5 text-white/30">
                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
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
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="w-4 h-4">
                                                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                                            </svg>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={(e) => handleShowDetail(e, ex)}
                                        className="w-12 h-[60px] rounded-2xl bg-white/5 flex items-center justify-center text-white/20 hover:text-[#6B7AFF] hover:bg-[#6B7AFF]/10 transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="w-6 h-6">
                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v32A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
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
