// Define map components
var map = new mapboxgl.Map({
  container: 'map',
  style: carto.basemaps.positron,
  zoom: 2,
  center: [0, 0],
  scrollZoom: true,
});
 
var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');
 
function switchLayer(layer) {
    var layerId = layer.target.id;
    if (layerId=="positron"){
      map.setStyle(carto.basemaps.positron);
    } else if (layerId=="imagery"){
      map.setStyle(carto.basemaps.voyager);
    }
}
 
for (var i = 0; i < inputs.length; i++) {
inputs[i].onclick = switchLayer;
}

// Navigation Controls
const nav = new mapboxgl.NavigationControl({
      showCompass: true
  });
  map.addControl(nav, 'top-left');

const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: true
});

// Define authentication to nycmap layers
carto.setDefaultAuth({
    username: 'cartovl',
    apiKey: 'default_public'
  });


function myAddMapFunction(dataName, vizDesc) {
    const source = new carto.source.Dataset(dataName);
    const viz = new carto.Viz(vizDesc);
    const layer = new carto.Layer(dataName, source, viz);
    layer.addTo(map);
    layer.on('loaded', hideLoader);

    function hideLoader() {
      document.getElementById('loader').style.opacity = '0';
        }
 

  // Define interactivity
  const interactivity = new carto.Interactivity(layer);
  const delay = 50;
  let clickedFeatureId = null;

  interactivity.on('featureClick', event => {
      if (event.features.length) {
          const feature = event.features[0];
          clickedFeatureId = feature.id;
          feature.color.blendTo('opacity(LimeGreen, 0.5)', delay)
          feature.strokeWidth.blendTo('7', delay);
          feature.strokeColor.blendTo('opacity(LimeGreen, 0.8)', delay);
      }
  });

  interactivity.on('featureClickOut', event => {
      if (event.features.length) {
          const feature = event.features[0];
          clickedFeatureId = '';
          feature.color.reset(delay);
          feature.strokeWidth.reset(delay);
          feature.strokeColor.reset(delay);
      }
  });

  interactivity.on('featureClick', updatePopup);

  function updatePopup(event) {
      if (event.features.length > 0) {
          const vars = event.features[0].variables;
          popup.setHTML(`<div>
          <h4 class ="h4">${vars.name.value}</h4>
          <p class="description open-sans">${vars.content.value}</h4>
          </div>`);
          popup.setLngLat([event.coordinates.lng, event.coordinates.lat]);
          if (!popup.isOpen()) {
              popup.addTo(map);
          }
      } else {
          popup.remove();
      }
  }

  // When layer loads, trigger legend event
  layer.on('loaded', () => {
      
    // Request data for legend from the layer viz
    const colorLegend = layer.viz.color.getLegendData();
    let colorLegendList = '';
    
    // A function to convert map colors to HEX values for legend
    function rgbToHex(color) {
        return "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
    }
    
    // Create list elements for legend
    colorLegend.data.forEach((legend, index) => {
        const color = rgbToHex(legend.value);
        
        // Style for legend items
        colorLegendList +=
            `<li><span class="point-mark" style="background-color:${color};border: 1px solid black;"></span> <span>${legend.key}</span></li>\n`;
    });
    
    // Place list items in the content section of the title/legend box
    document.getElementById('content').innerHTML = colorLegendList;
    })
};

myAddMapFunction('world_borders',
`@name: $name 
@content: $iso3           
color: opacity(grey, 0.5)
strokeWidth: 0.2
strokeColor: black`);

myAddMapFunction('populated_places', 
`@name: $name 
@content: $adm0name
color: blue
strokeWidth: 0.2
strokeColor: black`);






