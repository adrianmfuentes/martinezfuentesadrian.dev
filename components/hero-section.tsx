"use client"

import { useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import * as THREE from "three"
import { Canvas, useFrame, useThree  } from "@react-three/fiber"
import { OrbitControls, Points, PointMaterial } from "@react-three/drei"
import { useTheme } from "next-themes"

// Add after imports
const gridVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gridFragmentShader = `
  uniform float time;
  uniform vec2 resolution;
  uniform vec3 color;
  uniform vec3 secondaryColor;
  uniform float isDarkMode;
  varying vec2 vUv;
  
  float line(vec2 p, vec2 a, vec2 b, float width) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float d = length(pa - ba * h);
    return smoothstep(width, 0.0, d);
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 grid = fract(uv * 10.0);
    
    float gridLines = 0.0;
    for (float i = 0.0; i <= 10.0; i += 1.0) {
      float y = i / 10.0;
      float thickness = 0.02 * (0.5 + 0.5 * sin(time * 0.5 + i * 0.2));
      gridLines += smoothstep(thickness, 0.0, abs(uv.y - y));
    }
    
    for (float i = 0.0; i <= 10.0; i += 1.0) {
      float x = i / 10.0;
      float thickness = 0.02 * (0.5 + 0.5 * sin(time * 0.5 + i * 0.2));
      gridLines += smoothstep(thickness, 0.0, abs(uv.x - x));
    }
    
    float points = 0.0;
    for (float i = 0.0; i <= 10.0; i += 1.0) {
      for (float j = 0.0; j <= 10.0; j += 1.0) {
        vec2 point = vec2(i, j) / 10.0;
        float size = 0.03 * (0.5 + 0.5 * sin(time + i * 0.5 + j * 0.3));
        points += smoothstep(size, 0.0, length(uv - point));
      }
    }
    
    float diagonals = 0.0;
    for (float i = -5.0; i <= 5.0; i += 2.0) {
      vec2 start = vec2(0.0, 0.5 + i * 0.1 + 0.1 * sin(time * 0.2));
      vec2 end = vec2(1.0, 0.5 + i * 0.1 + 0.1 * sin(time * 0.2 + 1.0));
      diagonals += line(uv, start, end, 0.01);
      
      start = vec2(0.5 + i * 0.1 + 0.1 * sin(time * 0.3), 0.0);
      end = vec2(0.5 + i * 0.1 + 0.1 * sin(time * 0.3 + 1.0), 1.0);
      diagonals += line(uv, start, end, 0.01);
    }
    
    float alpha = gridLines * 0.3 + points * 0.7 + diagonals * 0.5;
    
    vec3 finalColor = mix(color, secondaryColor, 0.5 + 0.5 * sin(time * 0.2 + uv.x * 5.0 + uv.y * 5.0));
    
    if (isDarkMode > 0.5) {
      finalColor *= 0.8;
    } else {
      finalColor *= 1.2;
    }
    
    gl_FragColor = vec4(finalColor, alpha * 0.6);
  }
`;

interface HeroSectionProps {
  readonly dictionary: {
    readonly greeting: string
    readonly title: string
    readonly subtitle: string
    readonly cta: string
  }
  readonly lang: string
}

function TechGrid() {
  const materialRef = useRef<any>(null)
  const { theme } = useTheme()
  const { size } = useThree()

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value.set(size.width, size.height)
      materialRef.current.uniforms.isDarkMode.value = theme === "dark" ? 1.0 : 0.0
    }
  }, [size, theme])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime()
    }
  })

  return (
    <mesh position={[0, 0, -5]} scale={10}> {/* NOSONAR */}
      <planeGeometry args={[2, 2]} /> {/* NOSONAR */}
      
      <shaderMaterial   
        ref={materialRef}
        transparent
        vertexShader={gridVertexShader} 
        fragmentShader={gridFragmentShader}
        uniforms={{
          time: { value: 0 },
          resolution: { value: new THREE.Vector2(size.width, size.height) },
          color: { value: new THREE.Color("#3b82f6") },
          secondaryColor: { value: new THREE.Color("#60a5fa") },
          isDarkMode: { value: theme === "dark" ? 1.0 : 0.0 }
        }}
      />
    </mesh>
  )
}

function FloatingParticles({ count = 500 }) {
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 20
      positions[i3 + 1] = (Math.random() - 0.5) * 20
      positions[i3 + 2] = (Math.random() - 0.5) * 20
    }
    return positions
  }, [count])

  const pointsRef = useRef<THREE.Points>(null!)

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.05
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.08
    }
  })

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#60a5fa"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

function DataCubes({ count = 15 }) {
  const group = useRef<THREE.Group>(null!)
  const cubes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: Math.random() * 0.3 + 0.1,
      speed: Math.random() * 0.2 + 0.1,
    }))
  }, [count])

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.05

      // Update each cube
      group.current.children.forEach((cube, i) => {
        const speed = cubes[i].speed
        cube.rotation.x += 0.01 * speed
        cube.rotation.y += 0.01 * speed
        cube.rotation.z += 0.01 * speed

        // Pulse scale
        const s = cubes[i].scale * (1 + 0.1 * Math.sin(state.clock.getElapsedTime() * speed * 2))
        cube.scale.set(s, s, s)
      })
    }
  })

  return (
    <group ref={group}>
      {cubes.map((cube, i) => (
        <mesh key={i} position={cube.position as any} rotation={cube.rotation as any}> {/* NOSONAR */}
          <boxGeometry args={[1, 1, 1]} /> {/* NOSONAR */}
          <meshStandardMaterial
            color="#3b82f6"
            wireframe
            emissive="#3b82f6"
            emissiveIntensity={0.5} 
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} /> {/* NOSONAR */}
      <pointLight position={[10, 10, 10]} intensity={0.5} /> {/* NOSONAR */}
      <TechGrid />
      <FloatingParticles count={300} />
      <DataCubes count={10} />
    </>
  )
}

export function HeroSection({ dictionary, lang }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
          <Scene />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.2}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl backdrop-blur-md bg-background/30 p-8 rounded-lg border border-primary/20 shadow-lg">
          <p className="text-lg font-medium text-primary mb-2">{dictionary.greeting}</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-poppins">{dictionary.title}</h1>
          <h2 className="text-2xl md:text-3xl font-medium mb-6 text-foreground/80">{dictionary.subtitle}</h2>
          <Link href={`/${lang}/portfolio`}>
            <Button size="lg" className="group">
              {dictionary.cta}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
