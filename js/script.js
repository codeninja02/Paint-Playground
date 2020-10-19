

// Canvas & Basic

var database;

var drawing = [];
var prevDrawing = [[]];
var prevDrawingSequel = 0;
var currentPath = [];
var isDrawing = false;

var brushThickness = 4;
var canvasBackgroundColor = "#171920";
var strokeColor = "#cacdd7";

// ------------- PREVIEW

var hA = $("#userDrawingPreview2").height();
var wB = $("#userDrawingPreview2").width();

var simpleSketch = function(sketch){

  var x = 0;
  var y = 100;
  
  sketch.setup = function(){
    canvas2 = sketch.createCanvas(wB, hA);
    sketch.background("#ff0000");
  }

  sketch.draw = function(){

    sketch.background(canvasBackgroundColor);

    sketch.stroke(strokeColor);
    sketch.strokeWeight(brushThickness);
    sketch.noFill();
    for (var i = 0; i < drawing.length; i++) {
      var path = drawing[i];
      sketch.beginShape();
      try {
        for (var j = 0; j < path.length; j++) {
          sketch.vertex(path[j].x, path[j].y);
        }
      } catch (err) {
        
      }
      sketch.endShape();
    }

  }

};

var previewCanvasRef = new p5(simpleSketch, "userDrawingPreview2");

// ------------- PREVIEW

function setup() {
  let h1 = $(".canvas-main-container").height();
  let w1 = $(".canvas-main-container").width();

  

  canvas = createCanvas(w1, h1);

  stroke(strokeColor);

  canvas.mousePressed(startPath);
  canvas.touchStarted(startPath);

  canvas.parent('canvascontainer');

  canvas.mouseReleased(endPath);
  canvas.touchEnded(endPath);

  var saveButton = select('#saveButton');
  saveButton.mousePressed(saveDrawing);

  var clearButton = select('#clearButton');
  clearButton.mousePressed(clearDrawing);

  // Database

  var config = {
    apiKey: "<YOUR_API_KEY>",
    authDomain: '<AUTH_DOMAIN>',
    databaseURL: '<DATABASE_URL>',
    storageBucket: '<BUCKET>',
    messagingSenderId: '<SENDER_ID>'
  };

  firebase.initializeApp(config);
  database = firebase.database();

  var params = getURLParams();
  // console.log(params);
  if (params.id) {
    // console.log(params.id);
    showDrawing(params.id);
  }

  var ref = database.ref('drawings');
  ref.once('value', gotData, errData);
}

function startPath() {
  isDrawing = true;
  currentPath = [];
  drawing.push(currentPath);
}

function endPath() {
  isDrawing = false;

  // prevDrawing.push(drawing);
  // console.log(prevDrawing);

}

function draw() {
  background(canvasBackgroundColor);

  if (isDrawing) {
    var point = {
      x: mouseX,
      y: mouseY
    };
    currentPath.push(point);
  }

  stroke(strokeColor);
  strokeWeight(brushThickness);
  noFill();
  for (var i = 0; i < drawing.length; i++) {
    var path = drawing[i];
    beginShape();
    try {
      for (var j = 0; j < path.length; j++) {
        vertex(path[j].x, path[j].y);
      }
    } catch (err) {
      
    }
    endShape();
  }
}

// Firebase Stuff

function getDateString() {

  let today = new Date();
  let date = today.getDate();
  let monthRough = today.getMonth();
  let month;
  let year = today.getFullYear();

  if(monthRough == 0){
    month = "Jan";
  } else if(monthRough == 1){
    month = "Feb";
  } else if(monthRough == 2){
    month = "Mar";
  } else if(monthRough == 3){
    month = "Apr";
  } else if(monthRough == 4){
    month = "May";
  } else if(monthRough == 5){
    month = "Jun";
  } else if(monthRough == 6){
    month = "Jul";
  } else if(monthRough == 7){
    month = "Aug";
  } else if(monthRough == 8){
    month = "Sep";
  } else if(monthRough == 9){
    month = "Oct";
  } else if(monthRough == 10){
    month = "Nov";
  } else if(monthRough == 11){
    month = "Dec";
  }

  return date + " " + month + " " + year;

}

var snapshotVal;
var snapshotVal2;

function saveDrawing() {

  let db = firebase.database();
  let dbVal = db.ref("drawings");

  // ------------------

  let db2 = firebase.database();
  let dbVal2 = db2.ref("drawings");

  let data = {
    name: $("#nameInput1").val(),
    drawing: drawing,
    date: getDateString(),
    stroke: strokeColor,
    bg: canvasBackgroundColor,
    thickness: brushThickness
  };

  function dataSent(err, status) {
    // console.log(status);
  }

  let result = dbVal2.push(data, dataSent);

  dbVal.on("value", function(snapshot) {

    snapshotVal = snapshot.val();
    snapshotVal = Object.keys(snapshotVal);

    

    if(snapshot.numChildren() > 8){

      let totalNumberOfKeys = snapshot.numChildren();
      let totalNumberOfKeys2 = snapshot.numChildren() - 8;

      for(let i = 0; i < totalNumberOfKeys2; i++){

        // console.log(i);

        let db3 = firebase.database();
        let dbVal3 = db3.ref("drawings");
        dbVal3.child(snapshotVal[0]).remove();
          
      }
      
    }

  }, function (errorObject) {

    console.log("The read failed: " + errorObject.code);

  });

}

function gotData(data) {

//   // clear the listing
//   var elts = selectAll('.listing');
//   for (var i = 0; i < elts.length; i++) {
//     elts[i].remove();
//   }

// //   console.log(data.val());
  

//   var drawings = data.val();
//   var keys = Object.keys(drawings);
//   for (var i = 0; i < keys.length; i++) {
//     var key = keys[i];
//     //console.log(key);
//     var li = createElement('li', '');
//     li.class('listing');
//     var ahref = createA('#', key);
//     ahref.mousePressed(showDrawing);
//     ahref.parent(li);

//     var perma = createA('?id=' + key, 'permalink');
//     perma.parent(li);
//     perma.style('padding', '4px');

//     li.parent('drawinglist');
//   }

}

function errData(err) {
  console.log(err);
}

function showDrawing(key) {
  //console.log(arguments);
  if (key instanceof MouseEvent) {
    key = this.html();
  }

  var ref = database.ref('drawings/' + key);
  ref.once('value', oneDrawing, errData);

  function oneDrawing(data) {
    var dbdrawing = data.val();
    drawing = dbdrawing.drawing;
    //console.log(drawing);
  }
}

function clearDrawing() {
  drawing = [];
}

// Pickr Setup

const pickr = Pickr.create({
  el: '.pickrContainer-2',
  theme: 'nano', // or 'monolith', or 'nano'

  swatches: [
      'rgb(23 25 32)',
      'rgb(176 190 197)',
      'rgb(96 125 139)',
      'rgb(244 67 54)',
      'rgb(156 39 176)',
      'rgb(103 58 183)',
      'rgb(63 81 181)',
      'rgb(33 150 243)',
      'rgb(0 150 136)',
      'rgb(76 175 80)',
      'rgb(255 235 59)',
      'rgb(255 152 0)',
      'rgb(255 152 0)',
      'rgb(255 255 255)'
  ],

  components: {

      // Main components
      preview: true,
      opacity: false,
      hue: true,

      // Input / output Options
      interaction: {
          hex: true,
          rgba: false,
          hsla: false,
          hsva: false,
          cmyk: false,
          input: false,
          clear: false,
          save: false
      }
  }
});

// Custom SLider (Thanks to Good_Bits)

let stylesheetText = `
#slider-container {
    --value : 0 ;
    --slider-track-color : #B0EFEF45 ;
    --slider-thumb-color : #fff ;
    --slider-fill-color  : #31D3C6 ;
    --slider-fill2-color : #00A2BB ;

    width : 100% ;
    height: 1rem ;
    display: flex ;
    align-items: center ;
    justify-content: center ;
    padding: 0 ;
    margin: 0 ;

    animation: color-cycle 1s infinite alternate linear;
}

@keyframes color-cycle {
    0% {
        --slider-fill-color  : #037fe2 ;
    }
    100% {
        --slider-fill-color : #037fe2 ;
    }
}

#slider {
    -webkit-appearance: none;
    appearance: none;

    height: 1rem ;
    width: 100% ;
    margin : 0 ;
    padding: 0 ;

    background-color: #00000000 ;
    outline: none ;
    z-index: 99 ;
}

#slider-track {
    position: absolute ;
    top: calc(50% - 0.25rem);
    left: 0 ;
    width: 100% ;
    height: 0.5rem ;
    border-radius: 0.25rem ;
    background-color: #303644 ;
    overflow: hidden ;
}

#slider-track::before {
    position: absolute ;
    content: "" ;
    left: calc(-100% + 1.5rem) ;
    top : 0 ;
    width : calc(100% - 1rem) ;
    height: 100% ;
    background-color: var(--slider-fill-color) ;
    transition: background-color 300ms ease-out ;
    transform-origin: 100% 0%;
    transform: translateX(calc( var(--value) * 100% )) scaleX(1.2);
}

#slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width : 1rem ;
    height: 1rem ;
    border-radius: 50% ;
    background-color: var(--slider-thumb-color) ;
    cursor: pointer ;
    z-index: 99 ;
    border: 3px solid var(--slider-fill-color) ;
    transition: border-color 300ms ease-out ;
}

#value {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: calc( var(--value) * calc(100% - 1rem) - 0.0rem);
  font-size: 10px;
  min-width: 2ch;
  max-height: 2ch;
  border-radius: 4px;
  pointer-events: none;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF;
  background-color: #037fe2;
  opacity: 1;
  transform: translateX(calc(-50% + 0.5rem));
  transition: left 300ms ease-out , opacity 300ms 300ms ease-out , background-color 300ms ease-out;
  z-index: 1;
}

#value::before {
  position: absolute;
  content: "";
  top: 100%;
  left: 50%;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 2px;
  background-color: inherit;
  transform: translate(-50%,-80%) rotate(45deg);
  z-index: -1;
}

#slider-container:hover  #value {
    opacity: 1 ;
} 
` ;

var thickness;

class customSlider extends HTMLElement {
    constructor(){
        super();
        this.value = parseFloat(this.getAttribute("value")) || 0;
        this.min   = parseFloat(this.getAttribute("min"))   || 0;
        this.max   = parseFloat(this.getAttribute("max"))   || 100;
        this.step  = parseFloat(this.getAttribute("step"))  || 1;
        

        this.style.minWidth = "10rem" ;
        this.style.minHeight = "1rem" ;
        this.style.position = "relative" ;

        // Slider Element
        this.root = this.attachShadow({mode:"open"}) ;

        // Functionality
        this.dragging = false ;

        this.create();
        this.update();
    }

    create(){
        let slider   = document.createElement("input") ;
        let sliderContainer = document.createElement("div");
        let sliderTrack = document.createElement("div");
        let value = document.createElement("div");
        let style = document.createElement("style") ;
        style.innerHTML = stylesheetText ;

        // set properties
        slider.type = "range" ;
        slider.id = "slider" ;
        slider.min = this.min ;
        slider.max = this.max ;
        slider.step = this.step ;
        slider.value = this.value ;

        // add ids
        sliderContainer.id = "slider-container" ;
        sliderTrack.id = "slider-track" ;
        value.id = "value" ;

        // add event listeners
        slider.addEventListener("input",this.update.bind(this));

        // Appened Elements
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(value);
        sliderContainer.appendChild(sliderTrack);
        this.root.appendChild(style);
        this.root.appendChild(sliderContainer);
    }

    update(){
        let track  = this.root.getElementById("slider-container");
        let slider = this.root.getElementById("slider");
        let value = this.root.getElementById("value");
        let valuePercentage = slider.value / (this.max-this.min) ;
        value.innerText = slider.value ;
        track.style.setProperty("--value",valuePercentage);
        thickness = slider.value;
        brushThickness = thickness;
    }


}

window.onload = () => {
    customElements.define('custom-slider', customSlider );
}

// Functionality

var currentColorMode = 0;

$("#aboutScreen").fadeOut(0);
$("#galleryScreen").fadeOut(0);
$("#goBackTOMENUopts2").fadeOut(0);
$("#chooseColor").fadeOut(0);
$("#setThickness").fadeOut(0);
$("#alert1").fadeOut(0);

$("#sideMenuMain").fadeOut(0).css({"height": "0px", "width": "calc(0px)"});

$(".home2BtnsAll").on("click", function(e){
  $(this).animate(
    { opacity: 0 }, 40 , function(){
      $(this).animate({
        opacity: 1
      })
    });
});

function showBasicHome(){

  currentColorMode = 0;

  $("#CSB1").css({"color": "#a8a7ad"});
  $("#CSB2").css({"color": "#a8a7ad"});
  $("#CSB3").css({"color": "#a8a7ad"});
  $("#CSBA").css({"border": "2px solid #6b738a"});
  $("#CSBB").css({"border": "2px solid #6b738a"});
  $("#CSBC").css({"border": "2px solid #6b738a", "background": "#6b738a"});
  $("#aboutScreen").fadeOut(0);
  $("#galleryScreen").fadeOut(0);

  $("#impCont1").removeClass("edit-tools").removeClass("edit-tools-3").addClass("edit-tools-2");
  $("#bottomOptionsCont").delay(300).fadeIn(200);

  $(".fex__1").removeClass("fex__3");
  $(".fex__2").removeClass("fex__4");

  // $("#impCont1").removeClass("et____bg-b-2");

  $("#chooseColor").fadeOut(100);
  $("#setThickness").fadeOut(100);

}

function showAboutScreen(){
  $("#impCont1").removeClass("edit-tools").removeClass("edit-tools-2").addClass("edit-tools-3");
  $("#bottomOptionsCont").fadeOut(100);

  $("#galleryScreen").fadeOut(0);
  $("#aboutScreen").delay(300).fadeIn(300);

  $(".fex__1").addClass("fex__3");
  $(".fex__2").addClass("fex__4");

  // $("#impCont1").addClass("et____bg-b-2");
}

function showCodeGallery(){
  $("#impCont1").removeClass("edit-tools").removeClass("edit-tools-2").addClass("edit-tools-3");
  $("#bottomOptionsCont").fadeOut(100);

  $("#aboutScreen").fadeOut(0);
  $("#galleryScreen").delay(300).fadeIn(300);

  $(".fex__1").addClass("fex__3");
  $(".fex__2").addClass("fex__4");

  // $("#impCont1").addClass("et____bg-b-2");
}

$("#aboutBtn").on("click", function(){
  showAboutScreen();
});

$("#codeGalleryOpenBtn").on("click", function(){
  showCodeGallery();
});

$("#clearCanvasBtn").on("click", function(){
  clearDrawing();
});

$(".goBackToBasic2").on("click", function(){
  showBasicHome();
});

$("#nameInput1").focus(function(){
  var that = this;
  setTimeout(function(){ that.selectionStart = that.selectionEnd = 10000; }, 0);

  // $("#impCont1").hide();
  // $("#bottomToolsContainer").hide();
  // $("#bottomSubmitCanvasBTN").hide();
});

$("#nameInput1").focusout(function(){
  $("#nameInput1").attr("disabled", true);

  $("#impCont1").show();
  $("#bottomToolsContainer").show();
  $("#bottomSubmitCanvasBTN").show();
});

$("#editNameBtn1").on("click", function(){
  
  $("#nameInput1").removeAttr("disabled");
  $("#nameInput1").focus();

});


var _originalSize = $(window).width() + $(window).height()
$(window).resize(function(){

  if($(window).width() + $(window).height() != _originalSize){

    // Keyboard Visible
    $("#impCont1").hide();
    $("#bottomToolsContainer").hide();
    $("#bottomSubmitCanvasBTN").hide();
    $(".copyright_link").css("position","relative");  

  }else{

    // Keyboard Not Visible
    $("#nameInput1").attr("disabled", true);
    $("#impCont1").show();
    $("#bottomToolsContainer").show();
    $("#bottomSubmitCanvasBTN").show();
    $(".copyright_link").css("position","fixed"); 

  }

});

$("#goBackTOMENUopts2").on("click", function(){
  showBasicHome();
  $("#goBackTOMENUopts2").fadeOut(100);
});

$("#colorSBtn").on("click", function(){

  $("#CSB1").css({"color": "#a8a7ad"});
  $("#CSB2").css({"color": "#a8a7ad"});
  $("#CSB3").css({"color": "#a8a7ad"});
  $("#CSBA").css({"border": "2px solid #6b738a"});
  $("#CSBB").css({"border": "2px solid #6b738a"});
  $("#CSBC").css({"border": "2px solid #6b738a", "background": "#6b738a"});
  $("#CSB1").css({"color": "white"});
  $("#CSBA").css({"border": "2px solid white"});
  $("#setThickness").fadeOut(0);

  if(currentColorMode == 2 || currentColorMode == 4 || currentColorMode == 6){
    $("#chooseColor").fadeOut(100).delay(100).fadeIn(250);
  }

  currentColorMode = 2;

  $("#impCont1").removeClass("edit-tools-3").removeClass("edit-tools-2").addClass("edit-tools");

  $("#bottomOptionsCont").fadeOut(100);
  $("#goBackTOMENUopts2").fadeIn(200);

  $("#chooseColor").delay(250).fadeIn(250);

});

$("#backgroundSBtn").on("click", function(){
  
  $("#CSB1").css({"color": "#a8a7ad"});
  $("#CSB2").css({"color": "#a8a7ad"});
  $("#CSB3").css({"color": "#a8a7ad"});
  $("#CSBA").css({"border": "2px solid #6b738a"});
  $("#CSBB").css({"border": "2px solid #6b738a"});
  $("#CSBC").css({"border": "2px solid #6b738a", "background": "#6b738a"});
  $("#CSB2").css({"color": "white"});
  $("#CSBB").css({"border": "2px solid white"});
  $("#setThickness").fadeOut(0);

  if(currentColorMode == 2 || currentColorMode == 4){
    $("#chooseColor").fadeOut(100).delay(100).fadeIn(250);
  }

  currentColorMode = 4;

  $("#impCont1").removeClass("edit-tools-3").removeClass("edit-tools-2").addClass("edit-tools");

  $("#bottomOptionsCont").fadeOut(100);
  $("#goBackTOMENUopts2").fadeIn(200);

  $("#chooseColor").delay(250).fadeIn(250);

});

$("#thicknessSBtn").on("click", function(){

  
  $("#CSB1").css({"color": "#a8a7ad"});
  $("#CSB2").css({"color": "#a8a7ad"});
  $("#CSB3").css({"color": "#a8a7ad"});
  $("#CSBA").css({"border": "2px solid #6b738a"});
  $("#CSBB").css({"border": "2px solid #6b738a"});
  $("#CSBC").css({"border": "2px solid #6b738a", "background": "#6b738a"});
  $("#CSB3").css({"color": "white"});
  $("#CSBC").css({"border": "2px solid white", "background": "white"});
  $("#chooseColor").fadeOut(0);

  currentColorMode = 6;

  $("#impCont1").removeClass("edit-tools-3").removeClass("edit-tools-2").addClass("edit-tools");

  $("#bottomOptionsCont").fadeOut(100);
  $("#goBackTOMENUopts2").fadeIn(200);

  $("#setThickness").delay(250).fadeIn(250);

});

$(".color-c:not(.color-c:first-child)").on("click", function(e){

  if(currentColorMode == 2){
    strokeColor = $(this).css("background-color");
  }

  if(currentColorMode == 4){

    // console.log($(this).css("background-color").replace(")", " / " + "0.1)").replace(",", "").replace(",", "").replace(",", ""));
    

    canvasBackgroundColor = $(this).css("background-color");
    $("#previewCanvasBorder2").css("border", "2px solid " + $(this).css("background-color"));
    $("#previewCanvasBorder2").css("background-color", $(this).css("background-color").replace(")", " / " + "0.1)").replace(",", "").replace(",", "").replace(",", ""));


  }

});

$(".color-c:nth-child(1)").on("click", function(e){

  $(".pcr-button").click()

});

// -------------------

var colorcode = "rgba(0, 0, 0, 0.74)";

var finalCode = rgba2hex(colorcode)

function rgba2hex(orig) {
  var a, isPercent,
    rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = (rgb && rgb[4] || "").trim(),
    hex = rgb ?
    (rgb[1] | 1 << 8).toString(16).slice(1) +
    (rgb[2] | 1 << 8).toString(16).slice(1) +
    (rgb[3] | 1 << 8).toString(16).slice(1) : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = 01;
  }
  // multiply before convert to HEX
  a = ((a * 255) | 1 << 8).toString(16).slice(1)
  hex = hex + a;

  return hex;
}

function test(colorcode) {
  console.log(rgba2hex(colorcode));
}

// -------------------

pickr.on('change', instance => {

  // "#" + rgba2hex(instance.toRGBA().toString(0))

  if(currentColorMode == 2){
    strokeColor = "#" + rgba2hex(instance.toRGBA().toString(0));
  }

  if(currentColorMode == 4){
    canvasBackgroundColor = "#" + rgba2hex(instance.toRGBA().toString(0));
    $("#previewCanvasBorder2").css("border", "2px solid " + "#" + rgba2hex(instance.toRGBA().toString(0)));
    $("#previewCanvasBorder2").css("background-color", rgba2hex(instance.toRGBA().toString(0)).replace(")", " / " + "0.1)").replace(",", "").replace(",", "").replace(",", ""));
    // console.log(rgba2hex(instance.toRGBA().toString(0)).replace(")", " / " + "0.1)").replace(",", "").replace(",", "").replace(",", ""));
  }

});


pickr.on('hide', instance => {

  $(".superbody-1").animate({ opacity: 1});

}).on('show', (color, instance) => {

  $(".superbody-1").animate({ opacity: 0.6});
  
});

$("#sendBtn2").on("click", function(){

  // $(".superbody-1").animate({ opacity: 0}, 200);
  $("#super2").removeClass("superbody-2").addClass("superbody-2-B");
  setTimeout(function(){
    showBasicHome();
  }, 200);

});

$("#goBackToHomeAB60").on("click", function(){

  // $(".superbody-1").animate({ opacity: 1}, 200);
  $("#super2").removeClass("superbody-2-B").addClass("superbody-2");

});

$("#nameInput1").on("change keyup paste", function(){
  $("#nameValueB").text( $("#nameInput1").val() );
});

$("#editNameBB").on("click", function(){
  $("#super2").removeClass("superbody-2-B").addClass("superbody-2");
  $("#nameInput1").removeAttr("disabled");
  $("#nameInput1").delay(200).focus();
  showBasicHome();
});

$("#alertCrossBtnCC").on("click", function(e) {
  $("#alert1").fadeOut(400);
  $(".alert--icon").css("transform", "rotate(180deg)");
});

var uploadedDrawing;

$("#uploadCanvasBtn").on("click", function(e){

  if($("#nameInput1").val() == ""){

    $("#super2").removeClass("superbody-2-B").addClass("superbody-2");
    $("#nameInput1").removeAttr("disabled");
    $("#nameInput1").delay(200).focus();

  } else {

    // uploadedDrawing = drawing;

    // $(".alert--icon").css("transform", "rotate(0deg)");
    // $("#alert1").fadeIn(400);
    // $("#uploadingTxt1").fadeIn(0);
    // $("#uploadingTxt2").fadeOut(0);
    // $("#uploadIconTxt1").fadeIn(0);
    // $("#uploadIconTxt2").fadeOut(0);

    if(uploadedDrawing == drawing){

      $(".alert--icon").css("transform", "rotate(0deg)");
      $("#alert1").fadeIn(400);
      $("#uploadingTxt1").fadeIn(0);
      $("#uploadingTxt2").fadeOut(0);
      $("#uploadIconTxt1").fadeIn(0);
      $("#uploadIconTxt2").fadeOut(0);

    } else{

      saveDrawing();
      $(".alert--icon").css("transform", "rotate(0deg)");
      $("#alert1").fadeIn(400);
      $("#uploadingTxt1").fadeOut(100);
      $("#uploadingTxt2").delay(100).fadeIn(200);
      $("#uploadIconTxt1").fadeOut(100);
      $("#uploadIconTxt2").delay(100).fadeIn(200);

      uploadedDrawing = drawing;

    }

  }

});

$("#openSideMenuIcon").on("click", function(e) {

  if($("#sideMenuMain").height() == 0) {
    $("#sideMenuMain").fadeIn(40).css({"height": "280px", "width": "calc(100% - 40% - 20px)"});
  } else {
    $("#sideMenuMain").css({"height": "0px", "width": "calc(0px)"}).delay(200).hide(20);
  }

});

$("#closeSideMenuBB").on("click", function(e) {
  e.preventDefault();
  $("#sideMenuMain").css({"height": "0px", "width": "calc(0px)"}).delay(200).hide(20);
});

$("#clearCanvasDD").on("click", function(e) {
  e.preventDefault();
  $("#sideMenuMain").css({"height": "0px", "width": "calc(0px)"}).delay(200).hide(20);
  clearDrawing();
});

$("#publicGalleryDD").on("click", function(e) {
  e.preventDefault();
  $("#sideMenuMain").css({"height": "0px", "width": "calc(0px)"}).delay(200).hide(20);
  showCodeGallery();
});

$("#goFromGalleryToBasic4").on("click", function(e) {
  showBasicHome();
});

$("#scrollCheckDDDD").css("box-shadow", "rgb(26 29 37) 20px 20px 50px 10px inset");

$("#scrollCheckDDDD").scroll(function () {

  // $("#scrollCheckDDDD").css("box-shadow", "20px 20px 50px 10px #222630 inset");

  if($(this).scrollTop() == 0){
    $(".goBackToBasic4").css("box-shadow", "rgb(0 0 0) 0px 0px 0px");
  } else {
    $(".goBackToBasic4").css("box-shadow", "rgb(0 0 0) 6px 6px 8px");
  }
  
});

// Creating Gallery Canvases

var hA8 = $("#canvascontainer").height();
var wA8 = $("#canvascontainer").width();

var simpleSketch2 = function(sketch){
  
    let elementIndex = parseInt((sketch._userNode).substring(10, 11)) - 1;
    // console.log(publicCanvasObj["drawing" + elementIndex]);

    // console.log(["drawing" + elementIndex]);
    
    sketch.setup = function(){
      canvas2 = sketch.createCanvas(wA8, 300);
      // sketch.background("#ff0000");
    }

    // console.log(path.length);
    

    sketch.draw = function(){

      sketch.background(publicCanvasObj["bg" + elementIndex]);
      sketch.stroke(publicCanvasObj["stroke" + elementIndex]);
      sketch.strokeWeight(publicCanvasObj["thickness" + elementIndex]);
      sketch.noFill();
      
      // console.log(publicCanvasObj["drawing" + elementIndex][i]);
      

      try {
        for (var i = 0; i < publicCanvasObj["drawing" + elementIndex].length; i++) {
          var path = publicCanvasObj["drawing" + elementIndex][i];
          sketch.beginShape();
          
          try {
            
            for (var j = 0; j < path.length; j++) {
              sketch.vertex(path[j].x, path[j].y);
            }
            
          } catch (e) {
            
          }
  
          sketch.endShape();
        }
      } catch (err) {
        
      }

    }

};

// Cr--Ga--Ca------------

var gD;
var gD2;
var snapshotVal8;
var publicCanvasObj = {};

var colorList = ["#695ce5", "#d1657b", "#2eade1", "#598392", "#c65985", "#33b262", "#2d8bb4", "#f85c69", "#f39428", "#F95738", "#4CAF50", "#8f46fc"];
// console.log(colorList[Math.floor(Math.random() * colorList.length)]);

$("#userLoadingContainer8").fadeIn(0);
$("#scrollCheckDDDD").fadeOut(0);

function showPublicCanvas(){

  $("#scrollCheckDDDD").fadeOut(400);
  $("#userLoadingContainer8").delay(400).fadeIn(400);

  $(function(){

    var ref = database.ref('drawings');
    ref.once('value', function(data){
  
      var gotData = data.val();
      var gotKeys = Object.keys(gotData);
  
      gD = gotKeys;
      gD2 = data.val();
  
      for(let i = 0; i < 8; i++) {
  
        publicCanvasObj["name" + i] = gD2[gD[i]].name;
        publicCanvasObj["drawing" + i] = gD2[gD[i]].drawing;
        publicCanvasObj["date" + i] = gD2[gD[i]].date;
        publicCanvasObj["stroke" + i] = gD2[gD[i]].stroke;
        publicCanvasObj["bg" + i] = gD2[gD[i]].bg;
        publicCanvasObj["thickness" + i] = gD2[gD[i]].thickness;
  
        var previewCanvasRef2 = new p5(simpleSketch2, "userCanvas" + (i + 1)); 
        
        // console.log(i);      
        
        $(`.users-canvas-container-HH:nth-child(${i + 1}) .user-canvas-info-BOX .user-canvas-name-HH .user-canvas-time-HH-B`).text(publicCanvasObj["name" + i]);
        
        $(`.users-canvas-container-HH:nth-child(${i + 1}) .user-canvas-info-BOX .user-canvas-name-HH .user-canvas-time-HH`).text(publicCanvasObj["date" + i]);
        
        $(`.users-canvas-container-HH:nth-child(${i + 1}) .user-canvas-info-BOX .user-profile-HH`).text((publicCanvasObj["name" + i]).substring(0, 1));
  
        $(`.users-canvas-container-HH:nth-child(${i + 1}) .user-canvas-info-BOX .user-profile-HH`).css({"background": colorList[Math.floor(Math.random() * colorList.length)]});
  
        $(`.user-canvas-info-BOX:nth-child(${i + 1}) .user-canvas-info-BOX .user-canvas-btn-HH .user-canvas-BTN-HH-BTN`).on("click", function(e){
          console.log(publicCanvasObj["drawing" + i]);
          
          drawing = publicCanvasObj["drawing" + i];
        });
  
        $(`.users-canvas-container-HH:nth-child(${i + 1}) .user-canvas-BTN-HH-BTN`).on("click", function(e){
          drawing = publicCanvasObj["drawing" + i];
          canvasBackgroundColor = publicCanvasObj["bg" + i];
          strokeColor = publicCanvasObj["stroke" + i];
          brushThickness = publicCanvasObj["thickness" + i];
          showBasicHome();
        });
  
      }
      
      $("#userLoadingContainer8").fadeOut(400);
      setTimeout(function(){
        $("#scrollCheckDDDD").fadeIn(400);
      }, 600)
  
    }, function(err){
      console.log(err);
    });

  });

}

$("#thisIsRefreshBTNmain").on("click", function(){
  showPublicCanvas();
});

$(function(){
  setTimeout(function(){
    showPublicCanvas();
  }, 3000);
});

// var previewCanvasRef2 = new p5(simpleSketch2, "userCanvas1");

// Splash Screen

// $(".splash-screen-1")


// setTimeout(function(){
//   $(".spash-box").css({"filter": "blur(100px)"});
// }, 2400);

setTimeout(function(){
  $(".splash-screen-1").css({"left": "100%"});
}, 2600);

// setTimeout(function(){
//   $(".splash-screen-1").fadeOut(100);
// }, 2800);