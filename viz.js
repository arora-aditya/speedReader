var w = 800,
h = 800,
cx = w / 2,
cy = h / 2,
strokeColor = "#ffc000",

// variable for arc
arcStartAngle = 0,
arcInnerRadius = w / 2 - 20,
arcOuterRadius = w / 2 - 10,
startingAngle = 90,

// variable for circle
circleRadius = 15,
anglePoint = 0,

// variable for animate arc path
fullAngle = Math.PI * 2,
maxStep = 24 * 60,
anglePerStep = fullAngle / maxStep,
currentStep = 0,
animateDuration = 50
endAngle = 90

// variables for speed reader
maxWordsPerMinute = 1000
startFlag = false
global_text = " ";
;

// create main svg
var svg = d3.select("body").append("svg:svg")
.attr("width", w)
.attr("height", h)
.attr("id", "clock")
.on("click",playPause);

svg.append("svg:text")
.attr("x", w/2)
.attr("y", h/2)
.attr("dy", ".35em")
.attr("text-anchor", "middle")
.text("")
.attr("class","title")

svg.append("svg:text")
.attr("x", w/2 + 180)
.attr("y", h/2 + 100)
.attr("dy", ".35em")
.attr("text-anchor", "middle")
.text("dasf")
.attr("class","wpm")
.attr("id","wpm")

// create arc group
var arcGroup = svg.append("svg:g")
.attr(
      "transform",
      "translate(" + w / 2 + "," + h / 2 + ")"
      );

// create arc object (not display in svg,
// but use as data of path)
var arc = d3.arc()
.innerRadius(arcInnerRadius)
.outerRadius(arcOuterRadius)
.startAngle(arcStartAngle);

// create arc path
var arcPath = arcGroup.append("path")
.datum({
       endAngle: arcStartAngle
       })
.style("fill", strokeColor)
.attr("d", arc);

var circle = arcGroup.append("circle")
.attr("r", circleRadius)
.attr("fill", "#ffffff")
.attr("stroke", strokeColor)
.attr("stroke-width", circleRadius / 2 + 2)
.attr("cursor", "move")
.call(d3.drag().on('drag', function() {
                   a = findAngle(d3.event.x, d3.event.y);
                   if(startFlag === true){
                        restart();
                   }
                   currentStep = angleToStep(a);
                   setAngleStep(currentStep);
                   d3.select("#wpm")
                     .text(function(){return wpm();});
                   // moveCircle(a);
                   }));

d3.select(window).on("load", function() {
                     currentStep = angleToStep(startingAngle);
                     setAngleStep(currentStep);
                     circle.text(startingAngle/360 * 1000);
                     updateText();
                     d3.select("#wpm")
                       .text(function(){return wpm();});
                     // moveCircle(a);
                     });

// init
setAngleStep(currentStep);

// register scroll event
$('#clock').bind('mousewheel', function(e) {
                 if (e.originalEvent.wheelDelta < 0) {
                 currentStep--;
                 } else {
                 currentStep++;
                 }
                 
                 if (currentStep < 0) currentStep = 0;
                 if (currentStep > maxStep) currentStep = maxStep;
                 d3.select("#wpm")
                   .text(function(){return wpm();});
                 setAngleStep(currentStep);
                 });

$('.inc').click(function() {
                // currentStep++;
                currentStep = currentStep + 60;
                if (currentStep > maxStep) {
                currentStep = maxStep;
                return;
                }
                
                setAngleStep(currentStep);
                stop();
                if(startFlag !== false){
                    setTimeout(restart,1000);
                }
                d3.select("#wpm")
                  .text(function(){return wpm();});
                });

$('.dec').click(function() {
                // currentStep--;
                currentStep = currentStep - 60;
                if (currentStep < 0) {
                currentStep = 0;
                return;
                }
                
                setAngleStep(currentStep);
                stop();
                if(startFlag !== false){
                    setTimeout(restart,1000);
                }
                d3.select("#wpm")
                  .text(function(){return wpm();});
                });

//pause on spacebar press
$(document).on("keypress", function (e) {
                   if(e.which === 32){
                       if(startFlag === false){
                            start();
                       }
                       else{
                            stop();
                       }
                   }
               });

$(document).on("keydown", function (e) {
               console.log(e.which);
                   if(e.which === 37){
                       stop();
                       i -= 1
                       reader();
                        if(startFlag===true){
                            setTimeout(start,5000);
                        }
                   }
               });

// set animate step
function setAngleStep(step) {
    if (step > maxStep || step < 0)
        return;
    
    arcPath.transition()
    .duration(animateDuration)
    .call(
          arcTween,
          anglePerStep * step,
          arc
          );
}

// animate function
function arcTween(transition, newAngle, arc) {
    // arc path transition
    transition.attrTween("d", function(d) {
                         var interpolate = d3.interpolate(d.endAngle, newAngle);
                         return function(t) {
                         d.endAngle = interpolate(t);
                         
                         endAngle = d.endAngle / anglePerStep / 4
                         // transalte circle
                         anglePoint = Math.ceil(d.endAngle / anglePerStep) / 4;
                         
                         moveCircle(anglePoint);
                         
                         return arc(d);
                         };
                         });
}

function angleToStep(angle) {
    return angle * 4;
}

function stepToAngle(step) {
    return;
}

function findAngle(x, y) {
    addAngle = x < 0 ? 270 : 90;
    return (Math.atan(y / x) * 180 / Math.PI) + addAngle;
}

function moveCircle(angle) {
    var r = h / 2 - 15;
    var x = r * Math.sin(angle * Math.PI / 180);
    var y = -r * Math.cos(angle * Math.PI / 180);
    
    circle
    .attr("cx", x)
    .attr("cy", y);
}

var i = 0, time = 0;
function wpm(){
    wordsPerMinute = maxWordsPerMinute * (endAngle/360);
    return Math.ceil(wordsPerMinute);
}

function reader(){
    svg.select("text").text(global_text[i])
    i = i + 1
    if(i === global_text.length){
        stop();
    }
}

function stop(){
    if(startFlag === true){
        startFlag = false;
        clearTimeout(changeWordTimer)
    }
}

function start(time){
    if(startFlag != true){
    startFlag = true;
    time = time || Math.ceil(60000/wpm())
    changeWordTimer=setInterval(reader,time)
    }
}

function restart(){
    stop();
    start();
}

function replay(){
    if(startFlag === false){
        stop();
        i = 0;
        setTimeout(start(),5000);
    }
}

function playPause(){
    if(startFlag === false){
        start();
    }
    else{
        stop();
    }
}

function updateText(){
    stop();
    i = 0;
    global_text = document.getElementById("inputText").value;
    global_text = global_text.split(" ");
    global_text.unshift("Get","ready!","Here","we","go..");
    global_text.push("The End")
    svg.select("text").text(global_text[0])
}
console.log('[done]');
