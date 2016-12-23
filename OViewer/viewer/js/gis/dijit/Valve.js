define([
    'dojo/_base/declare',
    "dojo/dom",
    "dijit/registry",
    "dojo/on",
    "dojo/_base/array",
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/i18n!./Valve/nls/resource',
    'dojo/_base/lang',
    'dojo/text!./Valve/templates/Valve.html',
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/tasks/RelationshipQuery",
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

    'xstyle/css!./Valve/css/Valve.css'
], function (declare, dom,registry,on, array, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, i18n, lang, valveTemplate, Query, QueryTask,RelationshipQuery,
             domStyle,Graphic,  symbolUtils, graphicsUtils, Point,SpatialReference,GraphicsLayer,PictureMarkerSymbol,SimpleRenderer,keys) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        declaredClass: 'gis.digit.Valve',
        templateString: valveTemplate,
        i18n: i18n,
        postCreate: function () {
            this.inherited(arguments);
            this.fID = this.serviceID;
            this.fLayer = this.map.getLayer(this.fID);
            this.subLayerURL = this.fLayer.url + "/" + this.layerID;
            this.queryTask = new QueryTask(this.subLayerURL);

        },
        //统计换热站总数
        getCount: function () {
            var countQuery = new Query();
            countQuery.where = "1=1";
            countQuery.returnGeometry = false;
            this.calculateQuery = new Query();
            this.queryTask.executeForCount(countQuery, lang.hitch(this,this.showCount));
       },
        showCount:function(count){
            this.countResultTitle.style.display = "block";
            this.countResultTitle.innerHTML = "共有" + count + "个阀门";
        },
        //根据名称或编号查询换热站
        querySubstation: function () {
            this.findResultsGrid.innerHTML="";
            this.qText = this.searchText.value;
            var subQuery = new Query();
            subQuery.outFields = ["OBJECTID"];
            var vCode=this.codeFieldHead;
            for(var i=0;i<(this.codeFieldLength-this.searchText.value.length);i++)
            {
                vCode=vCode+"0";
            }
            vCode=vCode+this.searchText.value;
            subQuery.where = this.codeField + "='"+vCode+"'";
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
                this.pointSymbol = new PictureMarkerSymbol(require.toUrl('gis/dijit/Valve/images/search-pointer.png'), 30, 30);

                var mp=this.qResult.features[0];
                var  tk=new Point(mp.geometry.x,mp.geometry.y,new SpatialReference({ wkid:32652 }));

                this.map.graphics.add(new Graphic(tk,this.pointSymbol));

                if(this.map.getZoom()<4)
                    this.map.centerAndZoom(tk,4);
                else
                    this.map.centerAt(tk);
            }
            else {
               var resultCount = results.features.length;
                var graphic;
               var content = " <table width='100%' class='tb' border='1px' border-collapse: collapse; >";
                for (var i = 0; i < resultCount; i++) {
                    var featureAttributes = results.features[i].attributes;
                        content=content+"<tr  ><td  style='text-align:left cursor:hand'><div   id='sub"+i+"'>"+ featureAttributes[this.nameField]+"</td></tr></div>";

                 }
                content=content+"</table>"
               this.findResultsGrid.innerHTML = content;
                domStyle.set(this.findResultsGrid, 'display', 'block');
                domStyle.set(this.qResultTitle, 'display', 'block');
                for (var i = 0; i < resultCount; i++) {
                    on(dom.byId("sub" + i), "click", lang.hitch(this, function (e) {
                  this.goSub(e);
                    }))
                }
            }
        },
        goSub:function(e){
            this.map.graphics.clear();
            this.pointSymbol = new PictureMarkerSymbol(require.toUrl('gis/dijit/Valve/images/search-pointer.png'), 30, 30);

            var mp=this.qResult.features[e.target.id.substring(3)];
           var  tk=new Point(mp.geometry.x,mp.geometry.y,new SpatialReference({ wkid:32652 }));

            this.map.graphics.add(new Graphic(tk,this.pointSymbol));

           if(this.map.getZoom()<4)
               this.map.centerAndZoom(tk,4);
            else
               this.map.centerAt(tk);

        },
        //清空选择集
        clearResults: function () {
            this.results = null;

        },
          queryRelatedObj: function (objID) {
                var relatedQuery = new RelationshipQuery();
                relatedQuery.outFields = [this.codeField];
                relatedQuery.objectIds = [objID];
                relatedQuery.relationshipId = 1;
                this.fLayer.queryRelatedFeatures(relatedQuery,function(relatedRecords) {
                var fset = relatedRecords[objID];
                if( fset.features.length==1){
                    this.map.graphics.clear();
                    this.pointSymbol = new PictureMarkerSymbol(require.toUrl('gis/dijit/Valve/images/search-pointer.png'), 30, 30);

                    var mp=this.qResult.features[0];
                    var  tk=new Point(mp.geometry.x,mp.geometry.y,new SpatialReference({ wkid:32652 }));

                    this.map.graphics.add(new Graphic(tk,this.pointSymbol));

                    if(this.map.getZoom()<4)
                        this.map.centerAndZoom(tk,4);
                    else
                        this.map.centerAt(tk);
                  }
        });
            }
    });
});