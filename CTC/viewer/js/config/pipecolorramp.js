define({
	map: true,
	identifyLayerInfos:true,
	layerUrl: "http://10.50.51.67:6080/arcgis/rest/services/hrb/hrbPipe_2015/MapServer/5",
	colorLayer: "http://10.50.51.67:6080/arcgis/rest/services/hrb/hrbPipe_2016_feature/MapServer/2",
	fLayerID:"管线",
	diamField:"NOMINAL_DIAM",  //管径字段
	pipeLengthField:"SHAPE.len", //管长字段
	pipeConstructYearField:"INSTALLYEAR", //安装年份字段
	pipeStartYear:2007
});