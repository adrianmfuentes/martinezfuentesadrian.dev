export interface ProjectMetadata {
  id: string
  image: string
  tags: string[]
  projectUrl: string
  codeUrl: string
  imageFit?: "cover" | "contain"
  featured?: boolean
}

export const PROJECT_METADATA: ProjectMetadata[] = [
  {
    id: "6",
    image: "/images/svaes_logo_512.png",
    tags: ["Python", "FastAPI", "Angular", "Rust", "PostgreSQL"],
    projectUrl: "https://svaes.amfserver.duckdns.org/",
    codeUrl: "https://github.com/adrianmfuentes/SVAES",
    featured: true,
  },
  {
    id: "1",
    image: "/images/wichat.png",
    tags: ["React", "Node.js", "Express", "Oracle", "Docker", "GitHub", "Socket.io"],
    projectUrl: "",
    codeUrl: "https://github.com/Arquisoft/wichat_en2b",
  },
  {
    id: "2",
    image: "/images/DLP.png",
    tags: ["Java", "Compiler", "Design"],
    projectUrl: "https://novacode.amfserver.duckdns.org/",
    codeUrl: "https://github.com/adrianmfuentes/DLP",
  },
  {
    id: "3",
    image: "/images/SGDB.webp",
    tags: ["C++"],
    projectUrl: "",
    codeUrl: "https://github.com/adrianmfuentes/SGDB",
  },
  {
    id: "8",
    image: "/images/Server-HTTP.png",
    tags: ["C++", "Networking", "HTTP"],
    projectUrl: "",
    codeUrl: "https://github.com/adrianmfuentes/HTTP-server",
  },
  {
    id: "10",
    image: "/images/nutritionai.png",
    tags: ["Android", "Jetpack Compose", "Node.js", "PostgreSQL", "AI"],
    projectUrl: "",
    codeUrl: "https://github.com/adrianmfuentes/nutritionai",
  },
]
