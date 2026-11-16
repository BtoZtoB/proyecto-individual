/* Edita aquí los precios reales cuando estén definidos. null = por confirmar.
   Coloca tus propias fotos y el logo en catalogo1/img/ con los nombres indicados. */
window.CATALOGO_PERSONALIZADO = Object.freeze({
  nombre: 'Ponky',
  categorias: {'1':'Panadería','2':'Repostería','3':'Kits personalizados'},
  productos: [
    {id:1,nombre:'Empanadas',categoria:'1',precio:null,imagen:'img/empanadas.jpg',color:'#f8e7c3',descripcion:'Empanadas de Ponky. Consulta las opciones y disponibilidad.'},
    {id:2,nombre:'Rollo de queso',categoria:'1',precio:null,imagen:'img/rollo-de-queso.jpg',color:'#fbe8bf',descripcion:'Rollo de queso para disfrutar y compartir. Precio y disponibilidad por confirmar.'},
    {id:3,nombre:'Queque',categoria:'2',precio:null,imagen:'img/queque.jpg',color:'#f1d8bb',descripcion:'Queque de Ponky. Consulta las opciones de presentación y disponibilidad.'},
    {id:4,nombre:'Mini rollo de queso',categoria:'1',precio:null,imagen:'img/mini-rollo-de-queso.jpg',color:'#f8e6c9',descripcion:'Mini rollo de queso. Consulta el precio y las cantidades disponibles.'},
    {id:5,nombre:'Pucas',categoria:'1',precio:null,imagen:'img/pucas.jpg',color:'#eed8b9',descripcion:'Pucas de Ponky. Consulta las opciones y disponibilidad.'},
    {id:6,nombre:'Kit de graduación',categoria:'3',precio:null,imagen:'img/kit-de-graduacion.jpg',color:'#f9dfae',descripcion:'Un jugo de manzana Del Valle, 2 empanadas, un mini rollo de queso, una tajada de queque y 6 mini donas. Personalízalo con el nombre de quien lo recibe, el logo de su universidad u otra imagen e indicaciones especiales.'}
  ]
});
