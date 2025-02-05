import HeroSection from "@/components/HomeComps/HeroSection";
import TechnologiesSection from "@/components/HomeComps/TechnologiesSection";
import ProjectsSection from "@/components/HomeComps/ProjectsSection";
import PostsSection from "@/components/HomeComps/PostsSection";
import ContactSection from "@/components/ContactComp";
import Footer from "@/components/GlobalComp/Footer";
import Navbar from "@/components/GlobalComp/NavBar";
import { FaChevronDown } from "react-icons/fa";
import "../css/globals.css";
import "../css/main.css";

const Home = () => {
  // Función para desplazarse a la siguiente sección
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container">
      {/* Navigation bar */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="hero" className="min-h-screen w-full relative">
          <HeroSection />
          <button
            className="absolute left-1/2 bottom-12 text-3xl text-gray-700 dark:text-white animate-bounce transform -translate-x-1/2"
            onClick={() => scrollToSection("technologies")}
          >
            <FaChevronDown />
          </button>
        </section>

        {/* Technologies Section */}
        <section id="technologies" className="min-h-screen w-full relative">
          <TechnologiesSection />
        </section>

        {/* Projects Section */}
        <section id="projects" className="min-h-screen w-full relative">
          <ProjectsSection />
        </section>

        {/* Posts Section */}
        <section id="posts" className="min-h-screen w-full relative">
          <PostsSection />
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen w-full relative">
          <ContactSection />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
