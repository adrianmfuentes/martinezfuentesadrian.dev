import { motion } from "framer-motion";

const Posts = () => (
  <section className="mt-16">
    <h2 className="text-4xl font-semibold text-gray-900 dark:text-white text-center mb-8">
      📝 Últimos Posts
    </h2>
    
    <div className="mt-6 space-y-6">
      {[
        { title: "🚀 Next.js y SSR", desc: "Mejorando el performance de tu web", link: "#" },
        { title: "🔐 Autenticación con Supabase", desc: "Login fácil con Next.js", link: "#" },
        { title: "🎨 Animaciones con Framer Motion", desc: "Dale vida a tu UI", link: "#" }
      ].map((post, index) => (
        <motion.a
          key={index}
          href={post.link}
          className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="font-bold text-lg">{post.title}</h3>
          <p className="text-gray-500 dark:text-gray-300">{post.desc}</p>
        </motion.a>
      ))}
    </div>
  </section>
);

export default Posts;
