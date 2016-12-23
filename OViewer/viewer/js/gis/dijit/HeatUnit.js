define([
    'dojo/_base/declare',
    "dojo/dom",
    "dojo/on",
    "dojo/_base/array",
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/i18n!./HeatUnit/nls/resource',
    'dojo/_base/lang',
    'dojo/text!./HeatUnit/templates/HeatUnit.html',
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/dijit/PopupTemplate",
    'dojo/dom-style',
    "esri/graphic",
    'esri/symbols/jsonUtils',
    'esri/graphicsUtils',
     "esri/geometry/Point",
    "esri/SpatialReference",
    'esri/layers/GraphicsLayer',
    "esri/symbols/PictureMarkerSymbol",
    'esri/renderers/SimpleRenderer',
    "dojo/keys",

    'dijit/form/Button',
    'dijit/form/NumberTextBox',

    'xstyle/css!./HeatUnit/css/HeatUnit.css'
], function (declare, dom,on, array, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
             i18n, lang, huTemplate, Query, QueryTask,PopupTemplate,
             domStyle,Graphic,  symbolUtils, graphicsUtils, Point,SpatialReference,GraphicsLayer,PictureMarkerSymbol,SimpleRenderer,keys) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        declaredClass: 'gis.digit.HeatUnit',
        templateString: huTemplate,
        i18n: i18n,
        postCreate: function () {
            this.inherited(arguments);
            this.fID = this.serviceID;
            this.fLayer = this.map.getLayer(this.fID);
            this.subLayerURL = this.fLayer.url + "/" + this.layerID;
            this.queryTask = new QueryTask(this.subLayerURL);
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
            this.countResultTitle.innerHTML = "共有" + count + "个机组";
        },
        //根据名称或编号查询换热站
        querySubstation: function () {
            this.findResultsGrid.innerHTML="";
            this.qText = this.searchText.displayedValue;
            var subQuery = new Query();
            subQuery.returnGeometry=true;
            subQuery.outFields = ["*"];
            if (isNaN(this.qText)) {
                //不是数字，就查询名称
                subQuery.where = this.nameField + " like N'%" + this.qText + "%'";
            }
            else {
                //是数字就查询编号
                subQuery.where = this.codeField + " like '%" + this.qText + "'";

            }
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
               this.goSub( this.qResult.features[0]);
            }
            else {
               var resultCount = results.features.length;
                var graphic;
               var content = " <table width='100%' class='tb' border='1px' border-collapse: collapse; >";
                for (var i = 0; i < resultCount; i++) {
                    var featureAttributes = results.features[i].attributes;
                        content=content+"<tr  ><td  style='text-align:left cursor:hand'><div   id='heu"+i+"'>"+ featureAttributes[this.nameField]+"</td></tr></div>";

                 }
                content=content+"</table>"
               this.findResultsGrid.innerHTML = content;
                domStyle.set(this.findResultsGrid, 'display', 'block');
                domStyle.set(this.qResultTitle, 'display', 'block');
                for (var i = 0; i < resultCount; i++) {
                    on(dom.byId("heu" + i), "click", lang.hitch(this, function (e) {
                        this.goSub(results.features[e.target.id.substring(3)]);
                    }))
                }
            }
        },
        goSub:function(feature){
            var selFeatures=[];
            selFeatures.push(feature);
            this.map.graphics.clear();
            this.pointSymbol = new PictureMarkerSymbol(require.toUrl('gis/dijit/HeatUnit/images/search-pointer.png'), 30, 30);

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
                title: "机组",
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
        //清空选择集
        clearResults: function () {
            this.results = null;

        },
        //查询到单个对象，在地图上显示
        showResultOnMap: function () {

        },
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