define([
    'dojo/_base/declare',
    "dojo/dom",
    "dojo/on",
    "dojo/_base/array",
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/i18n!./Building/nls/resource',
    'dojo/_base/lang',
    'dojo/text!./Building/templates/Building.html',
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/dijit/PopupTemplate",
    'dojo/dom-style',
    "esri/graphic",
    'esri/symbols/jsonUtils',
    'esri/graphicsUtils',
     "esri/geometry/Point",
    "esri/geometry/Polygon",
    "esri/SpatialReference",
    'esri/layers/GraphicsLayer',
    "esri/symbols/PictureMarkerSymbol",
    'esri/renderers/SimpleRenderer',
    "dojo/keys",

    'dijit/form/Button',
    'dijit/form/TextBox',

    'xstyle/css!./Building/css/Building.css'
], function (declare, dom,on, array, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, i18n, lang,
             substationTemplate, Query, QueryTask,PopupTemplate,
             domStyle,Graphic,  symbolUtils, graphicsUtils, Point,Polygon,SpatialReference,GraphicsLayer,PictureMarkerSymbol,SimpleRenderer,keys) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        declaredClass: 'gis.digit.Substation',
        templateString: substationTemplate,
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
            this.countResultTitle.innerHTML = "共有" + count + "栋楼";
        },
        //根据名称或编号查询换热站
        querySubstation: function () {
            this.findResultsGrid.innerHTML="";
            this.qText = this.searchText.displayedValue;
            console.log(this.qText);
            var subQuery = new Query();
            subQuery.returnGeometry=true;
            subQuery.outFields = ['*'];
            if (isNaN(this.qText)) {
                //不是数字，就查询名称
                subQuery.where = this.nameField + " like N'%" + this.qText + "%'";
            }
            else {
                //是数字就查询编号
                subQuery.where = this.codeField + " = '" + this.qText + "'";

            }
            this.queryTask.execute(subQuery, lang.hitch(this,this.processResults));


        },
        //处理查询结果
        processResults: function (results) {

            var mp;
            this.qResult= results ;
            var resultCount = results.features.length;
            if (results.features.length == 0) {
                alert("没找到!");
                return;
            }
            else if (results.features.length == 1) {
                this.map.graphics.clear();
                this.pointSymbol = new PictureMarkerSymbol(require.toUrl('gis/dijit/Building/images/search-pointer.png'), 30, 30);

                var mp=this.qResult.features[0];
                var polyShape=new Polygon(mp.geometry);
                mp=polyShape.getCentroid();
                var  tk=new Point(mp.x,mp.y,new SpatialReference({ wkid:32652 }));
                  this.goSub(this.qResult.features[0]);

            }
            else {
               var resultCount = results.features.length;
                var graphic;
               var content = " <table width='100%' class='tb' border='1px' border-collapse: collapse; >";
                for (var i = 0; i < resultCount; i++) {
                    var featureAttributes = results.features[i].attributes;
                        content=content+"<tr  ><td  style='text-align:left cursor:hand'><div   id='bud"+i+"'>"+ featureAttributes[this.nameField]+"</td></tr></div>";

                 }
                content=content+"</table>"
               this.findResultsGrid.innerHTML = content;
                domStyle.set(this.findResultsGrid, 'display', 'block');
                domStyle.set(this.qResultTitle, 'display', 'block');
                for (var i = 0; i < resultCount; i++) {
                    on(dom.byId("bud" + i), "click", lang.hitch(this, function (e) {
                        this.goSub(results.features[e.target.id.substring(3)]);
                    }))
                }
            }
        },
        goSub:function(feature){
            this.map.graphics.clear();
            var selFeatures=[];
            selFeatures.push(feature);

          var polyShape=Polygon(feature.geometry);
           var   mp=polyShape.getCentroid();
           var  tk=new Point(mp.x,mp.y,new SpatialReference({ wkid:32652 }));

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
                title: "大楼",
                fieldInfos: fieldInfos,
            });
            feature.setInfoTemplate(popup);
            this.map.infoWindow.clearFeatures();
            this.map.infoWindow.show(tk);
            this.map.infoWindow.setFeatures(selFeatures);

            if(this.map.getZoom()<6)
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