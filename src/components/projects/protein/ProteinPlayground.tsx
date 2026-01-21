import { useRef, useCallback, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useProteinStore } from '../../../stores/useProteinStore';
import { ResidueMesh, Bond } from './ResidueMesh';
import { AminoAcidSidebar } from './AminoAcidSidebar';
import type { AminoAcid } from '../../../data/aminoAcids';
import { StructureSearch } from './StructureSearch';

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

// Scene content
function Scene() {
    const { residues, selectedId, removeResidue, selectResidue } = useProteinStore();

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
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, 10, -10]} intensity={0.5} color="#6366f1" />

            {/* Grid */}
            <Grid
                args={[50, 50]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#1f2937"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#374151"
                fadeDistance={50}
                fadeStrength={1}
                infiniteGrid
            />

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

            {/* Controls */}
            <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        </>
    );
}

// UI Controls overlay
function ControlsOverlay({ onSearchClick }: { onSearchClick: () => void }) {
    const { clearAll, residues, selectedId, removeResidue } = useProteinStore();

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            <button
                onClick={onSearchClick}
                disabled={residues.length < 3}
                className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg 
                   border border-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                🔍 Find Similar
            </button>

            <button
                onClick={clearAll}
                disabled={residues.length === 0}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg 
                   border border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Clear All
            </button>

            <button
                onClick={() => selectedId && removeResidue(selectedId)}
                disabled={!selectedId}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg 
                   border border-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Delete Selected
            </button>

            <div className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg border border-white/10">
                Residues: {residues.length}
            </div>
        </div>
    );
}

// Info overlay
function InfoOverlay() {
    return (
        <div className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 text-sm text-gray-400 max-w-xs z-10">
            <p><strong className="text-white">Drag</strong> amino acids from the sidebar to add them.</p>
            <p className="mt-1"><strong className="text-white">Click</strong> to select a residue.</p>
            <p className="mt-1"><strong className="text-white">Drag</strong> residues to move them. They snap when close.</p>
            <p className="mt-1"><strong className="text-white">Delete</strong> key removes selected residue.</p>
        </div>
    );
}

// Main component
export function ProteinPlayground() {
    const [showSearch, setShowSearch] = useState(false);

    return (
        <div className="flex h-screen w-full bg-[#0a0a0f]">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
                <AminoAcidSidebar />
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 relative">
                <Canvas
                    camera={{ position: [15, 15, 15], fov: 60 }}
                    style={{ background: '#0a0a0f' }}
                    onPointerMissed={() => useProteinStore.getState().selectResidue(null)}
                >
                    <Scene />
                </Canvas>

                <ControlsOverlay onSearchClick={() => setShowSearch(true)} />
                <InfoOverlay />
            </div>

            {/* Structure Search Modal */}
            {showSearch && <StructureSearch onClose={() => setShowSearch(false)} />}
        </div>
    );
}
