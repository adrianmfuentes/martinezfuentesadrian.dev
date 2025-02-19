import Introduction from "@/components/HomeComps/Introduction";
import Technologies from "@/components/HomeComps/Technologies";
import AboutMe from "@/components/HomeComps/AboutMe";
import Projects from "@/components/HomeComps/Projects";
import Posts from "@/components/HomeComps/Posts";
import Contact from "@/components/HomeComps/ContactComp";
import Footer from "@/components/GlobalComp/Footer";
import Navbar from "@/components/GlobalComp/NavBar";

import "../css/globals.css";
import "../css/main.css";
import "../css/Components/AboutMe.css";

const Home = () => {
  return (
    <div className="container">
      {/* Navigation bar */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="hero" className="min-h-screen w-full relative">
          <Introduction />          
        </section>

        {/* Technologies Section */}
        <section id="technologies" className="w-full relative">
          <Technologies />
        </section>

        {/* About me Section */}
        <section id="about-me" className="w-full relative">
          <AboutMe />
        </section>

        {/* Projects Section */}
        <section id="projects" className="min-h-screen w-full relative">
          <Projects />
        </section>

        {/* Posts Section */}
        <section id="posts" className="min-h-screen w-full relative">
          <Posts />
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen w-full relative">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
