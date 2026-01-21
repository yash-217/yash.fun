import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';
import { useProteinStore, type Residue } from '../../../stores/useProteinStore';
import { AMINO_ACIDS } from '../../../data/aminoAcids';

interface ResidueMeshProps {
    residue: Residue;
}

// Peptide bond length in angstroms (approximate C-alpha distance)
const BOND_DISTANCE = 3.8;
const SNAP_THRESHOLD = 5.0;

export function ResidueMesh({ residue }: ResidueMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();
    const [hovered, setHovered] = useState(false);

    const { selectedId, selectResidue, updateResidue, residues, connectResidues } = useProteinStore();
    const isSelected = selectedId === residue.id;

    // Get amino acid data for color
    const aminoAcid = AMINO_ACIDS.find(aa => aa.code === residue.type);
    const color = aminoAcid?.color ?? '#6366f1';

    // Drag handling
    const bind = useDrag(
        ({ active, movement: [mx, my], memo }) => {
            if (!meshRef.current) return memo;

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
        if (!meshRef.current) return;

        if (isSelected) {
            const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.1;
            meshRef.current.scale.setScalar(scale);
        } else {
            meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
        }
    });

    const handleClick = (e: { stopPropagation?: () => void }) => {
        e.stopPropagation?.();
        selectResidue(isSelected ? null : residue.id);
    };

    return (
        <mesh
            ref={meshRef}
            position={residue.position}
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            {...(bind() as any)}
        >
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial
                color={color}
                emissive={isSelected ? color : hovered ? color : '#000000'}
                emissiveIntensity={isSelected ? 0.4 : hovered ? 0.2 : 0}
                metalness={0.3}
                roughness={0.4}
            />
        </mesh>
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
