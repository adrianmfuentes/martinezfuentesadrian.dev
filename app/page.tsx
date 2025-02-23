import Introduction from "@/components/Introduction";
import Technologies from "@/components/Technologies";
import { AboutMe } from "@/components/AboutMe";
import Projects from "@/components/Projects";
import Posts from "@/components/Posts";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";

import "@/styles/Globals.css";
import "@/styles/Main.css";

const Home = () => {
  console.log(AboutMe);
  return (
    <div className="container">
      {/* Navigation bar */}
      <Navbar />

      <main>
        {/* Introduction Section */}
        <Introduction />          

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
