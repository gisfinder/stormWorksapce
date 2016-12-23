/*
* Copyright 2009 ESRI
*
* All rights reserved under the copyright laws of the United States
* and applicable international laws, treaties, and conventions.
*
* You may freely redistribute and use this sample code, with or
* without modification, provided you include the original copyright
* notice and use restrictions.
*
*See use restrictions at http://resources.esri.com/help/9.3/usagerestrictions.htm.
*/

//This application was developed by Sterling Quinn and Praveen Ponnusamy
// for a demo theater presentation at the 2009 ESRI International User 
// Conference: "Enhancing ArcGIS JavaScript Applications Using Dojo Dijits"

dojo.require("esri.map");
dojo.require("esri.tasks.query");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.charting.action2d.MoveSlice");
dojo.require("dojox.charting.Chart2D");
dojo.require("dojox.charting.action2d.Highlight");
dojo.require("dojox.charting.action2d.Tooltip");

//Global variables
var resizeTimer;
var map, navToolbar;
var selectedNeighborhood;
var neighborhoodSymbol, highlightSymbol;
var showingAllNeighborhoods = false;
var hoverGraphicsLayer = new esri.layers.GraphicsLayer();

//Initial extent copied from neighborhood service extent in Services Directory
var initialExtent = new esri.geometry.Extent(-117.28, 32.65, -116.99, 32.86, new esri.SpatialReference({
        wkid: 4326
    })); 
    
//Show map on page load
dojo.addOnLoad(init);

//Runs when the page loads
function init() {

    map = new esri.Map("mapDiv", { extent: initialExtent });
    	
	//Add the navigation toolbar
    navToolbar = new esri.toolbars.Navigation(map);

    //Register event listener for accordion container
    //Switch statement determines which pane the user selected
    var accordion = dijit.byId("myAccordionContainer");
    dojo.connect(accordion, "selectChild", function(childPane) {
        switch (childPane.id) {
            case "paneIncome":
                displayIncomeStats();
                break;
            case "paneEducation":
                displayEducationStats();
                break;
            case "paneRace":
                displayRaceStats();
                break;
        }
    });

    //Define symbol for unhighlighted neighborhoods
    neighborhoodSymbol = new esri.symbol.SimpleFillSymbol
                (esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol
                (esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                new dojo.Color([72, 61, 139, 0.7]), 3),
                new dojo.Color([72, 61, 139, 0.3]));

    //Define symbol for highlighted neighborhoods
    highlightSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([72, 61, 139, 0.70]), 3), new dojo.Color([72, 61, 139, 0.70]));
	
	//Do all of the following once the map has loaded
    dojo.connect(map, 'onLoad', function(theMap) {
        
        //Listen for resize of map div
        dojo.connect(dijit.byId('mapDiv'), 'resize', function() {
            resizeMap();
        });
        
        //Listen for neighborhood click
        dojo.connect(map, 'onClick', zoomToNeighborhoodExtent);
        
        //Add a graphics layer for hover highlights
        map.addLayer(hoverGraphicsLayer);

        //Listen for mouse hover over map's graphics layer
        // and highlight the current neighborhood using a
        // separate graphics layer
        dojo.connect(map.graphics, "onMouseOver", function(evt) {
            if (showingAllNeighborhoods == true) {
                hoverGraphicsLayer.clear();
                
                var highlightGraphic = new esri.Graphic(evt.graphic.geometry, highlightSymbol);
                hoverGraphicsLayer.add(highlightGraphic);
                
                //Set right pane title with neighborhood name
                dojo.byId('cellNeighborhoodName').innerHTML = "Click to visit " + evt.graphic.attributes.NAME;
               
            }
        });

        //Listen for mouse moving out of map's graphics layer and
        // clear neighborhood highlight
        dojo.connect(map.graphics, "onMouseOut", function(evt) {
            if (showingAllNeighborhoods == true) {
                hoverGraphicsLayer.clear();
                dojo.byId('cellNeighborhoodName').innerHTML = "Click a neighborhood";
            }
        });

        zoomToInitialExtent();

    });

    //Add the base map from ArcGIS Online. Adding this first layer loads
    // the map.
    var tiledUrl = "http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer";
    var tiledLayer = new esri.layers.ArcGISTiledMapServiceLayer(tiledUrl);
    map.addLayer(tiledLayer);
   
}


//"Starts over" by deselecting curren neighborhood and returning 
// to the initial extent
function zoomToInitialExtent() {
    dojo.byId('cellNeighborhoodName').innerHTML = "Click a neighborhood";
    selectedNeighborhood = null;
    updateAccordionPanes();
    addNeighborhoods();
    map.setExtent(initialExtent, true);
 
}


//Adds all neighborhoods to the map through a query
function addNeighborhoods() {
    //Create query task for the neighborhoods layer
    var queryTask = new esri.tasks.QueryTask("http://serverapps.esri.com/ArcGIS/rest/services/SanDiegoNeighborhoods/MapServer/0");

    //Build query filter
    var query = new esri.tasks.Query();
    query.returnGeometry = true;
    query.outSpatialReference = map.spatialReference;
    query.where = "1=1";

    //When the query completes, add the neighborhoods
    dojo.connect(queryTask, "onComplete", function(featureSet) {
        map.graphics.clear();
      
        //QueryTask returns a FeatureSet.  Loop through features 
        // in the FeatureSet and add them to the map.
        for (var i = 0, il = featureSet.features.length; i < il; i++) {
            //Get the current feature from the FeatureSet.
            //Feature is a graphic
            var graphic = featureSet.features[i];
            graphic.setSymbol(neighborhoodSymbol);

            //Add graphic to the map graphics layer.
            map.graphics.add(graphic);
        }

        showingAllNeighborhoods = true;
        
    });

    queryTask.execute(query);
}


//Zooms to clicked neighborhood
function zoomToNeighborhoodExtent(evt) {
    
    //Create a new query for the clicked neighborhood
    var queryClickedNeighborhoodTask = new esri.tasks.QueryTask("http://serverapps.esri.com/ArcGIS/rest/services/SanDiegoNeighborhoods/MapServer/0");
    var queryClickedNeighborhood = new esri.tasks.Query();
    queryClickedNeighborhood.returnGeometry = true;
    
    //On this query, get all the needed attributes for the charts
    queryClickedNeighborhood.outFields = ["NAME", "TOTPOP_CY", "RACEBASECY", "WHITE_CY", "BLACK_CY", "AMERIND_CY", "ASIAN_CY", "PACIFIC_CY", "OTHRACE_CY", "RACE2UP_CY", "HISPPOP_CY", "EDUCBASECY", "EDLT9_CY", "EDSMHS_CY", "EDHSGRD_CY", "EDCOLL_CY", "EDASSC_CY", "EDBACH_CY", "EDGRAD_CY", "HINCBASECY", "MEDHINC_CY", "INC_0_20", "INC_20_35", "INC_35_50", "INC_50_75", "INC_75_125", "INC_125_UP"];
    queryClickedNeighborhood.geometry = evt.mapPoint;  //query the clicked point
    
    //Removes other neighborhoods. 
    // Shows just the clicked neighborhood.
    dojo.connect(queryClickedNeighborhoodTask, "onComplete", function(featureSet) {

        //If a neighborhood wasn't clicked, don't do anything
        if (featureSet.features.length < 1) {
            return;
        }
        //If a neighborhood was clicked, do this...
        else {
            //Clear all the other neighborhoods
            map.graphics.clear();
            hoverGraphicsLayer.clear();

            //Add clicked neighborhood to map. 
            var graphic = featureSet.features[0];
            graphic.setSymbol(neighborhoodSymbol);
            map.graphics.add(graphic);
            selectedNeighborhood = graphic;

            //Helper method to get the extent of the graphic
            var neighborhoodExtent = esri.graphicsExtent([graphic]);

            //Zoom to the extent of the neighborhood graphic
            map.setExtent(neighborhoodExtent, true);
          
            //Put the neighborhood name in the right pane header
            dojo.byId('cellNeighborhoodName').innerHTML
               = graphic.attributes.NAME;
        }

        showingAllNeighborhoods = false;
        updateAccordionPanes();

    });

    queryClickedNeighborhoodTask.execute(queryClickedNeighborhood);
}


//Creates income chart
function displayIncomeStats() {
    var div = document.createElement("div");
    div.style.width = "300px";
    div.style.height = "200px";
    dijit.byId("paneIncome").setContent(div);
    
    //Null check for selected neighborhood
    if (selectedNeighborhood == null) {
        div.innerHTML = "Click a neighborhood to see statistics";
    }
    else {
        div.innerHTML = "";
        var attributes = selectedNeighborhood.attributes;

        var incMed, incBase, inc_0_20, inc_20_35, inc_35_50, inc_50_75, inc_75_125, inc_125_Up;

        //Argument 10 in parseInt functions means create a decimal 
        // number (base 10)
        incMed = parseInt(attributes.MEDHINC_CY, 10); 
        incBase = parseInt(attributes.HINCBASECY, 10); //Total pop for this statistic
        inc_0_20 = parseInt(attributes.INC_0_20, 10);
        inc_20_35 = parseInt(attributes.INC_20_35, 10);
        inc_35_50 = parseInt(attributes.INC_35_50, 10);
        inc_50_75 = parseInt(attributes.INC_50_75, 10);
        inc_75_125 = parseInt(attributes.INC_75_125, 10);
        inc_125_Up = parseInt(attributes.INC_125_UP, 10);

        //Histogram with maximum value half of population
        //Warning: This logic needs to be reworked if more
        // than 50% of population could be in any one category
        var maxTickVal = incBase / 2;

        //Chart requires this array of data
        var incDataSeries = [inc_0_20, inc_20_35, inc_35_50, inc_50_75, inc_75_125, inc_125_Up];

        //Create chart and draw it in div
        var chartInc = new dojox.charting.Chart2D(div);
        
        //Add an x axis, but don't show the ticks
        chartInc.addAxis("x", {
            labels: [
				        { value: 1, text: "0 - 20" },
				        { value: 2, text: "20 - 35" },
					    { value: 3, text: "35 - 50" },
					    { value: 4, text: "50 - 75" },
						{ value: 5, text: "75 - 125" },
						{ value: 6, text: "125+"}],
			majorTick: { length: 0 },
			minorTick: { length: 0 },
            natural: true
        });

        //Add a y axis, but don't show it
        //Failing to add the axis causes strange behavior
        chartInc.addAxis("y", {
            vertical: true,
            stroke: "white",
            fontColor: "white",
            majorTick: {length: 0},
	        minorTick: {length: 0},
            includeZero: true
        });

        //This defines the type of chart ("Columns")
        chartInc.addPlot("default",
	            { type: "Columns",
	                gap: 8,
	                font: "normal normal bold 8pt Tahoma",
	                fontColor: "black"
	            });

	    //Specify the data used in the chart and color of the 
        // columns.
	    chartInc.addSeries("Series A", incDataSeries, { stroke: { color: "steelblue" }, fill: "steelblue" });
	    
	    //Highlight the columns on hover
	    var anim1 = new dojox.charting.action2d.Highlight
	            (chartInc, "default", { highlight: "lightskyblue" });
	    var anim2 = new dojox.charting.action2d.Tooltip
	            (chartInc, "default");

	    chartInc.render();

	    //Add explanatory text below chart
	    var divExplText = document.createElement("div");
	    divExplText.innerHTML = "Annual income of neighborhood residents in thousands of dollars. (Median annual income for this neighborhood is <b>$" + incMed + "</b>.)";
	    dijit.byId("paneIncome").domNode.appendChild(divExplText);
    }
}


//Creates education chart
function displayEducationStats() {
    var div = document.createElement("div");
    div.style.width = "350px";
    div.style.height = "200px";
    dijit.byId("paneEducation").setContent(div);
    if (selectedNeighborhood == null) {
        div.innerHTML = "Click a neighborhood to see statistics";
    }
    else {
        div.innerHTML = "";
        var attributes = selectedNeighborhood.attributes;  
        
        var edubase, lths, hsgrad, smcoll, bach, grad;

        edubase = parseInt(attributes.EDUCBASECY, 10); //Total pop for this statistic
        lths = parseInt(attributes.EDLT9_CY, 10) +
                parseInt(attributes.EDSMHS_CY, 10);
        hsgrad = parseInt(attributes.EDHSGRD_CY, 10);
        //Assoc. degree considered "Some college"
        smcoll = parseInt(attributes.EDCOLL_CY, 10) +
                parseInt(attributes.EDASSC_CY, 10); 
        bach = parseInt(attributes.EDBACH_CY, 10);
        grad = parseInt(attributes.EDGRAD_CY, 10);

        //Warning: 1.5 is an arbitrary value that works for this
        // dataset. May need adjustment for other datasets where
        // one category contains a particularly large number of
        // people.
        var maxTickVal = edubase / 1.5;
          
        // Chart requires this array of data
        var dataSeries = [ lths, hsgrad, smcoll, bach, grad ];
                 
        // Create chart and draw it in div
        var chartEdu = new dojox.charting.Chart2D(div);
        
        //Add x axis but don't show it
        chartEdu.addAxis("x", { 
                fixLower: "none",
                fixUpper: "minor",
                stroke: "white",
                fontColor: "white",           
                max: maxTickVal,
                majorTick: { length: 0 },
                minorTick: { length: 0 }, 
                includeZero: true });

        //Add y axis with custom labels
        chartEdu.addAxis("y", {
                labels: [
				        { value: 1, text: "No high school diploma" },
					    { value: 2, text: "High school diploma" },
					    { value: 3, text: "Some college" },
						{ value: 4, text: "Bachelors degree" },
						{ value: 5, text: "Graduate degree"}],
				font: "normal normal bold 8pt Tahoma",
				fontColor: "black",
		        vertical: true,
                microTicks: false,
                minorTicks: false,
                majorTick: { stroke: "black", length: 1 }
         });
	   
	    //This defines the type of chart ("Bars")
	    chartEdu.addPlot("default",
	            { type: "Bars", 
	            gap: 4,
	            font: "normal normal bold 8pt Tahoma",
	            fontColor: "black"});

	    //Specify the data used in the chart and color of the bars
	            chartEdu.addSeries("Series A", dataSeries, { stroke: { color: "steelblue" }, fill: "steelblue" });
	    
	    //Highlight the bars on hover
	    var anim1 = new dojox.charting.action2d.Highlight
	            (chartEdu, "default", {highlight: "lightskyblue"});
	    var anim2 = new dojox.charting.action2d.Tooltip
	            (chartEdu, "default");
	    
	    chartEdu.render();
        
        //Add explanatory text below chart
	    var divExplText = document.createElement("div");
	    divExplText.innerHTML = "Education levels attained by neighborhood residents";
	    dijit.byId("paneEducation").domNode.appendChild(divExplText);

	}
    
}


//Creates race chart
function displayRaceStats() {
    var div = document.createElement("div");
    div.style.width = "300px";
    div.style.height = "225px";
    dijit.byId("paneRace").setContent(div);

    //Check to see if there's a neighborhood selected
    if (selectedNeighborhood == null) {
        div.innerHTML = "Click a neighborhood to see statistics";
    }
    else {
        div.innerHTML = "";
        var attributes = selectedNeighborhood.attributes;

        //Define race count variables
        var white, black, asian, amerind, pacific,
                hispanic, otherrace, race2Up, racebase;

        white = parseInt(attributes.WHITE_CY, 10);
        black = parseInt(attributes.BLACK_CY, 10);
        asian = parseInt(attributes.ASIAN_CY, 10);
        amerind = parseInt(attributes.AMERIND_CY, 10);
        pacific = parseInt(attributes.PACIFIC_CY, 10);
        otherrace = parseInt(attributes.OTHRACE_CY, 10);
        race2Up = parseInt(attributes.RACE2UP_CY, 10);
        hispanic = parseInt(attributes.HISPPOP_CY, 10);
        racebase = parseInt(attributes.RACEBASECY, 10);

        //"Other" in the chart is American Indian or Alaska Native,
        // plus Pacific Islander, plus Other
        var other = amerind + pacific + otherrace;

        // Calculate race percentages
        var whitePct = Math.round((white / racebase) * 100);
        var blackPct = Math.round((black / racebase) * 100);
        var asianPct = Math.round((asian / racebase) * 100);
        var otherPct = Math.round(((other) / racebase) * 100);
        var race2UpPct = Math.round((race2Up / racebase) * 100);
        var hispanicPct = Math.round((hispanic / racebase) * 100);

        //Define the chart properties
        var chartRace = new dojox.charting.Chart2D(div);
        chartRace.addPlot("default", {
            type: "Pie",
            font: "normal normal bold 8pt Tahoma",
            fontColor: "black",
            radius: 65,
            labelOffset: -25
        });

        //Add the data series to the chart
        //Note Latinos/Hispanics are distributed among
        // the categories below in the 2000 Census
        chartRace.addSeries("Series A", [
		{ y: white, text: "White", color: "powderblue", stroke: "black", tooltip: "White: " + white + " (" + whitePct + "%)" },
		{ y: black, text: "Black", color: "cadetblue", stroke: "black", tooltip: "Black: " + black + " (" + blackPct + "%)" },
		{ y: asian, text: "Asian", color: "cornflowerblue", stroke: "black", tooltip: "Asian: " + asian + " (" + asianPct + "%)" },
		{ y: other, text: "Other", color: "lightsteelblue", stroke: "black", tooltip: "Other: " + other + " (" + otherPct + "%)" },
		{ y: race2Up, text: "   2+ races", color: "dodgerblue", stroke: "black", tooltip: "2+ races: " + race2Up + " (" + race2UpPct + "%)"}]);

        //Add special effects and tooltip       
        var animMoveSlice = new dojox.charting.action2d.MoveSlice(chartRace, "default");
        var animHighlightSlice = new dojox.charting.action2d.Highlight(chartRace, "default");
        var animSliceTooltip = new dojox.charting.action2d.Tooltip(chartRace, "default");
        
        chartRace.render();

        //Add explanatory text below chart
        var divExplText = document.createElement("div");
        divExplText.innerHTML = "Racial makeup of neighborhood. (This neighborhood is <b>" + hispanicPct + "%</b> Hispanic/Latino.)";
        dijit.byId("paneRace").domNode.appendChild(divExplText);

    }
}


//Re-selects the selected accordion pane to force an update
function updateAccordionPanes() {
    var accordion = dijit.byId("myAccordionContainer");
    accordion.selectChild(accordion.selectedChildWidget);
}


//Handles resize of browser
function resizeMap() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        map.resize();
        map.reposition();
    }, 800);
}
