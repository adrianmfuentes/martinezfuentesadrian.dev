"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const generateNodes = (count: number, width: number, height: number) => {
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const spacingX = width / (columns + 1);
  const spacingY = height / (rows + 1);

  return Array.from({ length: count }, (_, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    return {
      id: i,
      x: (col + 0.5) * spacingX + (Math.random() - 0.5) * spacingX * 0.5, // Pequeño desplazamiento aleatorio
      y: (row + 0.5) * spacingY + (Math.random() - 0.5) * spacingY * 0.5,
    };
  });
};

const Fondo = () => {
  const [nodes, setNodes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [connections, setConnections] = useState<{ from: number; to: number }[]>([]);
  const [nodeConnections, setNodeConnections] = useState<Record<number, number[]>>({});
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (windowSize.width && windowSize.height) {
      const generatedNodes = generateNodes(25, windowSize.width, windowSize.height);
      setNodes(generatedNodes);
      setConnections([]);
      setNodeConnections({});
      setIsComplete(false);

      let connectionIndex = 0;
      const maxConnections = 40;
      const maxEdgesPerNode = 2;
      const interval = setInterval(() => {
        if (connectionIndex >= maxConnections) {
          setIsComplete(true);
          clearInterval(interval);
          return;
        }

        let from = Math.floor(Math.random() * generatedNodes.length);
        let to = Math.floor(Math.random() * generatedNodes.length);

        while (
          from === to ||
          (nodeConnections[from]?.length ?? 0) >= maxEdgesPerNode ||
          (nodeConnections[to]?.length ?? 0) >= maxEdgesPerNode ||
          connections.some((c) => (c.from === from && c.to === to) || (c.from === to && c.to === from))
        ) {
          from = Math.floor(Math.random() * generatedNodes.length);
          to = Math.floor(Math.random() * generatedNodes.length);
        }

        setConnections((prev) => [...prev, { from, to }]);

        setNodeConnections((prev) => ({
          ...prev,
          [from]: [...(prev[from] || []), to],
          [to]: [...(prev[to] || []), from],
        }));

        connectionIndex++;
      }, 500);

      return () => clearInterval(interval);
    }
  }, [windowSize]);

  useEffect(() => {
    if (isComplete) {
      let reverseIndex = connections.length - 1;
      const interval = setInterval(() => {
        if (reverseIndex < 0) {
          setIsComplete(false);
          setConnections([]);
          setNodeConnections({});
          clearInterval(interval);
          return;
        }

        setConnections((prev) => prev.slice(0, reverseIndex));
        reverseIndex--;
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isComplete, connections]);

  return (
    <motion.div
      className="absolute inset-0 -z-10 w-full h-full bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {windowSize.width && windowSize.height && (
        <svg className="w-full h-full" viewBox={`0 0 ${windowSize.width} ${windowSize.height}`}>
          {/* Líneas de conexión */}
          {connections.map(({ from, to }, i) => (
            <motion.line
              key={`line-${from}-${to}`}
              x1={nodes[from]?.x}
              y1={nodes[from]?.y}
              x2={nodes[to]?.x}
              y2={nodes[to]?.y}
              stroke="rgba(0, 255, 255, 0.6)"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{
                duration: 1.2,
                delay: i * 0.05,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Nodos con animación de brillo */}
          {nodes.map((node) => (
            <motion.circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r="5"
              fill="cyan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>
      )}
    </motion.div>
  );
};

export default Fondo;
