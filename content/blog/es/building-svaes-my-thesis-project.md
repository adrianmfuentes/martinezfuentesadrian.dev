---
title: "Construyendo SVAES: automatizando la verificación de entregas de software para mi TFG"
description: "Cómo diseñé una plataforma de verificación multi-tenant con backend en FastAPI, frontend en Angular y un motor de verificación en Rust para mi Trabajo de Fin de Grado."
date: "2026-06-01"
tags: ["FastAPI", "Angular", "Rust", "TFG"]
---

Para mi Trabajo de Fin de Grado quería resolver un problema que había visto de verdad en la práctica: equipos entregando software a través de varios sistemas externos sin ninguna forma automática de verificar que una entrega fuera coherente, completa y consistente internamente. Así nació SVAES, un sistema automatizado de verificación de entregas de software.

## La forma del problema

En la mayoría de estos flujos, la verificación se hace a mano: alguien abre una hoja de cálculo, cruza un par de archivos y da el visto bueno. Escala mal y es fácil pasar por alto algo sutil, como un desajuste de versión entre un manifiesto y el artefacto que realmente se está entregando.

SVAES necesitaba:

- Ingerir entregas de múltiples sistemas externos, cada uno con sus propias particularidades de formato.
- Ejecutar un conjunto de reglas de verificación sobre cada entrega, tenant por tenant.
- Mostrar resultados accionables en lugar de un muro de logs.

## Por qué tres stacks distintos

La arquitectura acabó siendo multi-tenant a propósito, y cada pieza usa la herramienta más adecuada:

- **FastAPI** para la capa de orquestación: gestión de tenants, ingesta de entregas y la API con la que habla el frontend.
- **Angular** para el frontend, sobre todo porque los resultados de verificación necesitaban una interfaz densa, con muchas tablas, que se beneficia de la estructura de Angular a esa escala.
- **Rust** para el motor de verificación en sí. Las comprobaciones de coherencia sobre entregas grandes son intensivas en CPU, y quería un rendimiento predecible sin pelearme con un recolector de basura.

## Qué haría diferente

Si empezara de nuevo, invertiría antes en un esquema compartido entre el motor de Rust y la capa de FastAPI: acabé sincronizando a mano algunas estructuras de datos entre ambos, justo el tipo de paso manual que SVAES está pensado para eliminar. Un poco irónico, pero una buena lección.

Puedes ver SVAES en vivo en la [sección de portfolio](/es/portfolio), o revisar el código en [GitHub](https://github.com/adrianmfuentes/SVAES).
