define([
    'esri/dijit/Basemap',
    'esri/dijit/BasemapLayer',
    'esri/layers/osm'
], function (Basemap, BasemapLayer, osm) {
    return {
        map: true,
        mode: 'custom', //must be either 'agol' or 'custom'
        title: '地理背景',
        // use this as the start basemap when application first opens
        mapStartBasemap: 'BaseMap1',
        //this is the list of basemaps to show in the BaseMap Gallery.
        basemapsToShow: ['BaseMap1', 'BaseMap2'],
        basemaps: {
            BaseMap1: {
                title: '地理背景', //appears as basemap title in Gallery
                basemap: new Basemap({
                    id: 'BaseMap1',
                    layers: [new BasemapLayer({
                        url: 'http://10.50.51.67:6080/arcgis/rest/services/ctc/ctc2017background/MapServer'
                    })]
                })
            },
            
            BaseMap2: {
                title: '卫片背景', //appears as basemap title in Gallery
                basemap: new Basemap({
                    id: 'BaseMap2',
                    layers: [new BasemapLayer({
                        url: 'http://10.50.51.67:6080/arcgis/rest/services/ctc/ctc2017satellite/MapServer'
                    })]
                })
            }
        }
    };
});

 