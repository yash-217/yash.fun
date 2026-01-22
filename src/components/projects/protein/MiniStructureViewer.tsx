import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    getAminoAcidStructure,
    ELEMENT_COLORS,
    ELEMENT_RADII,
    type ElementType,
} from '../../../data/aminoAcidAtoms';

interface MiniStructureViewerProps {
    aminoAcidCode: string;
    scale?: number;
    rotationSpeed?: number;
}

export function MiniStructureViewer({
    aminoAcidCode,
    scale = 0.35,
    rotationSpeed = 0.5
}: MiniStructureViewerProps) {
    const groupRef = useRef<THREE.Group>(null);
    const structure = getAminoAcidStructure(aminoAcidCode);

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * rotationSpeed;
        }
    });

    if (!structure) return null;

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Atoms */}
            {structure.atoms.map((atom, i) => (
                <mesh
                    key={`atom-${i}`}
                    position={[
                        atom.position[0] * scale,
                        atom.position[1] * scale,
                        atom.position[2] * scale,
                    ]}
                >
                    <sphereGeometry args={[ELEMENT_RADII[atom.element as ElementType] * 0.8, 12, 12]} />
                    <meshStandardMaterial
                        color={ELEMENT_COLORS[atom.element as ElementType]}
                        metalness={0.2}
                        roughness={0.6}
                    />
                </mesh>
            ))}

            {/* Bonds */}
            {structure.bonds.map((bond, i) => {
                const startAtom = structure.atoms[bond.from];
                const endAtom = structure.atoms[bond.to];
                if (!startAtom || !endAtom) return null;

                const start = new THREE.Vector3(...startAtom.position).multiplyScalar(scale);
                const end = new THREE.Vector3(...endAtom.position).multiplyScalar(scale);
                const midpoint = start.clone().add(end).multiplyScalar(0.5);
                const length = start.distanceTo(end);

                const direction = new THREE.Vector3().subVectors(end, start).normalize();
                const quaternion = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 1, 0),
                    direction
                );

                return (
                    <mesh key={`bond-${i}`} position={midpoint} quaternion={quaternion}>
                        <cylinderGeometry args={[0.04, 0.04, length, 6]} />
                        <meshStandardMaterial color="#555555" metalness={0.2} roughness={0.6} />
                    </mesh>
                );
            })}
        </group>
    );
}
