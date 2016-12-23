define([
    'dojo/_base/declare',
    "dojo/dom",
    "dojo/on",
    'dojo/topic',
    "dojo/_base/array",
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/i18n!./Vc/nls/resource',
    'dojo/_base/lang',

    "dijit/Dialog",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "dojo/_base/connect",
    "dojo/_base/Color",
    "dojo/promise/all",
    "dojo/dom-construct",


    'dojo/text!./Vc/templates/Vc.html',
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    'dojo/dom-style',

    "esri/graphic",
    'esri/symbols/jsonUtils',
    'esri/graphicsUtils',
     "esri/geometry/Point",
    "esri/SpatialReference",
    'esri/layers/GraphicsLayer',
    "esri/symbols/PictureMarkerSymbol",
    'esri/renderers/SimpleRenderer',

    "esri/dijit/InfoWindow",
    "esri/InfoTemplate",
    "esri/dijit/PopupTemplate",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",
    "esri/dijit/Popup",
    "esri/dijit/util/busyIndicator",
    "dojo/keys",
    'xstyle/css!./Vc/css/Vc.css',
    "dojo/domReady!"
], function (declare, dom,on,topic, arrayUtils, _WidgetBase, _TemplatedMixin,
             _WidgetsInTemplateMixin, i18n, lang,
             Dialog,ContentPane,TabContainer,  connect,dojoColor,all,domConstruct,
             vcTemplate, Query, QueryTask, domStyle,
             Graphic,  symbolUtils, graphicsUtils, Point,SpatialReference,
             GraphicsLayer,PictureMarkerSymbol,SimpleRenderer,InfoWindow,InfoTemplate,PopupTemplate,
             SimpleFillSymbol,SimpleLineSymbol,SimpleMarkerSymbol,IdentifyTask,IdentifyParameters, Popup,busyIndicator,
             keys) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        declaredClass: 'gis.digit.Vc',
        templateString: vcTemplate,
        baseClass: 'gis_Vc_IdentifyDijit',
        i18n: i18n,
        mapClickMode: null,
        postCreate: function () {
            this.inherited(arguments);
            this.fID = this.serviceID;
            this.imgPath="http://10.50.51.67/hrb/vcImages/";
            this.fLayer = this.map.getLayer(this.fID);
            this.subLayerURL = this.fLayer.url + this.layerID;
            this.queryTask = new QueryTask(this.subLayerURL);
            this.map.infoWindow.on("hide",function(){
                this.map.infoWindow.clearFeatures();
                this.map.graphics.clear();
               });
            on(this.searchText, "keydown",lang.hitch(this,  function(event) {
                switch(event.keyCode) {
                    case keys.ENTER:
                        this.querySubstation();
                        break;
                }
            }));
        },
        //统计换热站总数
        getCount: function () {
            var countQuery = new Query();
            countQuery.where = "1=1";
            countQuery.returnGeometry = false;
            this.calculateQuery = new Query();
            this.queryTask.executeForCount(countQuery,lang.hitch(this,this.showCount));
        },
        showCount:function(count){
            this.countResultTitle.style.display = "block";
            this.countResultTitle.innerHTML = "共有" + count + "个井室";
        },
        //根据名称或编号查询换热站
        querySubstation: function () {
            this.findResultsGrid.innerHTML="";
            this.qText = this.searchText.value;
            var subQuery = new Query();
            subQuery.returnGeometry=true;
            subQuery.outFields = ['*'];
            subQuery.where = this.codeField + " like '%" + this.qText + "'";
            this.queryTask.execute(subQuery, lang.hitch(this,this.processResults));
        },
        //处理查询结果
        processResults: function (results) {
            var resultItems = [];
            var mp;
            this.qResult= results ;
            var resultCount = results.features.length;
            if (results.features.length == 0) {
                alert("没找到!");
                return;
            }
            else if (results.features.length == 1) {
                this.map.graphics.clear();
                this.pointSymbol = new PictureMarkerSymbol(require.toUrl('gis/dijit/Vc/images/search-pointer.png'), 30, 30);

                var mp=this.qResult.features[0];
                var  tk=new Point(mp.geometry.x,mp.geometry.y,new SpatialReference({ wkid:32652 }));
               this.goSub(this.qResult.features[0]);

            }
            else {
               var resultCount = results.features.length;
                var graphic;
               var content = " <table width='100%' class='tb' border='1px' border-collapse: collapse; >";
                for (var i = 0; i < resultCount; i++) {
                    var featureAttributes = results.features[i].attributes;
                        content=content+"<tr  ><td  style='text-align:left cursor:hand'><div   id='vcm"+i+"'>"+ featureAttributes[this.codeField]+"</td></tr></div>";

                 }
                content=content+"</table>"
               this.findResultsGrid.innerHTML = content;
                domStyle.set(this.findResultsGrid, 'display', 'block');
                domStyle.set(this.qResultTitle, 'display', 'block');
                for (var i = 0; i < resultCount; i++) {
                    on(dom.byId("vcm" + i), "click", lang.hitch(this, function (e) {
                        this.goSub(results.features[e.target.id.substring(3)]);
                    }))
                }
            }
        },
        //定位到某个要素
        goSub:function(feature){
            var selFeatures=[];
            selFeatures.push(feature);
            this.map.graphics.clear();


            var mp=feature;
           var  tk=new Point(mp.geometry.x,mp.geometry.y,new SpatialReference({ wkid:32652 }));

            var fieldInfos=[];
            // this.map.graphics.add(new Graphic(tk,this.pointSymbol));

            var attributes = feature.attributes;
            if (attributes) {
                for (var prop in attributes) {
                    if (attributes.hasOwnProperty(prop)) {
                        fieldInfos.push({
                            fieldName: prop,
                            label: this.qResult.fieldAliases[prop],
                            visible: true
                        });
                    }
                }
            }
            var  popup = new PopupTemplate({
                title: "井室",
                fieldInfos: fieldInfos,
            });
            feature.setInfoTemplate(popup);
            this.map.infoWindow.clearFeatures();
            this.map.infoWindow.show(tk);

            this.map.infoWindow.setFeatures(selFeatures);
           if(this.map.getZoom()<4)
               this.map.centerAndZoom(tk,6);
            else
               this.map.centerAt(tk);

        },
        //点击查询井室详细信息
        identifyValveChamber: function(){
            topic.publish('mapClickMode/setCurrent', 'identifyVc');
         //   this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));
            this.mapClickMode="identifyVc";
            this.symbol = new SimpleMarkerSymbol();
            this.symbol.setStyle(SimpleMarkerSymbol.STYLE_SQUARE);
            this.symbol.setSize(15);
            this.symbol.setColor(new dojoColor([0,191,255,0.5]));

            this.exhQueryTask=new QueryTask("http://10.50.51.67:6080/arcgis/rest/services/test/hrbPipe_2016_3/MapServer/17");
            this.exhQuery=new Query();
            //补偿器
            this.compQueryTask=new QueryTask("http://10.50.51.67:6080/arcgis/rest/services/test/hrbPipe_2016_3/MapServer/18");
            this.compQuery=new Query();
            this.compQuery.returnGeometry=false;
            this.exhQuery.returnGeometry=false;
            this.compQuery.outFields=["*"];
            this.exhQuery.outFields=["*"];
            this.compQuery.where=" ";
            var valveChamberLayerURL = "http://10.50.51.67:6080/arcgis/rest/services/test/hrbPipe_2016_3/MapServer/";
            this.identifyTask = new IdentifyTask(valveChamberLayerURL);
            this.identifyParams = new IdentifyParameters();
            this.identifyParams.tolerance = 3;
            this.identifyParams.returnGeometry = true;
            this.identifyParams.layerIds = [8];
            this.identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
            this.identifyParams.width = this.map.width;
            this.identifyParams.height = this.map.height;
            this.map.on('click', lang.hitch(this, function (evt) {
                if (this.mapClickMode === 'identifyVc') {
                   lang.hitch(this, this.executeIdentifyTask(evt));
                }
            }));
           // this.mapClickMode = "identifyVc";
        },
        //重置
        reset:function(){
            topic.publish('mapClickMode/setDefault');
        },
        //清空选择集
        clearResults: function () {
            this.results = null;

        },
        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
        },

//////////////////////////////////////////////////

      getWindowContent:function( feature,event,result)
      {

          var vcCode=feature.attributes["井室编号"];
          var imgUrl=vcCode.substr(3);
          var graphic=feature;
          graphic.setSymbol(this.symbol);
           this.map.graphics.clear();
           this.map.graphics.add(graphic);
          var fieldInfos=[];
          fieldInfos=this.getFieldsInfos(feature);
          var  chamberPopup = new PopupTemplate({
              title: "井室",
              fieldInfos: fieldInfos
          });
          chamberPopup.setTitle(result.layerName);
          feature.setInfoTemplate(chamberPopup);
          this.resultList.push(feature);
          var chamberImg = new PopupTemplate({
              title: "井室图片",
              mediaInfos: [{
                  type: "image",
                  "value": {
                      "sourceURL": this.imgPath + imgUrl + ".jpg",
                      "linkURL": this.imgPath + imgUrl + ".jpg"
                  }
              }]
          });
          var imgFeature=new Graphic();
          imgFeature.setInfoTemplate(chamberImg);
          this.resultList.push(imgFeature);

        if(vcCode.length>0) {
            this.compQuery.where = "ValveChamb='VCH00" + vcCode.substr(3) + "'";
            this.exhQuery.where = "VCID='" + vcCode + "'";
            var exhDevices = this.exhQueryTask.execute(this.exhQuery);
            var compDevices = this.compQueryTask.execute(this.compQuery);
            var promises = all([exhDevices, compDevices]);
            promises.then(lang.hitch(this,handleQueryResults));
        }
          else
        {
            this.map.infoWindow.show(event.mapPoint);
            this.map.infoWindow.setFeatures(this.resultList);
        }

        function handleQueryResults(results)  {

           // Display attribute information.
            if(results[1].features.length>0)
            {
                arrayUtils.forEach(results[1].features, lang.hitch(this,function(feature) {
                    var fieldInfos=[];
                    fieldInfos=this.getFieldsInfos(feature);
                    var  comPopup = new PopupTemplate({
                        title: "补偿器",
                        fieldInfos: fieldInfos
                    });
                    comPopup.setTitle(results[1].layerName);
                    feature.setInfoTemplate(comPopup);
                    this.resultList.push(feature);
                }));
            }

            if(results[0].features.length>0){
                arrayUtils.forEach(results[0].features, lang.hitch(this,function(feature) {
                    var fieldInfos=[];
                    fieldInfos=this.getFieldsInfos(feature);
                    var  comPopup = new PopupTemplate({
                        title: "排气/泄水",
                        fieldInfos: fieldInfos
                    });
                    comPopup.setTitle(results[0].layerName);
                    feature.setInfoTemplate(comPopup);
                    this.resultList.push(feature);
                }));
            }
            this.map.infoWindow.show(event.mapPoint);
            this.map.infoWindow.setFeatures(this.resultList);
            this.mapClickMode="identify";
            //topic.publish('mapClickMode/setCurrent', 'identify');
        }


    },

      ////////////////////////////////////
      executeIdentifyTask:function (event) {
       this.map.infoWindow.clearFeatures();
        this.resultList=[]; //查询结果列表
        this.identifyParams.geometry = event.mapPoint;
        this.identifyParams.mapExtent = this.map.extent;

         var deferred = this.identifyTask
                 .execute(this.identifyParams)
                 .addCallback(lang.hitch(this,function (response) {
                return arrayUtils.map(response, lang.hitch(this,function (result) {

                    var feature = result.feature;
                    var layerId = result.layerId;
                    if (layerId == '8') {
                        this.getWindowContent(feature,event,result);
                        return feature;
                    }
                }));

       }));

    },
        //根据要素获取字段
        getFieldsInfos:function(feature){
            var _fieldInfos=[];
            var attributes = feature.attributes;
            if (attributes) {
                for (var prop in attributes) {
                    if (attributes.hasOwnProperty(prop)) {
                        _fieldInfos.push({
                            fieldName: prop,
                            label:prop,
                            visible: true
                        });
                    }
                }
            }
            return _fieldInfos;
    },

       //查询到单个对象，在地图上显示
        showResultOnMap: function () {

        },

        /////////////////////////////////////////////////
     createGraphicsLayer: function () {
            var graphicsLayer = new GraphicsLayer({
                id: this.id + '_findGraphics',
                title: 'Find'
            });

            this.map.addLayer(graphicsLayer);
            return graphicsLayer;
        }
    });
});