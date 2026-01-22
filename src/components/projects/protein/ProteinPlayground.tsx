import { useRef, useCallback, useEffect, useState, createContext, useContext } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProteinStore } from '../../../stores/useProteinStore';
import { ResidueMesh, Bond } from './ResidueMesh';
import { AminoAcidSidebar } from './AminoAcidSidebar';
import type { AminoAcid } from '../../../data/aminoAcids';
import { StructureSearch } from './StructureSearch';

// Context for view lock state
const ViewLockContext = createContext<boolean>(false);

// Drop plane component for handling drag & drop
function DropPlane() {
    const planeRef = useRef<THREE.Mesh>(null);
    const { camera, raycaster, pointer } = useThree();
    const addResidue = useProteinStore((state) => state.addResidue);

    const handleDrop = useCallback((e: DragEvent) => {
        e.preventDefault();

        const data = e.dataTransfer?.getData('application/json');
        if (!data) return;

        try {
            const aminoAcid: AminoAcid = JSON.parse(data);

            // Get the canvas element and calculate normalized coordinates
            const canvas = e.target as HTMLCanvasElement;
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            // Update pointer and cast ray
            pointer.set(x, y);
            raycaster.setFromCamera(pointer, camera);

            if (planeRef.current) {
                const intersects = raycaster.intersectObject(planeRef.current);
                if (intersects.length > 0) {
                    const point = intersects[0].point;
                    addResidue(aminoAcid.code, [point.x, point.y, point.z]);
                } else {
                    // Fallback: add at origin if no intersection
                    addResidue(aminoAcid.code, [0, 0, 0]);
                }
            }
        } catch (err) {
            console.error('Failed to parse dropped data:', err);
        }
    }, [addResidue, camera, raycaster, pointer]);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'copy';
    }, []);

    useEffect(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        canvas.addEventListener('drop', handleDrop);
        canvas.addEventListener('dragover', handleDragOver);

        return () => {
            canvas.removeEventListener('drop', handleDrop);
            canvas.removeEventListener('dragover', handleDragOver);
        };
    }, [handleDrop, handleDragOver]);

    return (
        <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} visible={false}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
    );
}

// Scene content with OrbitControls that respects view lock
function Scene() {
    const { residues, selectedId, removeResidue, selectResidue } = useProteinStore();
    const isViewLocked = useContext(ViewLockContext);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedId) {
                    removeResidue(selectedId);
                }
            } else if (e.key === 'Escape') {
                selectResidue(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, removeResidue, selectResidue]);

    // Calculate bonds
    const bonds: { start: [number, number, number]; end: [number, number, number] }[] = [];
    for (const residue of residues) {
        if (residue.connectedTo) {
            const connected = residues.find(r => r.id === residue.connectedTo);
            if (connected) {
                bonds.push({
                    start: residue.position,
                    end: connected.position,
                });
            }
        }
    }

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 10]} intensity={1.2} />
            <pointLight position={[-10, 10, -10]} intensity={0.8} color="#8b5cf6" />
            <spotLight position={[0, 20, 0]} angle={0.3} penumbra={1} intensity={1} castShadow />

            {/* Drop plane for raycasting */}
            <DropPlane />

            {/* Residues */}
            {residues.map((residue) => (
                <ResidueMesh key={residue.id} residue={residue} />
            ))}

            {/* Bonds */}
            {bonds.map((bond, i) => (
                <Bond key={`bond-${i}`} start={bond.start} end={bond.end} />
            ))}

            {/* Controls - disabled when view is locked */}
            <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.05}
                enabled={!isViewLocked}
                enableRotate={!isViewLocked}
                enablePan={!isViewLocked}
                enableZoom={!isViewLocked}
            />
        </>
    );
}

// Header bar with navigation
function HeaderBar() {
    const { residues } = useProteinStore();

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a0a0f] to-transparent z-20 flex items-center px-8"
        >
            <Link
                to="/protein-folding"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 
                           text-gray-400 hover:text-white transition-all border border-white/5 backdrop-blur-md"
            >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-bold text-sm tracking-wide">EXIT</span>
            </Link>

            <div className="ml-8 h-10 w-px bg-white/10" />

            <div className="ml-8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span className="text-xl">🧬</span>
                </div>
                <div>
                    <h1 className="text-white font-black text-2xl tracking-tighter leading-tight uppercase">Protein Lab</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-500/80 text-[10px] uppercase tracking-widest font-black">
                            {residues.length === 0
                                ? 'Awaiting Sequence'
                                : `${residues.length} Active Chains`}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// UI Controls overlay with lock view toggle
function ControlsOverlay({
    onSearchClick,
    isViewLocked,
    onToggleViewLock
}: {
    onSearchClick: () => void;
    isViewLocked: boolean;
    onToggleViewLock: () => void;
}) {
    const { clearAll, residues, selectedId, removeResidue } = useProteinStore();

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
        >
            <div className="flex items-center gap-4 p-4 bg-[#0a0a0f]/90 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
                <button
                    onClick={onToggleViewLock}
                    className={`h-14 px-8 rounded-2xl transition-all flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em]
                        ${isViewLocked
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                        }`}
                >
                    {isViewLocked ? (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Locked</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                            </svg>
                            <span>Lock Cam</span>
                        </>
                    )}
                </button>

                <div className="w-px h-8 bg-white/10" />

                <button
                    onClick={onSearchClick}
                    disabled={residues.length < 3}
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 
                               hover:from-indigo-500 hover:to-purple-600 text-white 
                               font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3
                               disabled:opacity-10 disabled:grayscale transition-all
                               shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Analyze
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => selectedId && removeResidue(selectedId)}
                        disabled={!selectedId}
                        className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-orange-500/20 text-gray-500 hover:text-orange-400
                                   flex items-center justify-center disabled:opacity-5 transition-all border border-white/5 group"
                    >
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>

                    <button
                        onClick={clearAll}
                        disabled={residues.length === 0}
                        className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400
                                   flex items-center justify-center disabled:opacity-5 transition-all border border-white/5 group"
                    >
                        <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Property Inspector style info panel
function InfoOverlay({ isViewLocked }: { isViewLocked: boolean }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-24 right-8 z-10"
        >
            <div className={`bg-[#0a0a0f]/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] ring-1 ring-white/5 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isCollapsed ? 'w-16 h-16' : 'w-80'}`}>
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`absolute ${isCollapsed ? 'inset-0 items-center justify-center' : 'top-6 right-6 w-8 h-8 bg-white/5 hover:bg-white/10'} 
                               rounded-xl flex items-center justify-center text-gray-400 transition-all z-10 hover:text-white group`}
                >
                    <svg className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                    {isCollapsed && <span className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />}
                </button>

                {!isCollapsed && (
                    <div className="p-8 space-y-8 h-full overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                            <h3 className="text-white font-black uppercase tracking-[0.3em] text-[11px]">Core Terminal</h3>
                        </div>

                        {/* View Lock Status */}
                        <AnimatePresence>
                            {isViewLocked && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="flex items-center gap-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-200 text-xs font-bold ring-1 ring-amber-500/10"
                                >
                                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>EDIT MODE: CAM LOCKED</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Keyboard Shortcuts */}
                        <div className="space-y-4">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Quick Access</p>
                            <div className="space-y-3">
                                {[
                                    { label: 'Camera Lock', key: 'L' },
                                    { label: 'Delete Module', key: 'DEL' },
                                    { label: 'Safety Release', key: 'ESC' },
                                ].map(({ label, key }) => (
                                    <div key={key} className="flex justify-between items-center group">
                                        <span className="text-gray-400 text-xs font-bold group-hover:text-white transition-colors tracking-wide">{label}</span>
                                        <kbd className="min-w-[40px] h-8 flex items-center justify-center bg-white/5 rounded-xl text-[10px] font-black font-mono text-indigo-400 border border-white/10 shadow-inner group-hover:bg-indigo-500/20 transition-all">{key}</kbd>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Element color legend */}
                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Atomic Signature</p>
                            <div className="grid grid-cols-5 gap-4">
                                {[
                                    { el: 'C', color: '#909090' },
                                    { el: 'N', color: '#3050F8' },
                                    { el: 'O', color: '#FF0D0D' },
                                    { el: 'H', color: '#FFFFFF', border: true },
                                    { el: 'S', color: '#FFFF30' },
                                ].map(({ el, color, border }) => (
                                    <div key={el} className="flex flex-col items-center gap-2 group cursor-help">
                                        <div
                                            className="w-6 h-6 rounded-xl shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110"
                                            style={{ backgroundColor: color, border: border ? '1px solid #555' : '1px solid rgba(255,255,255,0.05)' }}
                                        />
                                        <span className="text-[9px] font-black text-gray-600 group-hover:text-indigo-400 transition-colors">{el}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Main component
export function ProteinPlayground() {
    const [showSearch, setShowSearch] = useState(false);
    const [isViewLocked, setIsViewLocked] = useState(false);

    // Keyboard shortcut for view lock (L key)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'l' || e.key === 'L') {
                setIsViewLocked(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex h-screen w-full bg-[#05050a] overflow-hidden">
            {/* Sidebar */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 flex-shrink-0 border-r border-white/5 bg-[#0a0a0f]/50 backdrop-blur-3xl z-30"
            >
                <AminoAcidSidebar />
            </motion.div>

            {/* 3D Canvas */}
            <div className="flex-1 relative">
                <ViewLockContext.Provider value={isViewLocked}>
                    <Canvas
                        camera={{ position: [15, 15, 15], fov: 60 }}
                        style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #05050a 100%)' }}
                        onPointerMissed={() => useProteinStore.getState().selectResidue(null)}
                    >
                        <Scene />
                    </Canvas>
                </ViewLockContext.Provider>

                <HeaderBar />
                <ControlsOverlay
                    onSearchClick={() => setShowSearch(true)}
                    isViewLocked={isViewLocked}
                    onToggleViewLock={() => setIsViewLocked(prev => !prev)}
                />
                <InfoOverlay isViewLocked={isViewLocked} />
            </div>

            {/* Structure Search Modal */}
            <AnimatePresence>
                {showSearch && <StructureSearch onClose={() => setShowSearch(false)} />}
            </AnimatePresence>
        </div>
    );
}


