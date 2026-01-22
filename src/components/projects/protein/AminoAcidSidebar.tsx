import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import {
    AMINO_ACID_CATEGORIES,
    getAminoAcidsByCategory,
    type AminoAcid,
    type AminoAcidCategory,
} from '../../../data/aminoAcids';
import { MiniStructureViewer } from './MiniStructureViewer';

interface AminoAcidSidebarProps {
    onSelect?: (aminoAcid: AminoAcid) => void;
    selectedCode?: string | null;
}

// Category icons (SVG) with cleaner lines
const CATEGORY_ICONS: Record<AminoAcidCategory, React.ReactNode> = {
    simple: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>,
    hydrocarbon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.308a1 1 0 01-1.147-.142L8 13l-1.557-1.557a1 1 0 01-.142-1.147l.308-.618a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-.547-1.022L6 2" /></svg>,
    hydroxyl: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9c1.657 0 3 4.03 3 9s-1.343 9-3 9m0-18c-1.657 0-3 4.03-3 9s1.343 9 3 9" /></svg>,
    sulfur: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    acidic: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    basic: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    amide: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    cyclic: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    aromatic: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
};

export function AminoAcidSidebar({ onSelect, selectedCode }: AminoAcidSidebarProps) {
    const groupedAminoAcids = getAminoAcidsByCategory();
    const categories = Object.keys(AMINO_ACID_CATEGORIES) as AminoAcidCategory[];
    const [expandedCategories, setExpandedCategories] = useState<Set<AminoAcidCategory>>(
        new Set(categories)
    );
    const [searchQuery, setSearchQuery] = useState('');

    const handleSelect = (aa: AminoAcid) => {
        onSelect?.(aa);
    };

    const handleDragStart = (e: React.DragEvent, aminoAcid: AminoAcid) => {
        e.dataTransfer.setData('application/json', JSON.stringify(aminoAcid));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const toggleCategory = (category: AminoAcidCategory) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    const filterAminoAcids = (aminoAcids: AminoAcid[]) => {
        if (!searchQuery.trim()) return aminoAcids;
        const query = searchQuery.toLowerCase();
        return aminoAcids.filter(aa =>
            aa.name.toLowerCase().includes(query) ||
            aa.code.toLowerCase().includes(query) ||
            aa.symbol.toLowerCase().includes(query)
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#05050a] overflow-hidden select-none">
            {/* Header / Title */}
            <div className="pt-8 px-6 pb-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.308a1 1 0 01-1.147-.142L8 13l-1.557-1.557a1 1 0 01-.142-1.147l.308-.618a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-.547-1.022L6 2" />
                        </svg>
                    </div>
                    <div className="flex-1 ml-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Library</h2>
                        <p className="text-[10px] text-indigo-400/60 uppercase tracking-[0.2em] font-black">Modules Available</p>
                    </div>
                </div>

                {/* Search Console */}
                <div className="relative group">
                    <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="SEARCH SEQUENCE..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 text-xs font-bold text-white placeholder:text-gray-700 focus:bg-white/10 transition-all outline-none uppercase tracking-widest"
                    />
                </div>
            </div>

            {/* Scrollable Categories */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6 scrollbar-hide">
                {categories.map((category) => {
                    const categoryInfo = AMINO_ACID_CATEGORIES[category];
                    const filteredAA = filterAminoAcids(groupedAminoAcids[category] || []);
                    if (filteredAA.length === 0) return null;

                    const isExpanded = expandedCategories.has(category);

                    return (
                        <div key={category} className="space-y-4">
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between group px-2"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 bg-white/5 group-hover:bg-white/10 transition-colors"
                                        style={{ color: categoryInfo.color }}
                                    >
                                        {CATEGORY_ICONS[category]}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-gray-300 transition-colors">
                                        {categoryInfo.label}
                                    </span>
                                </div>
                                <svg
                                    className={`w-4 h-4 text-gray-700 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="grid grid-cols-1 gap-3 overflow-hidden"
                                    >
                                        {filteredAA.map((aa) => (
                                            <motion.div
                                                key={aa.code}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e as any, aa)}
                                                onClick={() => handleSelect(aa)}
                                                whileHover={{ y: -4, scale: 1.02 }}
                                                className={`
                                                    relative h-24 p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 cursor-grab active:cursor-grabbing group
                                                    hover:border-indigo-500/40 transition-colors overflow-hidden flex items-center
                                                    ${selectedCode === aa.code ? 'border-indigo-500 bg-indigo-500/5' : ''}
                                                `}
                                            >
                                                {/* Left: Symbol & Name */}
                                                <div className="flex-1 flex items-center gap-4">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border border-white/5 bg-white/5 shadow-inner"
                                                        style={{ color: categoryInfo.color }}
                                                    >
                                                        {aa.symbol}
                                                    </div>

                                                    <div className="space-y-0.5">
                                                        <div className="text-white font-black text-xs uppercase tracking-tight">{aa.name}</div>
                                                        <div className="text-[9px] font-black text-indigo-400/40 uppercase tracking-[0.2em]">Active Module</div>
                                                    </div>
                                                </div>

                                                {/* Right: 3D Preview */}
                                                <div className="w-24 h-full relative -mr-4 pointer-events-none">
                                                    <Canvas
                                                        camera={{ position: [0, 0, 5], fov: 40 }}
                                                        style={{ background: 'transparent' }}
                                                    >
                                                        <ambientLight intensity={0.8} />
                                                        <pointLight position={[5, 5, 5]} intensity={1} />
                                                        <MiniStructureViewer aminoAcidCode={aa.code} scale={0.6} />
                                                    </Canvas>
                                                </div>

                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-3 h-3 text-indigo-500/30" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5 4a1 1 0 00-2 0v12a1 1 0 002 0V4zM9 4a1 1 0 00-2 0v12a1 1 0 002 0V4zM13 4a1 1 0 00-2 0v12a1 1 0 002 0V4zM17 4a1 1 0 00-2 0v12a1 1 0 002 0V4z" />
                                                    </svg>
                                                </div>

                                                {/* Decorative background glow on hover */}
                                                <div
                                                    className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                                                    style={{ backgroundColor: categoryInfo.color }}
                                                />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
