/* Sin servidor por defecto. Para activar envío real, configura un endpoint HTTPS
   del MISMO origen que acepte POST {operations:[...]} y responda
   {acknowledged:["id-de-operacion", ...]}. No guardes secretos aquí. */
self.PORTAFOLIO_SYNC = Object.freeze({endpoint: null});
