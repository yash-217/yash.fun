import {
    AMINO_ACID_CATEGORIES,
    getAminoAcidsByCategory,
    type AminoAcid,
    type AminoAcidCategory,
} from '../../../data/aminoAcids';

interface AminoAcidSidebarProps {
    onSelect?: (aminoAcid: AminoAcid) => void;
    selectedCode?: string | null;
}

export function AminoAcidSidebar({ onSelect, selectedCode }: AminoAcidSidebarProps) {
    const groupedAminoAcids = getAminoAcidsByCategory();
    const categories = Object.keys(AMINO_ACID_CATEGORIES) as AminoAcidCategory[];

    const handleDragStart = (e: React.DragEvent, aminoAcid: AminoAcid) => {
        e.dataTransfer.setData('application/json', JSON.stringify(aminoAcid));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleClick = (aminoAcid: AminoAcid) => {
        onSelect?.(aminoAcid);
    };

    return (
        <div className="flex flex-col h-full bg-[#12121a] border-r border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">Amino Acids</h2>
                <p className="text-sm text-gray-400 mt-1">Drag to add or click to select</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {categories.map((category) => {
                    const categoryInfo = AMINO_ACID_CATEGORIES[category];
                    const aminoAcids = groupedAminoAcids[category];

                    if (aminoAcids.length === 0) return null;

                    return (
                        <div key={category} className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: categoryInfo.color }}
                                />
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {categoryInfo.label}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {aminoAcids.map((aa) => (
                                    <div
                                        key={aa.code}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, aa)}
                                        onClick={() => handleClick(aa)}
                                        className={`
                      group relative p-2 rounded-lg cursor-grab active:cursor-grabbing
                      transition-all duration-200 border
                      ${selectedCode === aa.code
                                                ? 'bg-white/10 border-white/20 ring-1 ring-white/30'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                style={{ backgroundColor: aa.color }}
                                            >
                                                {aa.symbol}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-white truncate">
                                                    {aa.code}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {aa.name}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tooltip */}
                                        <div className="
                      absolute left-full top-0 ml-2 z-50 w-48 p-3
                      bg-gray-900 border border-white/10 rounded-lg shadow-xl
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 pointer-events-none
                    ">
                                            <div className="font-medium text-white">{aa.name}</div>
                                            <div className="text-xs text-gray-400 mt-1">{aa.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
