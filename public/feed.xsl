<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>

  <xsl:template match="/rss/channel">
    <html lang="{language}">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="title"/></title>
        <style>
          :root { color-scheme: dark; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 2.5rem 1.25rem 4rem;
            background: hsl(222.2 84% 4.9%);
            color: hsl(210 40% 98%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
          }
          .wrap { max-width: 720px; margin: 0 auto; }
          .notice {
            border: 1px solid hsl(217.2 32.6% 17.5%);
            background: hsl(217.2 20% 17.5% / 0.35);
            border-radius: 0.75rem;
            padding: 1rem 1.25rem;
            font-size: 0.9rem;
            margin-bottom: 2.5rem;
          }
          .notice a { color: hsl(217.2 91.2% 59.8%); }
          h1 { font-size: 1.9rem; margin: 0 0 0.4rem; }
          .desc { color: hsl(210 40% 80%); margin: 0 0 2.5rem; }
          .item {
            border-bottom: 1px solid hsl(217.2 32.6% 17.5%);
            padding: 1.5rem 0;
          }
          .item:last-child { border-bottom: none; }
          .item h2 { font-size: 1.2rem; margin: 0 0 0.35rem; }
          .item h2 a { color: hsl(210 40% 98%); text-decoration: none; }
          .item h2 a:hover { color: hsl(217.2 91.2% 59.8%); }
          .item .date { font-size: 0.8rem; color: hsl(210 40% 70%); margin-bottom: 0.5rem; }
          .item p { margin: 0; color: hsl(210 40% 90%); }
        </style>
      </head>
      <body>
        <div class="wrap">
          <xsl:choose>
            <xsl:when test="language = 'en'">
              <div class="notice">
                📡 This is an RSS feed, meant for feed readers (Feedly, Inoreader, NetNewsWire...) — not for reading directly in a browser. Copy this page's URL into your feed reader to subscribe.
                <br/>
                <a href="{link}">Go to the blog →</a>
              </div>
            </xsl:when>
            <xsl:otherwise>
              <div class="notice">
                📡 Esto es un feed RSS, pensado para lectores de feeds (Feedly, Inoreader, NetNewsWire...), no para leerlo directamente en el navegador. Copia la URL de esta página en tu lector favorito para suscribirte.
                <br/>
                <a href="{link}">Ir al blog →</a>
              </div>
            </xsl:otherwise>
          </xsl:choose>

          <h1><xsl:value-of select="title"/></h1>
          <p class="desc"><xsl:value-of select="description"/></p>

          <xsl:for-each select="item">
            <div class="item">
              <div class="date"><xsl:value-of select="pubDate"/></div>
              <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
              <p><xsl:value-of select="description"/></p>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
