import { NextResponse } from "next/server"

export async function GET() {
  // This is a simple API route that returns information about available assets
  // In a real application, this could be used to dynamically list assets or provide metadata

  const assets = {
    "3d": [
      {
        name: "duck.glb",
        path: "/assets/3d/duck.glb",
        type: "3D Model",
        description: "3D model of a rubber duck used in the hero section",
      },
      {
        name: "texture_earth.jpg",
        path: "/assets/3d/texture_earth.jpg",
        type: "Texture",
        description: "Earth texture used for 3D spheres",
      },
    ],
    cv: [
      {
        name: "cv_en.pdf",
        path: "/assets/cv/cv_en.pdf",
        type: "Document",
        description: "English version of the CV",
      },
      {
        name: "cv_es.pdf",
        path: "/assets/cv/cv_es.pdf",
        type: "Document",
        description: "Spanish version of the CV",
      },
    ],
    projects: [
      {
        name: "project_1.jpg",
        path: "/assets/projects/project_1.jpg",
        type: "Image",
        description: "E-commerce Platform project thumbnail",
      },
      {
        name: "project_2.jpg",
        path: "/assets/projects/project_2.jpg",
        type: "Image",
        description: "Task Management App project thumbnail",
      },
      {
        name: "project_3.jpg",
        path: "/assets/projects/project_3.jpg",
        type: "Image",
        description: "Weather Forecast App project thumbnail",
      },
      {
        name: "project_4.jpg",
        path: "/assets/projects/project_4.jpg",
        type: "Image",
        description: "Data Visualization Dashboard project thumbnail",
      },
      {
        name: "project_5.jpg",
        path: "/assets/projects/project_5.jpg",
        type: "Image",
        description: "Personal Finance Tracker project thumbnail",
      },
      {
        name: "project_6.jpg",
        path: "/assets/projects/project_6.jpg",
        type: "Image",
        description: "Augmented Reality Game project thumbnail",
      },
    ],
  }

  return NextResponse.json(assets)
}
