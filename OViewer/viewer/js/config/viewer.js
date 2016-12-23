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
    esriConfig.defaults.geometryService = new GeometryService('http://10.50.51.67:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer');

    //image parameters for dynamic services, set to png32 for higher quality exports.
    var imageParameters = new ImageParameters();
    imageParameters.format = 'png32';

    return {
        // used for debugging your app
        isDebug: true,
        titles:{
            header:'哈尔滨管网 Harbin Pipe Network',
            subHeader:'地图 Map',
            pageTitle:'哈尔滨管网地图'
        },
        //default mapClick mode, mapClickMode lets widgets know what mode the map is in to avoid multipult map click actions from taking place (ie identify while drawing).
        defaultMapClickMode: 'identify',
        // map options, passed to map constructor. see: https://developers.arcgis.com/javascript/jsapi/map-amd.html#map1
        mapOptions: {
              extent: new Extent({xmin:306177,ymin:5056476,xmax:319895,ymax:5068120,spatialReference:{wkid:32652}}),
              basemap: new Basemap({
              id: 'background',
              layers: [new BasemapLayer({
              url: 'http://10.50.51.67:6080/arcgis/rest/services/hrb/hrbBackground_2016/MapServer'
           })]
         }),
           center: new Point({
            x: 311674.515330248,
             y: 5062226.443425702,
             spatialReference: {
            wkid:  32652
          }
           }),
          zoom: 1,
         sliderStyle: 'middle',
          showAttribution: true
       },
        collapseButtonsPane: 'center',
        operationalLayers: [
/*
            {
                type: 'feature',
                url: 'http://10.50.51.67:6080/arcgis/rest/services/hrb/hrbPipe_2016_feature/MapServer/2',
                title: '管线',
                options: {
                    id: '管线',
                    opacity: 1.0,
                    visible: true,
                    outFields: ["*"],
                    mode:0
                }
            },
            */
            {
      type: 'dynamic',
            url: 'http://10.50.51.67:6080/arcgis/rest/services/test/hrbPipe_2016_3/MapServer/',
            title: '管网 Network',
            options: {
                id: '管网',
                opacity: 1.0,
                visible: true,
                imageParameters: imageParameters
            },
            identifyLayerInfos: {
                layerIds: [0,2,3,4,6,7,8,9,10,11,12,13, 14, 15,16]
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
           title:'通用  Tools'
       },
       tab2:{
           id:'2',
           title:'管网 Network'
       }
   },

        widgets: {



            basemaps: {
                include: true,
                id: 'basemaps',
                type: 'domNode',
                path: 'gis/dijit/Basemaps',
                srcNodeRef: 'basemapsDijit',
                options: 'config/basemaps'
            },
            legend: {
                include: true,
                id: 'legend',
                type: 'titlePane',
                group:1,
                path: 'esri/dijit/Legend',
                title: '图例 Legend',
                open: false,
                position: 0,
                options: {
                    map: true,
                    legendLayerInfos: true
                }
            }

            ,
            identify: {
                include: true,
                id: 'identify',
                group:1,
                type: 'titlePane',
                path: 'gis/dijit/Identify',
                title: '点图查询 Identify',
                open: false,
                position: 3,
                options: 'config/identify'
             } ,
        measure: {
            include: true,
            id: 'measurement',
            type: 'titlePane',
            canFloat: false,
            group:1,
            path: 'gis/dijit/Measurement',
            title: '测量  Measurement',
            open: false,
            position: 5,
            options: {
                map: true,
                mapClickMode: true,
                defaultAreaUnit: units.SQUARE_METERS,
                defaultLengthUnit: units.METERS
            }
        },
        print: {
            include: true,
            id: 'print',
            type: 'titlePane',
            canFloat: false,
            group:1,
            path: 'gis/dijit/Print',
            title: '打印 Print',
            open: false,
            position: 6,
            options: {
                map: true,
                printTaskURL: 'http://10.50.51.67:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
                copyrightText: 'Copyright 2016',
                authorText: 'Me',
                defaultTitle: '打印输出 Print',
                defaultFormat: 'JPG',
                defaultLayout: 'Letter ANSI A Landscape'
            }
        },
            pipeInfo:{
                include: true,
                id: 'pipeInfo',
                type: 'titlePane',
                group:2,
                canFloat: false,
                path: 'gis/dijit/PipeInfo',
                title: '管网统计 Network statistics',
                open: false,
                position: 1,
                options: 'config/pipeinfo'
            },
            pipeColorRamp:{
                include: true,
                id: 'pipeColorRamp',
                type: 'titlePane',
                group:2,
                canFloat: false,
                path: 'gis/dijit/PipeColorRamp',
                title: '管网着色 Pipe coloring',
                open: false,
                position: 2,
                options: 'config/pipecolorramp'
            },
             substation:{
            include: true,
            id: 'substation',
            type: 'titlePane',
            canFloat: false,
            group:2,
            path: 'gis/dijit/substation',
            title: '换热站 Substatioin',
            open: false,
            position: 3,
                 options: 'config/substation'

        },
             heatunit:{
            include: true,
            id: 'heatunit',
            type: 'titlePane',
            canFloat: false,
            group:2,
            path: 'gis/dijit/heatunit',
            title: '机组 Heat Unit',
            open: false,
            position: 4,
            options: 'config/heatunit'
        },
        vc:{
            include: true,
            id: 'vc',
            type: 'titlePane',
            canFloat: false,
            group:2,
            path: 'gis/dijit/vc',
            title: '井室 Valve Chamber',
            open: false,
            position: 5,
            options: 'config/vc'
        },
          valve:{
            include: true,
            id: 'valve',
            type: 'titlePane',
            canFloat: false,
            group:2,
            path: 'gis/dijit/valve',
            title: '阀门 Valve',
            open: false,
            position: 6,
            options: 'config/valve'
        },

        layerControl: {
            include: true,
            id: 'layerControl',
            type: 'titlePane',
            group:1,
            path: 'gis/dijit/LayerControl',
            title: '图层控制 Layer Control',
            open: false,
            position: 0,
            options: {
                map: true,
                layerControlLayerInfos: true,
                separated: true,
                vectorReorder: true,
                overlayReorder: true
            }
        },
            compensator:{
                include: true,
                id: 'compensator',
                type: 'titlePane',
                canFloat: false,
                group:2,
                path: 'gis/dijit/compensator',
                title: '补偿器 Compensator',
                open: false,
                position: 7,
                options: 'config/compensator'
            },
            building:{
                include: true,
                id: 'building',
                type: 'titlePane',
                canFloat: false,
                group:2,
                path: 'gis/dijit/building',
                title: '大楼 Building',
                open: false,
                position: 8,
                options: 'config/building'
            }
        }
    };
});