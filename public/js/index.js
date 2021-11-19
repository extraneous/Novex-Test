let map;
let allowPointCreation = false;
let vectorSource;

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})
$(function(){
    let mapHolder = $('#mapHolder')
    let canvasheight=$(window).height() - 80 + "px";
    let canvaswidth= mapHolder.parent().css('width');
    mapHolder.css("height", canvasheight);
    mapHolder.css("width", canvaswidth);

    vectorSource = new ol.source.Vector({ wrapX: false });
    let vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    map = new ol.Map({
        target: 'mapHolder',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorLayer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([-1.78,51.67]),
            zoom: 13
        })
    });


    map.on('singleclick', function (evt) {
        if(allowPointCreation) {
            let coords = ol.proj.toLonLat(evt.coordinate);
            let lat = coords[1];
            let lon = coords[0];
            //save to database
            axios.post('api/points ',{
                lat:lat,
                lon:lon
            }).then(function(){
                addMarker(lat,lon);
                Toast.fire({
                    icon: 'success',
                    title: 'Point created!'
                })
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    });
    //get existing points from database
    axios.get('api/points')
    .then(function(response){
        let points = response.data;
        for(i=0;i < points.length;i++){
            //create points on map here
            addMarker(points[i].lat,points[i].lon);
            allowPointCreation = false;
        }
    })
    .catch(function(error){
        console.log(error);
        allowPointCreation = false;
    });
});

function addMarker(lat,lon) {
    let point = new ol.geom.Point(ol.proj.fromLonLat([lon,lat]));
    let feature = new ol.Feature(
        point
    )
    vectorSource.addFeature(feature);
}
window.onresize = function() {
    let canvasheight=$(window).height() - 80 + "px";
    let canvaswidth=$('#mapHolder').parent().css('width');
    $('#mapHolder').css("height", canvasheight);
    $('#mapHolder').css("width", canvaswidth);
}

function addNewMapPoint(){
    allowPointCreation = true;
    Toast.fire({
        icon: 'success',
        title: 'Click on Map to create point'
    })
}
