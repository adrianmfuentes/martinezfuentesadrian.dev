---
title: "Por qué mi portfolio tiene una sección de herramientas de seguridad"
description: "Comprobadores de contraseñas, escáneres de puertos y validadores de cabeceras no son lo habitual en un portfolio — aquí explico por qué los construí igualmente."
date: "2026-06-20"
tags: ["Seguridad", "Next.js", "Portfolio"]
---

La mayoría de los portfolios son una cuadrícula de proyectos y un formulario de contacto. El mío también tiene eso, pero además tiene una sección `/tools` con un escáner de puertos, un validador de cabeceras HTTP, un comprobador de fortaleza de contraseñas y algunas otras utilidades de seguridad. Eso no fue casualidad.

## Demostrar, no solo decir

Cualquiera puede escribir "interesado en ciberseguridad" en un CV. Es una señal mucho más fuerte construir una herramienta que valide de verdad las cabeceras de seguridad HTTP de un objetivo real, o que escanee los puertos abiertos de un host dentro de las limitaciones del modelo CORS del navegador. Te obliga a entender de verdad lo que dices saber, casos límite incluidos.

## Las restricciones mejoraron las herramientas

Construir esto dentro de una app Next.js impuso restricciones reales:

- Nada de peticiones arbitrarias desde el servidor a hosts proporcionados por el usuario sin protegerse contra SSRF: cada herramienta que consulta una URL objetivo pasa primero por una comprobación compartida de bloqueo de hosts.
- Rate limiting en cada ruta que habla con un objetivo externo, para que las herramientas sigan siendo usables sin convertirse en un vector de abuso.
- Cada herramienta necesitaba degradar con elegancia: si un objetivo bloquea la petición, expira el tiempo de espera o devuelve algo inesperado, la interfaz debe explicarlo con claridad en lugar de quedarse colgada.

Esas restricciones son exactamente el tipo de cosas que aparecen en el trabajo de seguridad real, así que construirlas bien aquí sirvió también como práctica.

## Qué viene después

Tengo pensado añadir un par de herramientas más: un decodificador de JWT y un ayudante básico de enumeración de subdominios están en la lista. Si quieres ver el conjunto actual, están todas disponibles en [Herramientas](/es/tools).
