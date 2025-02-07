import HeroSection from "@/components/HomeComps/HeroSection";
import TechnologiesSection from "@/components/HomeComps/TechnologiesSection";
import ProjectsSection from "@/components/HomeComps/ProjectsSection";
import PostsSection from "@/components/HomeComps/PostsSection";
import ContactSection from "@/components/ContactComp";
import Footer from "@/components/GlobalComp/Footer";
import Navbar from "@/components/GlobalComp/NavBar";
import "../css/globals.css";
import "../css/main.css";

const Home = () => {
  return (
    <div className="container">
      {/* Navigation bar */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="hero" className="min-h-screen w-full relative">
          <HeroSection />          
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
