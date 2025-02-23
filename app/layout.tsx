// app/layout.tsx
export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="es">
        <head>
          {/* Agregar el favicon */}
          <link rel="icon" href="/favicon.ico" />
          {/* Agregar el título del documento */}
          <title>Mi Sitio Web</title>
          {/* Agregar metadatos adicionales */}
          <meta name="description" content="Descripción de mi sitio web" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* Agregar Open Graph metadatos */}
          <meta property="og:title" content="Mi Sitio Web" />
          <meta property="og:description" content="Descripción de mi sitio web" />
          <meta property="og:image" content="/ruta/de/tu/imagen.jpg" />
          <meta property="og:url" content="http://localhost:3000/" />
        </head>
        <body>{children}</body>
      </html>
    );
  }
  