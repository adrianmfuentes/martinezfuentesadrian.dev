"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment, Float } from "@react-three/drei"
import * as THREE from "three"

interface HeroSectionProps {
  readonly dictionary: {
    readonly greeting: string
    readonly title: string
    readonly subtitle: string
    readonly cta: string
  }
  readonly lang: string
}

function TechModel({ position = [0, 0, 0], scale = 1 }) {
  const { scene } = useGLTF("/assets/RobotExpressive.glb")
  const ref = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <primitive ref={ref} object={scene} position={position} scale={scale} /> {/*NOSONAR*/}
    </Float>
  )
}

function TechSphere({ position = [0, 0, 0] }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const texture = useRef<THREE.Texture | null>(null)

  useEffect(() => {
    // Load the earth texture
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load("/assets/3d/texture_earth.jpg", (loadedTexture) => {
      texture.current = loadedTexture
      if (meshRef.current) {
        ;(meshRef.current.material as THREE.MeshStandardMaterial).map = loadedTexture
        ;(meshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true
      }
    })

    return () => {
      if (texture.current) {
        texture.current.dispose()
      }
    }
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={[position[0], position[1], position[2]]}> {/*NOSONAR*/}
      <sphereGeometry args={[1, 32, 32]} /> {/*NOSONAR*/}
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  )
}

function TechParticles({ count = 100 }) {
  const mesh = useRef<THREE.InstancedMesh>(null!)

  useEffect(() => {
    if (!mesh.current) return

    const dummy = new THREE.Object3D()
    const particles = []

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10
      const y = (Math.random() - 0.5) * 10
      const z = (Math.random() - 0.5) * 10

      particles.push({
        position: [x, y, z],
        scale: Math.random() * 0.2 + 0.05,
      })
    }

    particles.forEach((particle, i) => {
      dummy.position.set(particle.position[0], particle.position[1], particle.position[2])
      dummy.scale.set(particle.scale, particle.scale, particle.scale)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })

    mesh.current.instanceMatrix.needsUpdate = true
  }, [count])

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}> {/*NOSONAR*/}
      <sphereGeometry args={[1, 8, 8]} /> {/*NOSONAR*/}
      <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.5} transparent opacity={0.7} /> {/*NOSONAR*/}
    </instancedMesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} /> {/*NOSONAR*/}
      <pointLight position={[10, 10, 10]} intensity={1} /> {/*NOSONAR*/}
      <TechModel position={[0, -1, 0]} scale={1.5} />
      <TechSphere position={[-3, 2, -2]} />
      <TechSphere position={[3, -1, -1]} />
      <TechParticles count={50} />
      <Environment preset="city" />
    </>
  )
}

export function HeroSection({ dictionary, lang }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Scene />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl backdrop-blur-sm bg-background/30 p-8 rounded-lg">
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
