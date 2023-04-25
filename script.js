// ----------------------------Creando variables y funciones--------------------------------------

let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
let req = new XMLHttpRequest()

let values = []

let xScale
let yScale

let width = 800;
let height = 600;
let padding = 40;

let svg = d3.select('svg')
let tooltip = d3.select('#tooltip')

let drawCanvas = () =>{
  svg.attr('width', width)
  svg.attr('height', height)




}

let generateScales = () =>{

  xScale = d3.scaleLinear()

            // El dominio si se refiere al malor maximo y al valor minimo que vamos a grraficar en el eje; en esete caso, el eje x. Para que la grafica se vea un poco mejor, vamos a agrandar el domino una año y que el maximo y un año menos que el minimo
            .domain([d3.min(values, (item)=>{
                return item['Year']
            })-1 , d3.max(values, (item)=>{
              return item['Year']
            })+1])

            //  acá el rango se refiere al ancho que ocupará el eje x dentro del elemento svg. En ese caso, el valor minimo (donde empezará el eje x) es el valor del padding izquierdo, mientras que el maximo es el ancho del elemento svg menos el padding.
            .range([padding, (width - padding)])
            // Acá vamos a bajar el eje x (que aparece en la parte superior del svg) hacia la parte inferior. como no lo vamos a mover horizontalmente, nuestro primer valor es cero, mientras que el segundo valor es la cantidad que lo vamos a bajar verticalmente, en este caso, el alto de nuestro svg menos el padding
            
  yScale = d3.scaleTime()
            //  Acá hacemos lo mmismo que en el punto que esta inmediatamente arriba. La direncia acá es que, en terminos de records de tiempo en un acarrera, mientras menos tiempo, mejor. Entonces, nuestro tiempo mas largo estará en el fondo de nuestro eje Y por ser el peor tiempo, mientras que el tiempo mas corto estará en lo mas alto.
            .range([padding, (height - padding)])

            // igual que arriba, el dominio se refiere al rango de volres que se va a graficar (valor minimo y valor maximo)
            .domain([d3.min(values, (item)=>{
              return new Date(item['Seconds'] * 1000)
            }), d3.max(values, (item)=>{
              return new Date(item['Seconds'] * 1000)
            })])
            // Al hacer esto cambian nuestros valores en el eje Y, pero hay que cambiar el formato en el que aparecen estos valores. El cambio de formato lo hacemos en la funcion generateAxis que se encuentra mas abajo. Referencia: [***]
            
  
}

let drawPoints = () =>{

  // Acá empezamos a dibuijar los puntos. Lo primero que hacemos es asociar los puntos con la data que tenemos.
  // Para ello, primero seleccionamos todos los circulos con el metodo "selectAll"
  svg.selectAll('circle')
    //  Luego, la unimos a la data con el metodo "data", seleccionando la data que vamos a utilizar
    .data(values)
    // Luego, el metodo enter es para especificar que queremos hacer algo con esa data que acabamos de unir; ¿y que vamos a hacer? vamos a anexar un punto (circulo) por cada uno de esos elementos en la data, tal como se muestra en las dos lineas siguientes.
    .enter()
    .append('circle')
    // acá colocamos la clase que se nos requiere por freeCodeCamp
    .attr('class', 'dot')
    // Acá le damos un radio a cada punto (circulo), para poder hacerlos visibles.
    .attr('r','5')
    // frecodecamp nos pide que cada circulo tenga una propiedad llamada 'data-xvalue' y otra llamada 'data-yvalue', por lo que a continuacion, las creamos y les asignamos su correspondiente valor
    .attr('data-xvalue', (item) =>{
      return item['Year']
    })
    .attr('data-yvalue', (item)=>{
      return new Date(item['Seconds'] *1000)
    })

    // Para que cada circulo tenga una cordenada en el eje x, debemos añadir el atributo 'cx'. al hacerlo, cada pundo se desplazará hacia su respectivo valor en dicho eje. Para ello, el atributo cx considera dos datos que creamos anteriormente: la escala a la cual vamos a graficar, y los valores que vamos a graficar.
    .attr('cx', (item)=>{
      return xScale(item['Year'])
    })
    
    // Para que cada circulo tenga una coordenada en el eje Y, debemos añadir el atributo 'cy'.
    .attr('cy', (item)=>{
      return yScale(new Date(item['Seconds']*1000))
    })

    // Este es un paso adicional a los de freecodecamp. Vamos a cambiar el color de cada punto dependiendo de si tiene alegaciones de doping o no. Los que tienen alegaciones de Doping tienen una propiedad "Doping" con una descripcion; los que no, tienen una descripción vacia.
    .attr('fill', (item)=>{
      if(item['Doping'] != ''){
        return 'orange'
      } else{
        return 'green'
      }
    })

    // Acá hacemos el tooltip visible 
    .on('mouseover', (item)=>{
        tooltip.transition()
               .style('visibility', 'visible')

        if(item['Doping'] != ''){
          tooltip.text(item['Name'] + ' - ' + item['Year'] + ' - ' + item['Time']+ ' - '+item['Doping']) 
        } else{
          tooltip.text(item['Name'] + ' - ' + item['Year'] + ' - ' + item['Time']+' - ' + 'No Allegations')
        }
        tooltip.attr('data-year', item['Year'])
    })

    .on('mouseout', (item)=>{
      tooltip.transition()
             .style('visibility','hidden')
    })
}


let generateAxes = () =>{

  // como queremos que el label esté en la parte inferior del eje x, debemos llamar un axisBottom, la cual es una funcion que toma como parametro una escala, la cual creamos previamente.
  let xAxis = d3.axisBottom(xScale)
                // en este caso debemos quitar los decimales del eje X, para que quede un numero entero (ya que estamos trabajando en años)
                .tickFormat(d3.format('d'))

  // en el caso del eje Y, llamaremos a axisLeft porque queremos que aparezca en el lado izquierdo.
  let yAxis = d3.axisLeft(yScale)
  // [***] Acá vamos a cambiar el formato de los valorees en el eje Y.
                .tickFormat(d3.timeFormat('%M:%S'))

  // "g" se refiere a group element
  svg.append('g')
     .call(xAxis)
     .attr('id', 'x-axis')
     .attr('transform', 'translate(0, '+ (height - padding)+ ')')


  svg.append('g')
     .call(yAxis)
     .attr('id', 'y-axis')
     .attr('transform', 'translate('+(padding)+', 0)')
}



// -------------------------------------------Fetching Data --------------------------------------

req.open('GET', url, true)
req.onload = () =>{

  values = JSON.parse(req.responseText)
  console.log(values)
  // En este orden se estaran ejecutando las funciones
  drawCanvas();
  generateScales();
  drawPoints();
  generateAxes();
  
}

req.send()
