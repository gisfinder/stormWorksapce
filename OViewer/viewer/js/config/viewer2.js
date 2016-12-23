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
          
          /*
            type: 'feature',
            url: 'http://services1.arcgis.com/g2TonOxuRkIqSOFx/arcgis/rest/services/MeetUpHomeTowns/FeatureServer/0',
            title: 'STLJS Meetup Home Towns',
            options: {
                id: 'meetupHometowns',
                opacity: 1.0,
                visible: true,
                outFields: ['*'],
                mode: 0
            },
            editorLayerInfos: {
                disableGeometryUpdate: false
            },
            legendLayerInfos: {
                exclude: false,
                layerInfo: {
                    title: 'My layer'
                }
            }
  }, {
            type: 'feature',
            url: 'http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/SanFrancisco/311Incidents/FeatureServer/0',
            title: 'San Francisco 311 Incidents',
            options: {
                id: 'sf311Incidents',
                opacity: 1.0,
                visible: true,
                outFields: ['req_type', 'req_date', 'req_time', 'address', 'district'],
                mode: 0
            }
  }, {
            type: 'dynamic',
            url: 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer',
            title: 'Louisville Public Safety',
            options: {
                id: 'louisvillePubSafety',
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
  }, {
            type: 'dynamic',
            url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/DamageAssessment/MapServer',
            title: 'Damage Assessment',
            options: {
                id: 'DamageAssessment',
                opacity: 1.0,
                visible: true,
                imageParameters: imageParameters
            },
            legendLayerInfos: {
                exclude: true
            },
            layerControlLayerInfos: {
                swipe: true,
                metadataUrl: true,
                expanded: true
            }
  }],
       
   */
      
        // set include:true to load. For titlePane type set position the the desired order in the sidebar
        widgets: {
            growler: {
                include: true,
                id: 'growler',
                type: 'domNode',
                path: 'gis/dijit/Growler',
                srcNodeRef: 'growlerDijit',
                options: {}
            },
            geocoder: {
                include: true,
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
                position: 3,
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
            mapInfo: {
                include: false,
                id: 'mapInfo',
                type: 'domNode',
                path: 'gis/dijit/MapInfo',
                srcNodeRef: 'mapInfoDijit',
                options: {
                    map: true,
                    mode: 'dms',
                    firstCoord: 'y',
                    unitScale: 3,
                    showScale: true,
                    xLabel: '',
                    yLabel: '',
                    minWidth: 286
                }
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
            locateButton: {
                include: true,
                id: 'locateButton',
                type: 'domNode',
                path: 'gis/dijit/LocateButton',
                srcNodeRef: 'locateButton',
                options: {
                    map: true,
                    publishGPSPosition: true,
                    highlightLocation: true,
                    useTracking: true,
                    geolocationOptions: {
                        maximumAge: 0,
                        timeout: 15000,
                        enableHighAccuracy: true
                    }
                }
            },
            overviewMap: {
                include: true,
                id: 'overviewMap',
                type: 'map',
                path: 'esri/dijit/OverviewMap',
                options: {
                    map: true,
                    attachTo: 'bottom-right',
                    color: '#0000CC',
                    height: 100,
                    width: 125,
                    opacity: 0.30,
                    visible: false
                }
            },
            homeButton: {
                include: true,
                id: 'homeButton',
                type: 'domNode',
                path: 'esri/dijit/HomeButton',
                srcNodeRef: 'homeButton',
                options: {
                    map: true,
                    extent: new Extent({
                        xmin: -180,
                        ymin: -85,
                        xmax: 180,
                        ymax: 85,
                        spatialReference: {
                            wkid: 4326
                        }
                    })
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
                position: 0,
                options: {
                    map: true,
                    legendLayerInfos: true
                }
            },
            layerControl: {
                include: true,
                id: 'layerControl',
                type: 'titlePane',
                group:1,
                path: 'gis/dijit/LayerControl',
                title: '图层控制',
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
            bookmarks: {
                include: true,
                id: 'bookmarks',
                type: 'titlePane',
                group:1,
                path: 'gis/dijit/Bookmarks',
                title: '书签',
                open: false,
                position: 2,
                options: 'config/bookmarks'
            },
            find: {
                include: true,
                id: 'find',
                id: 'find',
                type: 'titlePane',
                canFloat: false,
                group:1,
                path: 'gis/dijit/Find',
                title: '查找',
                open: false,
                position: 3,
                options: 'config/find'
            },
            draw: {
                include: true,
                id: 'draw',
                type: 'titlePane',
                canFloat: false,
                path: 'gis/dijit/Draw',
                title: '绘制',
                group:1,
                open: false,
                position: 4,
                options: {
                    map: true,
                    mapClickMode: true
                }
            },
            measure: {
                include: true,
                id: 'measurement',
                type: 'titlePane',
                canFloat: false,
                group:1,
                path: 'gis/dijit/Measurement',
                title: '测量',
                open: false,
                position: 5,
                options: {
                    map: true,
                    mapClickMode: true,
                    defaultAreaUnit: units.SQUARE_MILES,
                    defaultLengthUnit: units.MILES
                }
            },
            print: {
                include: true,
                id: 'print',
                type: 'titlePane',
                canFloat: false,
                group:1,
                path: 'gis/dijit/Print',
                title: '打印',
                open: false,
                position: 6,
                options: {
                    map: true,
                    printTaskURL: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
                    copyrightText: 'Copyright 2014',
                    authorText: 'Me',
                    defaultTitle: '打印输出',
                    defaultFormat: 'PDF',
                    defaultLayout: 'Letter ANSI A Landscape'
                }
            },
            editor: {
                include: true,
                id: 'editor',
                type: 'titlePane',
                group:1,
                path: 'gis/dijit/Editor',
                title: '编辑',
                open: false,
                position: 8,
                options: {
                    map: true,
                    mapClickMode: true,
                    editorLayerInfos: true,
                    settings: {
                        toolbarVisible: true,
                        showAttributesOnClick: true,
                        enableUndoRedo: true,
                        createOptions: {
                            polygonDrawTools: ['freehandpolygon', 'autocomplete']
                        },
                        toolbarOptions: {
                            reshapeVisible: true,
                            cutVisible: true,
                            mergeVisible: true
                        }
                    }
                }
            },
            help: {
                include: true,
                id: 'help',
                group:1,
                type: 'floating',
                path: 'gis/dijit/Help',
                title: '帮助',
                options: {}
            },
            pipeInfo:{
                include: true,
                id: 'pipeInfo',
                type: 'titlePane',
                group:2,
                canFloat: false,
                path: 'gis/dijit/PipeInfo',
                title: '管道',
                open: false,
                position: 10,
                options: {}

            },
            substation:{
                include: true,
                id: 'substation',
                type: 'titlePane',
                canFloat: false,
                group:2,
                path: 'gis/dijit/substationInfo',
                title: '换热站',
                open: false,
                position: 11,
                options: {}

            },
            huInfo:{
                include: true,
                id: 'hu',
                type: 'titlePane',
                canFloat: false,
                group:2,
                path: 'gis/dijit/huInfo',
                title: '机组',
                open: false,
                position: 12,
                options: {}

            },
            valveChamber:{
                 include: true,
                 id: 'vc',
                 type: 'titlePane',
                 canFloat: false,
                group:2,
                 path: 'gis/dijit/vcInfo',
                 title: '井室',
                 open: false,
                 position: 13,
                 options: {}

             },
            valveInfo:{
                include: true,
                id: 'valve',
                type: 'titlePane',
                canFloat: false,
                group:2,
                path: 'gis/dijit/valveInfo',
                title: '阀门',
                open: false,
                position: 14,
                options: {}

            },
            compensatorInfo:{
                include: true,
                id: 'compensator',
                type: 'titlePane',
                canFloat: false,
                group:2,
                path: 'gis/dijit/compensatorInfo',
                title: '补偿器',
                open: false,
                position: 15,
                options: {}

            },
            buildingInfo:{
                include: true,
                id: 'building',
                type: 'titlePane',
                canFloat: false,
                group:2,
                path: 'gis/dijit/buildingInfo',
                title: '大楼',
                open: false,
                position: 16,
                options: {}

            },
            scada:{
                include: true,
                id: 'scada',
                type: 'titlePane',
                canFloat: false,
                group:3,
                path: 'gis/dijit/scada',
                title: 'SCADA',
                open: false,
                position: 17,
                options: {}

            },
            outdoorTem:{
                include: true,
                id: 'outdoortemp',
                type: 'titlePane',
                canFloat: false,
                group:3,
                path: 'gis/dijit/outdoorTem',
                title: '室外温度',
                open: false,
                position: 18,
                options: {}

            },
            leakInfo:{
                include: true,
                id: 'leakInfo',
                type: 'titlePane',
                canFloat: false,
                group:3,
                path: 'gis/dijit/leakInfo',
                title: '漏水',
                open: false,
                position: 19,
                options: {}

            },
            indoorTemp:{
                include: true,
                id: 'indoorTemp',
                type: 'titlePane',
                canFloat: false,
                group:3,
                path: 'gis/dijit/indoorTemp',
                title: '温度监测',
                open: false,
                position: 20,
                options: {}

            },
            customerComplain:{
                include: true,
                id: 'customerComplain',
                type: 'titlePane',
                canFloat: false,
                group:3,
                path: 'gis/dijit/customerComplain',
                title: '用户投诉',
                open: false,
                position: 21,
                options: {}
             },
            heatingArea:{
                include: true,
                id: 'heatingArea',
                type: 'titlePane',
                canFloat: false,
                group:3,
                path: 'gis/dijit/heatingArea',
                title: '供热面积',
                open: false,
                position: 22,
                options: {}
            },
        }
    };
});