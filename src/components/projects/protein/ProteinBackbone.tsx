import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './ProteinBackbone.css';

const NUM_SPHERES = 20;
const SPHERE_RADIUS = 0.3;
const SEGMENT_LENGTH = 1.2;

interface SpherePositions {
    straight: THREE.Vector3[];
    spiral: THREE.Vector3[];
}

function calculatePositions(): SpherePositions {
    const straight: THREE.Vector3[] = [];
    const spiral: THREE.Vector3[] = [];

    for (let i = 0; i < NUM_SPHERES; i++) {
        // Straight line along X-axis, centered
        const xOffset = (NUM_SPHERES - 1) * SEGMENT_LENGTH / 2;
        straight.push(new THREE.Vector3(i * SEGMENT_LENGTH - xOffset, 0, 0));

        // Spiral/helix shape
        const t = i / (NUM_SPHERES - 1);
        const angle = t * Math.PI * 4; // 2 full rotations
        const radius = 3;
        const height = (t - 0.5) * 10; // Vertical extent

        spiral.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        ));
    }

    return { straight, spiral };
}

function lerpVector3(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
    return new THREE.Vector3(
        a.x + (b.x - a.x) * t,
        a.y + (b.y - a.y) * t,
        a.z + (b.z - a.z) * t
    );
}

function updateCylinder(
    cylinder: THREE.Mesh,
    start: THREE.Vector3,
    end: THREE.Vector3
) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();

    // Position at midpoint
    cylinder.position.copy(start).add(end).multiplyScalar(0.5);

    // Scale to match distance
    cylinder.scale.set(1, length, 1);

    // Orient towards the end point
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize());
    cylinder.quaternion.copy(quaternion);
}

export function ProteinBackbone() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [morphValue, setMorphValue] = useState(0);
    const sceneDataRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        spheres: THREE.Mesh[];
        cylinders: THREE.Mesh[];
        positions: SpherePositions;
        animationId: number | null;
    } | null>(null);

    // Initialize Three.js scene
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
        camera.position.set(0, 5, 20);
        camera.lookAt(0, 0, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x6366f1, 1, 50);
        pointLight.position.set(-5, 5, 5);
        scene.add(pointLight);

        // Calculate positions
        const positions = calculatePositions();

        // Create spheres
        const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: 0x6366f1,
            metalness: 0.3,
            roughness: 0.4,
        });

        const spheres: THREE.Mesh[] = [];
        for (let i = 0; i < NUM_SPHERES; i++) {
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.copy(positions.straight[i]);
            scene.add(sphere);
            spheres.push(sphere);
        }

        // Create cylinders (connectors)
        const cylinderGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1, 16);
        const cylinderMaterial = new THREE.MeshStandardMaterial({
            color: 0x4f46e5,
            metalness: 0.2,
            roughness: 0.5,
        });

        const cylinders: THREE.Mesh[] = [];
        for (let i = 0; i < NUM_SPHERES - 1; i++) {
            const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            updateCylinder(cylinder, positions.straight[i], positions.straight[i + 1]);
            scene.add(cylinder);
            cylinders.push(cylinder);
        }

        // Animation loop
        let animationId: number | null = null;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // Gentle rotation
            scene.rotation.y += 0.003;

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

        sceneDataRef.current = {
            scene,
            camera,
            renderer,
            spheres,
            cylinders,
            positions,
            animationId,
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
            }
            renderer.dispose();
            container.removeChild(renderer.domElement);

            // Dispose geometries and materials
            sphereGeometry.dispose();
            sphereMaterial.dispose();
            cylinderGeometry.dispose();
            cylinderMaterial.dispose();
        };
    }, []);

    // Update positions based on slider
    useEffect(() => {
        const data = sceneDataRef.current;
        if (!data) return;

        const t = morphValue / 100;

        // Update sphere positions
        for (let i = 0; i < NUM_SPHERES; i++) {
            const newPos = lerpVector3(
                data.positions.straight[i],
                data.positions.spiral[i],
                t
            );
            data.spheres[i].position.copy(newPos);
        }

        // Update cylinder positions
        for (let i = 0; i < NUM_SPHERES - 1; i++) {
            updateCylinder(
                data.cylinders[i],
                data.spheres[i].position,
                data.spheres[i + 1].position
            );
        }
    }, [morphValue]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMorphValue(Number(e.target.value));
    };

    return (
        <div className="protein-backbone-container">
            <div ref={containerRef} className="protein-canvas" />
            <div className="protein-controls">
                <label className="protein-slider-label">
                    <span>Line</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={morphValue}
                        onChange={handleSliderChange}
                        className="protein-slider"
                    />
                    <span>Spiral</span>
                </label>
                <div className="morph-value">{morphValue}%</div>
            </div>
        </div>
    );
}
