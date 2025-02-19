import { motion } from "framer-motion";
import "@/css/Components/Posts.css";

const posts = [
  { title: "🚀 Next.js y SSR", desc: "Mejorando el performance de tu web", link: "#" },
  { title: "🔐 Autenticación con Supabase", desc: "Login fácil con Next.js", link: "#" },
  { title: "🎨 Animaciones con Framer Motion", desc: "Dale vida a tu UI", link: "#" }
];

const Posts = () => {
  return (
    <section className="posts-section">
      <motion.h2
        className="posts-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        📝 Últimos Posts
      </motion.h2>
      <div className="posts-list">
        {posts.map((post, index) => (
          <motion.a
            key={index}
            href={post.link}
            className="post-card"
            whileHover={{ scale: 1.02, x: 5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <h3 className="post-title">{post.title}</h3>
            <p className="post-desc">{post.desc}</p>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default Posts;
