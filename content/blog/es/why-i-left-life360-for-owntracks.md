---
title: "Por qué dejé Life360 y monté OwnTracks en mi propio servidor"
description: "Life360 vende datos de ubicación granulares a terceros por defecto. Moví la ubicación compartida con amigos a OwnTracks, autoalojado en mi servidor Oracle Ampere A1."
date: "2026-08-05"
tags: ["Privacidad", "Self-hosting", "MQTT"]
---

Usaba Life360 como la mayoría de gente de mi edad: para coordinarme con amigos cuando quedamos, en vez de mandar una ubicación en vivo en un chat de WhatsApp que se queda ahí abierto indefinidamente. Funciona, pero implica confiar en una empresa cuyo modelo de negocio depende de monetizar justo lo que está recogiendo — el historial de ubicación de todo tu círculo, rastreado de forma continua, no solo cuando tú decides compartirlo.

Se ha reportado que Life360 vende datos de ubicación anonimizados pero reidentificables a data brokers, y ha tenido brechas que expusieron datos de usuarios a través de integraciones con terceros. Nada de esto es un fallo puntual; es la consecuencia natural de una app gratuita cuyo activo principal es un historial de ubicación preciso. Ya tengo un servidor corriendo para este sitio, así que pagar a una empresa para que guarde esos datos por mí dejó de tener sentido — podía guardarlos yo mismo.

## OwnTracks en vez de una app de ubicación compartida

[OwnTracks](https://owntracks.org/) es un rastreador de ubicación de código abierto: una app para iOS y Android que publica tu posición GPS, y un backend que la recibe y la almacena. No hay ningún proveedor intermedio. Soporta dos transportes — HTTP o MQTT — y elegí MQTT porque está pensado justo para esto: mensajería pub/sub ligera donde el móvil publica una actualización de ubicación y solo los clientes suscritos a ese topic la reciben.

El stack son dos contenedores, ambos en la misma máquina Oracle Ampere A1 donde corre todo lo demás de aquí:

- **Mosquitto** como broker MQTT, con credenciales y ACLs por usuario para que el móvil de cada amigo solo pueda publicar en su propio topic y solo pueda leer los topics a los que se le ha dado acceso.
- **OwnTracks Recorder**, que se suscribe a esos topics, persiste el historial de ubicación y sirve una pequeña interfaz web para ver la última posición conocida de cada uno en un mapa.

Nginx Proxy Manager va por delante, terminando TLS y haciendo de reverse proxy tanto para el endpoint MQTT sobre WebSockets como para la interfaz HTTP del Recorder, así que nada habla con el broker en texto plano desde fuera del servidor.

## Qué sustituye esto en realidad

La idea nunca fue el rastreo continuo — es justo lo contrario de lo que me hizo dejar Life360. La app puede reportar la ubicación periódicamente o solo bajo demanda, y cada amigo controla su propio topic y puede dejar de publicar cuando quiera, porque son sus credenciales y su configuración de la app. Lo que sustituye es ese momento concreto en el que alguien escribe "compárteme la ubi" en un grupo de WhatsApp y la ubicación se queda fijada en ese chat durante horas, visible para todos los que están dentro y guardada en los servidores de WhatsApp. Ahora esos datos viven en infraestructura que controlo yo, se borran según el calendario que yo defino, y nunca estuvieron en posición de ser vendidos en primer lugar.
