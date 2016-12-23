define([
	'dojo/_base/declare',
	"dojo/dom",
	'dojo/dom-style',
	"dojo/_base/array",
	"dojo/promise/all",
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dojo/i18n!./PipeInfo/nls/resource',
	'dojo/_base/lang',
	'dojo/text!./PipeInfo/templates/PipeInfo.html',
	"esri/symbols/LineSymbol",
	"esri/layers/FeatureLayer",
	"esri/toolbars/draw",
	"esri/tasks/query",
	"esri/tasks/QueryTask",
	"esri/tasks/StatisticDefinition",

	'dijit/form/Button',

	'xstyle/css!./PipeInfo/css/PipeInfo.css'
], function (declare,dom,domStyle, array,all,_WidgetBase,_TemplatedMixin, _WidgetsInTemplateMixin,i18n,  lang,pipeTemplate,LineSymbol,FeatureLayer,Draw,Query,QueryTask,StatisticDefinition) {

	return declare([_WidgetBase,_TemplatedMixin, _WidgetsInTemplateMixin], {
		declaredClass: 'gis.digit.PipeInfo',
		templateString:pipeTemplate,
		i18n: i18n,
		ageResult:0,
		lengthResult:0,
		volumeResult:0,
		surfaceResult:0,
		postCreate: function () {
			this.inherited(arguments);
			this.fID=this.fLayerID;
			this.layers = [];
			this.fLayer=this.map.getLayer(this.fID);
			array.forEach(this.layerInfos, function (layerInfo) {
				var lyrId = layerInfo.layer.id;
				if(lyrId==this.fID)
				    this.fLayer=this.map.getLayer(lyrId);
				/*
				var layer = this.map.getLayer(lyrId);
				if (layer) {
					var url = layer.url;
					// handle feature layers
					if (layer.declaredClass === 'esri.layers.FeatureLayer')
					   this.layers.push(layer);
 				}
 				*/
			}, this);},
		//计算全网的长度、容积、表面积、管龄
		queryFullNetwork: function () {
			this.statQuery = new Query();
			this.calculateQuery=new Query();
			 this.calcPipeParam();


		},
		//计算部分管线参数
		selPartNetowrk: function () {

     //   this.pipeVolume=1000;
		},
		//清空选择集
		clearResults: function () {
			this.results = null;

		},
		 statPipeLength: function(){
			 var tLengthStatDef = new StatisticDefinition();
			 tLengthStatDef.statisticType = "sum";
			 tLengthStatDef.onStatisticField = "SHAPE.len";
			 this.statQuery.where = "1=1";
			 this.statQuery.returnGeometry = false;
			 this.statQuery.outStatistics = [tLengthStatDef];
	    },
		 calcPipeParam :function(){
			 var currYear=new Date().getYear(); //当前年
			 var calcPipeSumLength=0; //计算用管长
		//	 var queryTask=new QueryTask(this.fLayer.url);
			var  queryTask=new QueryTask('http://10.50.51.67:6080/arcgis/rest/services/hrb/hrbPipe_2016_feature/MapServer/2');
			 this.statPipeLength();
			 var statPipeSumLength = 0;
			 calcPipeSumLength = 0;
			 var pVolume=0;
			 var pLength=0;
			 var pAge=0;
			 var pSurfaceArea=0;
             var pLengthField=this.pipeLengthField;
			 var pYearField=this.pipeConstructYearField;
			 var pDiamField=this.diamField;
             queryTask.outFields=[this.pipeLengthField, this.pipeConstructYearField, this.diamField];
			 this.calculateQuery.outFields = [this.pipeLengthField, this.pipeConstructYearField, this.diamField];
			 this.calculateQuery.where = this.pipeLengthField + " is not null and " + this.pipeConstructYearField + " is not null";
			 all([queryTask.execute(this.calculateQuery), queryTask.execute(this.statQuery)]).then(function (results) {
				 statPipeSumLength = results[1].features[0].attributes["SUM(SHAPE.len) AS SUM_SHAPE_len"].toFixed(0);
				 array.forEach(results[0].features, function (feature) {
					 calcPipeSumLength = calcPipeSumLength + feature.attributes[pLengthField];
					 pVolume = pVolume + 3.14 / 4000000 * feature.attributes[pDiamField] * feature.attributes[pDiamField] * feature.attributes[pLengthField];
					 pSurfaceArea = pSurfaceArea + 3.14 * feature.attributes[pDiamField] / 1000 * feature.attributes[pLengthField];
					 pAge = pAge + (currYear - feature.attributes[pYearField] + 1900) * feature.attributes[pLengthField];
				 });
				 pAge = (pAge/ calcPipeSumLength).toFixed(1);
				 calcPipeSumLength = (calcPipeSumLength * 2).toFixed(0);
				 pSurfaceArea = (pSurfaceArea * 2).toFixed(0);
				 pVolume = (pVolume * 2).toFixed(0);
				 statPipeSumLength = (statPipeSumLength * 2).toFixed(0);
				dom.byId('pLength').innerHTML= statPipeSumLength.substring(0,statPipeSumLength.length-3)+","+statPipeSumLength.substring(statPipeSumLength.length-3)+" 米";
				 dom.byId('pVolume').innerHTML=pVolume+" (吨Tons)";
				 dom.byId('pSurface').innerHTML=pSurfaceArea+" (平米M2)";
				 dom.byId('pAge').innerHTML=pAge+" (年 Year)";
				 domStyle.set(this.pipeResultsNode, 'display', 'none');



			//	this.pipeLength.innerHTML="hello";
				 // this.pipeVolume=pVolume;
				 //	 this.pipeSurfaceArea=pSurfaceArea;
				 //	 this.pipeLength=statPipeSumLength;

			 }, function (err) {
				 console.log(err.toLocaleString());
			 });

	},
    showQueryResult:function(){
			/*
			this.pipeAge.innerHTML = "管龄：" + "xxx"+ " 年";
			this.pipeVolume.innerHTML = "双管容积:" +"xxx" + " 立方米";
			this.pipeSurfaceArea.innerHTML = "双管表面积:" + "xxx" + " 平米";
			this.pipeLength.innerHTML = "双管长：" +"xxx" + " 米";
			*/
			alert("hello");
		}
	});
});