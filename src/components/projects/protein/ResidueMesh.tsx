import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';
import { useProteinStore, type Residue } from '../../../stores/useProteinStore';
import { AMINO_ACIDS } from '../../../data/aminoAcids';
import {
    getAminoAcidStructure,
    ELEMENT_COLORS,
    ELEMENT_RADII,
    type ElementType
} from '../../../data/aminoAcidAtoms';

interface ResidueMeshProps {
    residue: Residue;
}

// Peptide bond length in angstroms (approximate C-alpha distance)
const BOND_DISTANCE = 3.8;
const SNAP_THRESHOLD = 5.0;
const STRUCTURE_SCALE = 0.5; // Scale factor for the atomic structure
const BOND_RADIUS = 0.06;

// Individual atom sphere component
function AtomSphere({
    element,
    position,
    isSelected,
    isHovered
}: {
    element: ElementType;
    position: [number, number, number];
    isSelected: boolean;
    isHovered: boolean;
}) {
    const color = ELEMENT_COLORS[element];
    const radius = ELEMENT_RADII[element];

    return (
        <mesh position={position}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshStandardMaterial
                color={color}
                emissive={isSelected ? color : isHovered ? color : '#000000'}
                emissiveIntensity={isSelected ? 0.4 : isHovered ? 0.2 : 0}
                metalness={0.2}
                roughness={0.6}
            />
        </mesh>
    );
}

// Bond between atoms
function AtomBond({
    start,
    end
}: {
    start: [number, number, number];
    end: [number, number, number];
}) {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const midpoint = startVec.clone().add(endVec).multiplyScalar(0.5);
    const length = startVec.distanceTo(endVec);

    const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
    );

    return (
        <mesh position={midpoint} quaternion={quaternion}>
            <cylinderGeometry args={[BOND_RADIUS, BOND_RADIUS, length, 8]} />
            <meshStandardMaterial
                color="#666666"
                metalness={0.2}
                roughness={0.6}
            />
        </mesh>
    );
}

export function ResidueMesh({ residue }: ResidueMeshProps) {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    const [hovered, setHovered] = useState(false);

    const { selectedId, selectResidue, updateResidue, residues, connectResidues } = useProteinStore();
    const isSelected = selectedId === residue.id;

    // Get amino acid info for caption
    const aminoAcidInfo = useMemo(() => {
        return AMINO_ACIDS.find(aa => aa.code === residue.type);
    }, [residue.type]);

    // Get atomic structure for this amino acid
    const structure = useMemo(() => getAminoAcidStructure(residue.type), [residue.type]);

    // Calculate scaled positions for atoms
    const scaledAtoms = useMemo(() => {
        if (!structure) return [];
        return structure.atoms.map(atom => ({
            element: atom.element,
            position: atom.position.map(p => p * STRUCTURE_SCALE) as [number, number, number],
            label: atom.label,
        }));
    }, [structure]);

    // Calculate bond positions
    const scaledBonds = useMemo(() => {
        if (!structure || scaledAtoms.length === 0) return [];
        return structure.bonds
            .filter(bond => bond.from < scaledAtoms.length && bond.to < scaledAtoms.length)
            .map(bond => ({
                start: scaledAtoms[bond.from].position,
                end: scaledAtoms[bond.to].position,
            }));
    }, [structure, scaledAtoms]);

    // Drag handling
    const bind = useDrag(
        ({ active, movement: [mx, my], memo }) => {
            if (!groupRef.current) return memo;

            // Store initial position on drag start
            if (!memo) {
                memo = {
                    initialPos: [...residue.position] as [number, number, number],
                };
            }

            // Convert screen movement to world coordinates (simplified)
            const factor = camera.position.z * 0.01;
            const newX = memo.initialPos[0] + mx * factor;
            const newY = memo.initialPos[1] - my * factor;
            const newZ = memo.initialPos[2];

            updateResidue(residue.id, {
                position: [newX, newY, newZ],
            });

            // Check for snapping when dragging ends
            if (!active) {
                // Find nearby residues to snap to
                const currentPos = new THREE.Vector3(newX, newY, newZ);
                let closestDistance = Infinity;
                let closestResidue: Residue | null = null;

                for (const other of residues) {
                    if (other.id === residue.id) continue;
                    if (other.connectedTo === residue.id) continue; // Already connected

                    const otherPos = new THREE.Vector3(...other.position);
                    const distance = currentPos.distanceTo(otherPos);

                    if (distance < SNAP_THRESHOLD && distance < closestDistance) {
                        closestDistance = distance;
                        closestResidue = other;
                    }
                }

                // Snap to closest residue if within threshold
                if (closestResidue) {
                    const otherPos = new THREE.Vector3(...closestResidue.position);
                    const direction = currentPos.clone().sub(otherPos).normalize();
                    const snappedPos = otherPos.clone().add(direction.multiplyScalar(BOND_DISTANCE));

                    updateResidue(residue.id, {
                        position: [snappedPos.x, snappedPos.y, snappedPos.z],
                    });

                    // Create connection
                    connectResidues(closestResidue.id, residue.id);
                }
            }

            return memo;
        },
        {
            filterTaps: true,
            pointer: { capture: false },
        }
    );

    // Gentle pulsing for selected residue
    useFrame(({ clock }) => {
        if (!groupRef.current) return;

        if (isSelected) {
            const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.1;
            groupRef.current.scale.setScalar(scale);
        } else {
            groupRef.current.scale.setScalar(hovered ? 1.1 : 1);
        }
    });

    const handleClick = (e: { stopPropagation?: () => void }) => {
        e.stopPropagation?.();
        selectResidue(isSelected ? null : residue.id);
    };

    // Fallback to single sphere if no structure data
    if (!structure || scaledAtoms.length === 0) {
        return (
            <mesh
                position={residue.position}
                onClick={handleClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                {...(bind() as any)}
            >
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial
                    color="#6366f1"
                    emissive={isSelected ? '#6366f1' : hovered ? '#6366f1' : '#000000'}
                    emissiveIntensity={isSelected ? 0.4 : hovered ? 0.2 : 0}
                    metalness={0.3}
                    roughness={0.4}
                />
            </mesh>
        );
    }

    return (
        <group
            ref={groupRef}
            position={residue.position}
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            {...(bind() as any)}
        >
            {/* Render bonds first (below atoms) */}
            {scaledBonds.map((bond, i) => (
                <AtomBond key={`bond-${i}`} start={bond.start} end={bond.end} />
            ))}

            {/* Render atoms */}
            {scaledAtoms.map((atom, i) => (
                <AtomSphere
                    key={`atom-${i}`}
                    element={atom.element}
                    position={atom.position}
                    isSelected={isSelected}
                    isHovered={hovered}
                />
            ))}

            {/* Selection indicator - bounding sphere */}
            {isSelected && (
                <mesh>
                    <sphereGeometry args={[1.5, 16, 16]} />
                    <meshBasicMaterial
                        color="#6366f1"
                        transparent
                        opacity={0.1}
                        wireframe
                    />
                </mesh>
            )}

            {/* Hover caption */}
            {(hovered || isSelected) && aminoAcidInfo && (
                <Html
                    position={[0, 1.8, 0]}
                    center
                    distanceFactor={15}
                    style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    <div
                        style={{
                            background: isSelected
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.95))'
                                : 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(8px)',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            border: isSelected ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                            boxShadow: isSelected
                                ? '0 8px 32px rgba(99, 102, 241, 0.4)'
                                : '0 4px 20px rgba(0, 0, 0, 0.5)',
                            whiteSpace: 'nowrap',
                            transform: 'translateY(-10px)',
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            {/* Symbol badge */}
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: `linear-gradient(135deg, ${aminoAcidInfo.color}, ${aminoAcidInfo.color}99)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    color: 'white',
                                    boxShadow: `0 2px 8px ${aminoAcidInfo.color}60`,
                                }}
                            >
                                {aminoAcidInfo.symbol}
                            </div>
                            {/* Info */}
                            <div>
                                <div style={{
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    color: 'white',
                                    marginBottom: '2px'
                                }}>
                                    {aminoAcidInfo.name}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: 'rgba(255, 255, 255, 0.6)'
                                }}>
                                    {aminoAcidInfo.code} • {aminoAcidInfo.category}
                                </div>
                            </div>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// Bond component to render connections between residues
interface BondProps {
    start: [number, number, number];
    end: [number, number, number];
}

export function Bond({ start, end }: BondProps) {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const midpoint = startVec.clone().add(endVec).multiplyScalar(0.5);
    const length = startVec.distanceTo(endVec);

    // Calculate rotation to point from start to end
    const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
    );

    return (
        <mesh position={midpoint} quaternion={quaternion}>
            <cylinderGeometry args={[0.15, 0.15, length, 8]} />
            <meshStandardMaterial
                color="#4b5563"
                metalness={0.2}
                roughness={0.6}
            />
        </mesh>
    );
}
