"use client";
import "@/styles/Technologies.css";

const technologies = [
  { name: "React", icon: "🔷" },
  { name: "Node", icon: "🟢" },
  { name: "JavaScript", icon: "🟡" },
  { name: "Python", icon: "🐍" },
  { name: "Java", icon: "☕" },
  { name: "Bases de Datos", icon: "🗄️" },
  { name: "Linux", icon: "🐧" },
  { name: "Git", icon: "🔧" },
  { name: "TypeScript", icon: "🔵" },
  { name: "Docker", icon: "🐳" },
  { name: "HTML", icon: "🟠" },
  { name: "CSS", icon: "🟦" },
  { name: "SQL", icon: "🔶" },
  { name: "Express", icon: "🟤" },
  { name: "Agile", icon: "🦅" },
  { name: "Scrum", icon: "🐌" },
  { name: "Kanban", icon: "🎴" },
  { name: "Testing", icon: "🧪" },
  { name: "Quality", icon: "🔍" },
];

const Technologies = () => (
  <section className="technologies-banner">
    <div className="marquee">
      {/* Duplicamos contenido para que el movimiento sea más fluido */}
      {[...technologies, ...technologies, ...technologies, ...technologies, ...technologies, ...technologies].map((tech, index) => (
        <div key={index} className="technology">
          <span className="technology-icon">{tech.icon}</span>
          {tech.name}
        </div>
      ))}
    </div>
  </section>
);



export default Technologies;