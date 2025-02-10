import ProjectsSection from "@/components/HomeComps/ProjectsSection";
import PostsSection from "@/components/HomeComps/PostsSection";
import ContactSection from "@/components/ContactComp";
import Footer from "@/components/GlobalComp/Footer";
import Navbar from "@/components/GlobalComp/NavBar";
import "../css/globals.css";
import "../css/main.css";
import TechnologiesBanner from "@/components/HomeComps/TechnologiesBanner";
import IntroSection from "@/components/HomeComps/IntroSection";

const Home = () => {
  return (
    <div className="container">
      {/* Navigation bar */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="hero" className="min-h-screen w-full relative">
          <IntroSection />          
        </section>

        {/* Technologies Section */}
        <section id="technologies" className="w-full relative">
          <TechnologiesBanner />
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
