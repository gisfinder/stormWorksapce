define([
   'esri/units',
   'esri/geometry/Extent',
   'esri/config',
   'esri/tasks/GeometryService',
   'esri/layers/ImageParameters',
      'esri/dijit/Basemap',
   'esri/dijit/BasemapLayer',
   'esri/geometry/Point' 
], function (units, Extent, esriConfig, GeometryService, ImageParameters,Basemap,BasemapLayer,Point) {

    // url to your proxy page, must be on same machine hosting you app. See proxy folder for readme.
    esriConfig.defaults.io.proxyUrl = 'proxy/proxy.ashx';
    esriConfig.defaults.io.alwaysUseProxy = false;
    // url to your geometry server.
    esriConfig.defaults.geometryService = new GeometryService('http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');

    //image parameters for dynamic services, set to png32 for higher quality exports.
    var imageParameters = new ImageParameters();
    imageParameters.format = 'png32';

    return {
        // used for debugging your app
        isDebug: true,
        titles:{
            header:'哈尔滨管网',
            subHeader:'GIS',
            pageTitle:'哈尔滨GIS'
        },
        //default mapClick mode, mapClickMode lets widgets know what mode the map is in to avoid multipult map click actions from taking place (ie identify while drawing).
        defaultMapClickMode: 'identify',
        // map options, passed to map constructor. see: https://developers.arcgis.com/javascript/jsapi/map-amd.html#map1
        mapOptions: {
              extent: new Extent({xmin:306177,ymin:5056476,xmax:319895,ymax:5068120,spatialReference:{wkid:32652}}),
              basemap: new Basemap({
              id: 'background',
              layers: [new BasemapLayer({
              url: 'http://10.50.51.67:6080/arcgis/rest/services/hrb/hrbBackground2015/MapServer'
           })]
         }),
           center: new Point({
            x: 311674.515330248,
             y: 5062226.443425702,
             spatialReference: {
            wkid:  32652
          }
           }),
          zoom: 0,
         sliderStyle: 'middle',
          showAttribution: true
       },
        // panes: {
        // 	left: {
        // 		splitter: true
        // 	},
        // 	right: {
        // 		id: 'sidebarRight',
        // 		placeAt: 'outer',
        // 		region: 'right',
        // 		splitter: true,
        // 		collapsible: true
        // 	},
        // 	bottom: {
        // 		id: 'sidebarBottom',
        // 		placeAt: 'outer',
        // 		splitter: true,
        // 		collapsible: true,
        // 		region: 'bottom'
        // 	},
        // 	top: {
        // 		id: 'sidebarTop',
        // 		placeAt: 'outer',
        // 		collapsible: true,
        // 		splitter: true,
        // 		region: 'top'
        // 	}
        // },
        // collapseButtonsPane: 'center', //center or outer

        // operationalLayers: Array of Layers to load on top of the basemap: valid 'type' options: 'dynamic', 'tiled', 'feature'.
        // The 'options' object is passed as the layers options for constructor. Title will be used in the legend only. id's must be unique and have no spaces.
        // 3 'mode' options: MODE_SNAPSHOT = 0, MODE_ONDEMAND = 1, MODE_SELECTION = 2
        operationalLayers: [{
      type: 'dynamic',
            url: 'http://10.50.51.67:6080/arcgis/rest/services/hrb/hrbPipe_2015/MapServer',
            title: '管网',
            options: {
                id: '管网',
                opacity: 1.0,
                visible: true,
                imageParameters: imageParameters
            },
            identifyLayerInfos: {
                layerIds: [2, 4, 5, 8, 12, 21]
            },
            legendLayerInfos: {
                layerInfo: {
                    hideLayers: [21]
                }
            }
  } ],
   tabs:{
       tab1:{
           id:'1',
           title:'通用'
       },
       tab2:{
           id:'2',
           title:'资产'
       },
       tab3:{
           id:'3',
           title:'运行'
       }
   },

        // set include:true to load. For titlePane type set position the the desired order in the sidebar
        widgets: {
            geocoder: {
                include: false,
                id: 'geocoder',
                type: 'domNode',
                path: 'gis/dijit/Geocoder',
                srcNodeRef: 'geocodeDijit',
                options: {
                    map: true,
                    mapRightClickMenu: true,
                    geocoderOptions: {
                        autoComplete: true,
                        arcgisGeocoder: {
                            placeholder: '输入大楼,换热站,机组名称'
                        }
                    }
                }
            },
            identify: {
                include: true,
                id: 'identify',
                group:1,
                type: 'titlePane',
                path: 'gis/dijit/Identify',
                title: '点图查询',
                open: false,
                position: 0,
                options: 'config/identify'
            },
            basemaps: {
                include: true,
                id: 'basemaps',
                type: 'domNode',
                path: 'gis/dijit/Basemaps',
                srcNodeRef: 'basemapsDijit',
                options: 'config/basemaps'
            },
            scalebar: {
                include: true,
                id: 'scalebar',
                type: 'map',
                path: 'esri/dijit/Scalebar',
                options: {
                    map: true,
                    attachTo: 'bottom-left',
                    scalebarStyle: 'line',
                    scalebarUnit: 'dual'
                }
            },
         legend: {
                include: true,
                id: 'legend',
                type: 'titlePane',
                group:1,
                path: 'esri/dijit/Legend',
                title: '图例',
                open: false,
                position: 1,
                options: {
                    map: true,
                    legendLayerInfos: true
                }
            },
            layerControl: {
                include: true,
                id: 'layerControl',
                type: 'titlePane',
                group:3,
                path: 'gis/dijit/LayerControl',
                title: '图层控制',
                open: false,
                position: 1,
                options: {
                    map: true,
                    layerControlLayerInfos: true,
                    separated: true,
                    vectorReorder: true,
                    overlayReorder: true
                }
            }
        }
    };
});