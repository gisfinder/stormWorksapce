define([
	'dojo/_base/declare',
	"dojo/aspect",
	"dojo/on",
	"dojo/dom-style",
	"dojo/dom",
	"dijit/registry",
	"dijit/ColorPalette",
	"dojo/_base/array",
	"dojo/promise/all",
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dojo/i18n!./PipeColorRamp/nls/resource',
	'dojo/_base/lang',
	'dojo/text!./PipeColorRamp/templates/PipeColorRamp.html',
	"esri/renderers/SimpleRenderer",
	"esri/Color",
	"esri/symbols/SimpleLineSymbol",
	"esri/dijit/Legend",
	"esri/layers/FeatureLayer",
	'dijit/form/Button',
	'dijit/form/DropDownButton',
	'dijit/ColorPalette',

	'xstyle/css!./PipeColorRamp/css/PipeColorRamp.css'
], function (declare,aspect,on, style,dom,registry,ColorPalette,array,all,_WidgetBase,_TemplatedMixin, _WidgetsInTemplateMixin,i18n,  lang,pipeTemplate,SimpleRenderer,Color,SimpleLineSymbol,Legend,FeatureLayer) {

	return declare([_WidgetBase,_TemplatedMixin, _WidgetsInTemplateMixin], {
		declaredClass: 'gis.digit.PipeColorRamp',
		templateString:pipeTemplate,
		i18n: i18n,
		ageResult:0,
		lengthResult:0,
		volumeResult:0,
		surfaceResult:0,
		postCreate: function () {
			this.inherited(arguments);
			this.fID = this.fLayerID;
			var thisYear=new Date().getYear();
			this.colorLayerURL=this.colorLayer;
			this.startYear=this.pipeStartYear;
			this.colored=false;
			this.legend=null;
			this.Kvalue="333";
			//	this.fLayer = this.map.getLayer(this.fID);
	//	    this.defaultRenderer=this.fLayer.renderer;

			this.sCp = registry.byId("startCp");
			this.eCp= registry.byId("endCp");
	//		on(dom.byId("btnColorPipe"),"click",this.startColor);
			aspect.after(this.sCp,"onChange",function(value ){
				console.log(this.value);
				style.set(dom.byId('colorSwatch'),{backgroundColor: this.value});
			});
			aspect.after(this.eCp,"onChange",function(value ){
				console.log(this.value);
				style.set(dom.byId('colorSwatch2'),{backgroundColor:this.value});
			});

		},
    //开始着色准备

		startColor: function () {
			this.pipeLayer= new FeatureLayer(this.colorLayerURL,{id:"pipeLayer"});
			var symbol2 = new SimpleLineSymbol();
			symbol2.setWidth(2.75);
			var renderer2 = new   SimpleRenderer(symbol2);
			renderer2.setColorInfo({
				field: "INSTALLYEAR",
				minDataValue:this.startYear,
				maxDataValue:new Date().getYear()+1900,
				colors: [ new Color(this.sCp.value),new Color(this.eCp.value)]

			});
			this.pipeLayer.setRenderer(renderer2);
            if(this.legend==null)
			{
			    this.legend = new Legend({
				    map: this.map,
				    layerInfos: [{ title: "管线着色", layer: this.pipeLayer}]
			     }, this.legendNode);
			}
			else
			    this.legend.layerInfos=[{ title: "管线着色", layer: this.pipeLayer}];
			this.legend.refresh();
          if(this.map.graphicsLayerIds.length==0)
			   this.map.addLayer(this.pipeLayer);
           else
		  {
			  this.map.getLayer("pipeLayer").setRenderer(renderer2);
			  this.map.getLayer("pipeLayer").redraw();
		  }
				this.legend.refresh();
		},
		mapColoring:function(){
			var symbol2 = new SimpleLineSymbol();
			symbol2.setWidth(2.75);
			var renderer2 = new   SimpleRenderer(symbol2);
			renderer2.setColorInfo({
				field: "INSTALLYEAR",
				minDataValue:this.startYear,
				maxDataValue:new Date().getYear()+1900,
				colors: [ new Color(this.sCp.value),new Color(this.eCp.value)]

			});
			this.fLayer.setRenderer(renderer2);
			this.fLayer.redraw();
			this.legend.refresh();
		},
		//删除管线着色图层
		clearResults: function () {
			this.map.removeLayer(this.map.getLayer("pipeLayer"));


		}
	});
});