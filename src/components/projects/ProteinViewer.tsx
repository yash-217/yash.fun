import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { PDBLoader } from 'three/examples/jsm/loaders/PDBLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './ProteinViewer.css';

const PDB_URL = 'https://files.rcsb.org/download/1CRN.pdb';

// Element color mapping (CPK colors)
const ELEMENT_COLORS: Record<string, number> = {
    'C': 0x909090,  // Carbon - Dark Grey
    'O': 0xF00000,  // Oxygen - Red
    'N': 0x3050F8,  // Nitrogen - Blue
    'S': 0xFFFF30,  // Sulfur - Yellow
    'H': 0xFFFFFF,  // Hydrogen - White
};

const DEFAULT_COLOR = 0xFF00FF;
const ATOM_RADIUS = 0.3;
const BOND_RADIUS = 0.1;
const UNFOLDED_SPACING = 1.5;

interface ProteinViewerProps {
    progress?: number | MutableRefObject<number>;
}

export function ProteinViewer({ progress = 1 }: ProteinViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [atomCount, setAtomCount] = useState(0);

    // Animation data
    const foldedPositionsRef = useRef<THREE.Vector3[]>([]);
    const unfoldedPositionsRef = useRef<THREE.Vector3[]>([]);
    const atomsRef = useRef<THREE.Mesh[]>([]);
    const bondsRef = useRef<{ mesh: THREE.Mesh, startIndex: number, endIndex: number }[]>([]);

    // Internal ref to handle both number prop and ref prop
    const internalProgressRef = useRef(typeof progress === 'number' ? progress : 1);

    useEffect(() => {
        if (typeof progress === 'number') {
            internalProgressRef.current = progress;
        }
    }, [progress]);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f);

        // Camera
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(0, 0, 50);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false; // Disable zoom to allow page scrolling


        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x6366f1, 0.5, 100);
        pointLight.position.set(-10, -10, 10);
        scene.add(pointLight);

        // Group to hold all atoms and bonds
        const molecularGroup = new THREE.Group();
        scene.add(molecularGroup);

        // Shared geometries and materials
        const sphereGeometry = new THREE.SphereGeometry(ATOM_RADIUS, 16, 16);
        const cylinderGeometry = new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, 1, 8, 1);
        const bondMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.3,
            roughness: 0.4,
        });

        // Load PDB file
        const loader = new PDBLoader();
        loader.load(
            PDB_URL,
            (pdb) => {
                const { geometryAtoms, geometryBonds, json } = pdb;
                const positions = geometryAtoms.getAttribute('position');
                const atomData = json.atoms as Array<[number, string, string, string, number, number, number]>;

                console.log(`PDB Loaded: ${atomData.length} atoms`);

                // Clear refs
                foldedPositionsRef.current = [];
                unfoldedPositionsRef.current = [];
                atomsRef.current = [];
                bondsRef.current = [];

                // Center the molecule
                geometryAtoms.computeBoundingBox();
                const center = new THREE.Vector3();
                geometryAtoms.boundingBox?.getCenter(center);

                // Calculate unfolded center offset
                const totalLength = (atomData.length - 1) * UNFOLDED_SPACING;
                const unfoldedStartX = -totalLength / 2;

                // Create spheres for each atom
                for (let i = 0; i < atomData.length; i++) {
                    const [, element] = atomData[i];
                    const x = positions.getX(i) - center.x;
                    const y = positions.getY(i) - center.y;
                    const z = positions.getZ(i) - center.z;

                    // Store folded position
                    foldedPositionsRef.current.push(new THREE.Vector3(x, y, z));

                    // Calculate and store unfolded position (linear along X)
                    unfoldedPositionsRef.current.push(
                        new THREE.Vector3(unfoldedStartX + i * UNFOLDED_SPACING, 0, 0)
                    );

                    // Get color based on element
                    const color = ELEMENT_COLORS[element] ?? DEFAULT_COLOR;
                    const material = new THREE.MeshStandardMaterial({
                        color,
                        metalness: 0.2,
                        roughness: 0.6,
                    });

                    const atom = new THREE.Mesh(sphereGeometry, material);
                    atom.position.set(x, y, z);
                    molecularGroup.add(atom);
                    atomsRef.current.push(atom);
                }

                // Create sequential backbone connections (i to i+1)
                for (let i = 0; i < atomData.length - 1; i++) {
                    const cylinder = new THREE.Mesh(cylinderGeometry, bondMaterial);
                    molecularGroup.add(cylinder);

                    const start = foldedPositionsRef.current[i];
                    const end = foldedPositionsRef.current[i + 1];

                    if (start && end) {
                        cylinder.position.copy(start).lerp(end, 0.5);
                        cylinder.scale.set(1, start.distanceTo(end), 1);
                        cylinder.quaternion.setFromUnitVectors(
                            new THREE.Vector3(0, 1, 0),
                            new THREE.Vector3().subVectors(end, start).normalize()
                        );

                        bondsRef.current.push({
                            mesh: cylinder,
                            startIndex: i,
                            endIndex: i + 1
                        });
                    }
                }

                // Create bonds from PDB geometry
                if (geometryBonds) {
                    const bondPositions = geometryBonds.getAttribute('position');
                    console.log(`Found ${bondPositions.count / 2} bonds in geometry`);

                    let bondsCreated = 0;
                    for (let i = 0; i < bondPositions.count; i += 2) {
                        const startPos = new THREE.Vector3(
                            bondPositions.getX(i),
                            bondPositions.getY(i),
                            bondPositions.getZ(i)
                        );
                        const endPos = new THREE.Vector3(
                            bondPositions.getX(i + 1),
                            bondPositions.getY(i + 1),
                            bondPositions.getZ(i + 1)
                        );

                        // Find closest atom indices
                        let startIndex = -1;
                        let endIndex = -1;
                        let minStartDist = Infinity;
                        let minEndDist = Infinity;

                        const rawPositions = geometryAtoms.getAttribute('position');
                        for (let j = 0; j < atomData.length; j++) {
                            const atomPos = new THREE.Vector3(
                                rawPositions.getX(j),
                                rawPositions.getY(j),
                                rawPositions.getZ(j)
                            );

                            const startDist = startPos.distanceTo(atomPos);
                            if (startDist < minStartDist) {
                                minStartDist = startDist;
                                startIndex = j;
                            }

                            const endDist = endPos.distanceTo(atomPos);
                            if (endDist < minEndDist) {
                                minEndDist = endDist;
                                endIndex = j;
                            }
                        }

                        // Relaxed tolerance to 0.2 units
                        if (startIndex !== -1 && endIndex !== -1 && minStartDist < 0.2 && minEndDist < 0.2) {
                            if (startIndex === endIndex) continue;

                            const cylinder = new THREE.Mesh(cylinderGeometry, bondMaterial);
                            molecularGroup.add(cylinder);

                            // Initialize bond at folded position
                            const start = foldedPositionsRef.current[startIndex];
                            const end = foldedPositionsRef.current[endIndex];

                            cylinder.position.copy(start).lerp(end, 0.5);
                            cylinder.scale.set(1, start.distanceTo(end), 1);
                            cylinder.quaternion.setFromUnitVectors(
                                new THREE.Vector3(0, 1, 0),
                                new THREE.Vector3().subVectors(end, start).normalize()
                            );

                            bondsRef.current.push({
                                mesh: cylinder,
                                startIndex,
                                endIndex
                            });
                            bondsCreated++;
                        }
                    }
                    console.log(`Created ${bondsCreated} bond meshes`);
                } else {
                    console.warn('No geometryBonds found in PDB file');
                }

                // Add Bounding Box
                const bounds = new THREE.Box3().setFromPoints(foldedPositionsRef.current);
                const boundsSize = bounds.getSize(new THREE.Vector3());
                const boundsCenter = bounds.getCenter(new THREE.Vector3());

                // Add some padding
                boundsSize.addScalar(2);

                const boxGeo = new THREE.BoxGeometry(boundsSize.x, boundsSize.y, boundsSize.z);
                const edges = new THREE.EdgesGeometry(boxGeo);
                const boxMesh = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    opacity: 0.3,
                    transparent: true
                }));
                boxMesh.position.copy(boundsCenter);
                molecularGroup.add(boxMesh);

                setAtomCount(atomData.length);
                setLoading(false);

                // Adjust camera to fit molecule
                const box = new THREE.Box3().setFromObject(molecularGroup);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                camera.position.z = maxDim * 2.5;
                controls.update();
            },
            (progress) => {
                console.log('Loading PDB:', (progress.loaded / progress.total * 100).toFixed(1) + '%');
            },
            (err) => {
                console.error('Error loading PDB:', err);
                setError('Failed to load PDB file');
                setLoading(false);
            }
        );

        // Animation loop
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // Update positions based on progress
            let currentProgress = 1;
            if (typeof progress === 'number') {
                currentProgress = internalProgressRef.current;
            } else if (progress && 'current' in progress) {
                currentProgress = progress.current;
            }

            const folded = foldedPositionsRef.current;
            const unfolded = unfoldedPositionsRef.current;
            const atoms = atomsRef.current;
            const bonds = bondsRef.current;

            if (folded.length > 0 && unfolded.length > 0 && atoms.length === folded.length) {
                // Update atoms
                for (let i = 0; i < atoms.length; i++) {
                    const targetPos = new THREE.Vector3().lerpVectors(unfolded[i], folded[i], currentProgress);
                    atoms[i].position.copy(targetPos);
                }

                // Update bonds
                const up = new THREE.Vector3(0, 1, 0);
                for (let i = 0; i < bonds.length; i++) {
                    const { mesh, startIndex, endIndex } = bonds[i];
                    const start = atoms[startIndex].position;
                    const end = atoms[endIndex].position;

                    const distance = start.distanceTo(end);

                    // Position at midpoint
                    mesh.position.copy(start).lerp(end, 0.5);

                    // Scale length
                    mesh.scale.set(1, distance, 1);

                    // Orient
                    if (distance > 0.001) {
                        mesh.quaternion.setFromUnitVectors(
                            up,
                            new THREE.Vector3().subVectors(end, start).normalize()
                        );
                    }
                }
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            controls.dispose();
            renderer.dispose();
            container.removeChild(renderer.domElement);

            // Dispose geometries and materials
            sphereGeometry.dispose();
            cylinderGeometry.dispose();
            bondMaterial.dispose();
            molecularGroup.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material instanceof THREE.Material) {
                        child.material.dispose();
                    }
                }
            });
        };
    }, []);

    return (
        <div className="protein-viewer-container">
            <div ref={containerRef} className="protein-viewer-canvas" />

            {loading && (
                <div className="protein-viewer-loading">
                    <div className="loading-spinner" />
                    <span>Loading protein structure...</span>
                </div>
            )}

            {error && (
                <div className="protein-viewer-error">
                    <span>⚠️ {error}</span>
                </div>
            )}

            {!loading && !error && (
                <div className="protein-viewer-info">
                    <div className="info-item">
                        <span className="info-label">Protein:</span>
                        <span className="info-value">Crambin (1CRN)</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Atoms:</span>
                        <span className="info-value">{atomCount}</span>
                    </div>
                    <div className="color-legend">
                        <span className="legend-item"><span className="legend-dot carbon" /> C</span>
                        <span className="legend-item"><span className="legend-dot oxygen" /> O</span>
                        <span className="legend-item"><span className="legend-dot nitrogen" /> N</span>
                        <span className="legend-item"><span className="legend-dot sulfur" /> S</span>
                    </div>
                </div>
            )}
        </div>
    );
}
