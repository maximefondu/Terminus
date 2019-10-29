"use strict";
var c = 0;
let speedBus = 40;
let booleanStart;
sessionStorage.setItem('mute', 'false');

//FOLLOW
function follow(trajet, bus){
  let line = document.querySelector(trajet);
  let elementSelected = document.querySelector('.'+line.getAttribute('class')+' .selected');
  var path = anime.path(elementSelected);
  
  let tabl = [];
  for (let i = 0; i < line.children.length; i++) {
    tabl.push(line.children[i]);
  }
  let c = tabl.indexOf(elementSelected);  

  elementSelected.style.opacity='1';

  let time = elementSelected.getTotalLength();

  if (c == 0) {
    showPanel(line, c, '.infos__currentStop--');
    showPanel(line, c+1, '.infos__nextStop--');
  }
  if (c > 0) {
    booleanStart = true;
    sound();
  }
  createWay(elementSelected, time, bus);

  let animationBus = anime({
    targets: bus,
    translateX: path('x'),
    translateY: path('y'),
    rotate: path('angle'),
    duration: time*speedBus,
    easing: 'easeInOutSine',
    autoplay: booleanStart,
    complete: function() {
      elementSelected.classList.remove('selected');
      c++;
      showPanel(line, c, '.infos__currentStop--');
      showPanel(line, c+1, '.infos__nextStop--');
      if (c < line.children.length) {
        line.children[c].classList.add('selected');
        setTimeout(() => { 
          follow(trajet, bus);
        }, 3000);
      }
    },
    update: function(){
      let nameClass = bus.slice(4);

      if (nameClass != 1) {
        let element = document.querySelector('.number--'+nameClass);
        let bar = document.querySelector('.bar--'+nameClass);

        let attr = document.querySelector('.bus'+nameClass).getAttribute('style').slice(0, -20);

        element.setAttribute('style', attr+'rotate(0deg)');
        bar.setAttribute('style', attr+'rotate(0deg)');
      }
    }
  });
  let busElement = document.querySelector(bus);
  busElement.animationBus = animationBus;
}

//CREATE WAY
function createWay(way, time, bus){
  let animationWay = anime({
    targets: way,
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: 'easeInOutSine',
    duration: time*speedBus,
    autoplay: booleanStart
  });
  
  let wayElement = document.querySelector(bus);
  wayElement.animationWay = animationWay;
}





//SHOW PANELS
function showPanel(line, c, classParent){
  let id;
  let nameClass = line.getAttribute('class');
  let element = document.querySelector('.stop'+nameClass.slice(5)); 

  if (c < element.children.length) {
    let child = element.children[c];  
    id = child.getAttribute('id');
  }

  if (c > element.children.length) {
    document.querySelector(classParent+nameClass.slice(11)).parentNode.remove();
  }else if(c == element.children.length){
    document.querySelector(classParent+nameClass.slice(11)).innerHTML='Terminus';
  }else if(nameClass.slice(11) == 1){
    fetch('assets/namourette.json')
    .then(result =>{
      return result.json();
    })
    .then(data =>{
      let currentStop = data.results[c].name;
      document.querySelector(classParent+nameClass.slice(11)).innerHTML=currentStop;
    });
  }else{
    fetch('https://public.opendatasoft.com/api/records/1.0/search/?dataset=poteaux-tec&lang=fr&rows=50&facet=arrondissement&facet=canton&facet=commune&refine.pot_id='+id)
    .then(result =>{
      return result.json();
    })
    .then(data =>{
      let currentStop = data.records[0].fields.pot_nom_ha;
      document.querySelector(classParent+nameClass.slice(11)).innerHTML=currentStop;
    });
  }
}


//CLICK PANELS
let panels = document.querySelectorAll('.stop__el');
panels.forEach(element => {
  element.addEventListener('click', (e)=>{
    let id = element.getAttribute('id');

    if (id.slice(0, 10) == 'namourette') {
      fetch('assets/namourette.json')
      .then(result =>{
        return result.json();
      })
      .then(data =>{
        let idSmall = id.slice(11);

        for (let i = 0; i < data.results.length; i++) {
          if (idSmall == data.results[i].id) {
            let pop = document.querySelector('.pop-up');
            if (pop != null) {
              pop.remove();
            }
            let p = document.createElement('p');
            p.classList.add('pop-up');
            p.innerHTML=data.results[i].name;
            document.body.appendChild(p);

            let x = e.pageX;
            let y = e.pageY;
          
            p.style.top=y+"px";
            p.style.left=x+"px";

            if (id == 'namourette_1') {
              p.style.top=y-46+"px";
            }

          }
        }
      });
    }else{
      fetch('https://public.opendatasoft.com/api/records/1.0/search/?dataset=poteaux-tec&lang=fr&rows=50&facet=arrondissement&facet=canton&facet=commune&refine.pot_id='+id)
      .then(result =>{
        return result.json();
      })
      .then(data =>{
        let pop = document.querySelector('.pop-up');
        if (pop != null) {
          pop.remove();
        }

        let p = document.createElement('p');
        p.classList.add('pop-up');
        p.innerHTML=data.records[0].fields.pot_nom_ha;
        document.body.appendChild(p);

        let x = e.pageX;
        let y = e.pageY;

        p.style.top=y+"px";
        p.style.left=x+"px";

        if (id == 'N501hka') {
          p.style.left=x-98+"px";
        }
    });
    }
  });
});

//remove PANELS
document.body.addEventListener('click', (e)=>{
  removePanel()
});

document.body.addEventListener("touchstart", (e)=>{
  removePanel()
});

function removePanel(){
  let pop = document.querySelector('.pop-up');
  if (pop != null) {
    pop.remove();
  }
}





follow('.roads__line3', '.bus3');
follow('.roads__line33', '.bus33');
follow('.roads__line42', '.bus42');
follow('.roads__line52', '.bus52');
follow('.roads__line1', '.bus1');


//PLAY - PAUSE
let bus = document.querySelectorAll('.bus');
bus.forEach(element =>{
  element.addEventListener('click', (e)=>{

    let animationBus = e.currentTarget.animationBus; 
    let animationWay = e.currentTarget.animationWay; 

    if(animationBus.paused){
      animationBus.play();
      animationWay.play();
      delay(false, e);
      sound();
    }else{
      animationBus.pause();
      animationWay.pause();
      delay(true, e);

      let nameClass = element.getAttribute('class').slice(7);

      if (nameClass != '1 bus--bat') { 
        soundBrake();
      }else{
        soundBrakeBoat();
      }
    }

    if (element.classList.contains('bus--anim') == true) {
      element.classList.remove('bus--anim');
    }
  });
});

//SOUND
function sound(){
  let tab = ['2908.mp3', '1807.mp3','1545.mp3','1653.mp3','Ancrecourt.mp3','ÇlÇphant.mp3','bipbip.mp3','frein.mp3','rame.mp3'];
  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  let src = tab[getRandomInt(9)];
  let audio = new Audio('assets/audios/'+src);


  let mute = sessionStorage.getItem('mute');

  if (mute == 'false') {
    audio.play();
  }
}

function soundBrake(){
  let audio = new Audio('assets/audios/frein.mp3');
  let mute = sessionStorage.getItem('mute');
  if (mute == 'false') {
    audio.play();
  }
}

function soundBrakeBoat(){
  let audio = new Audio('assets/audios/Ancrecourt.mp3');
  let mute = sessionStorage.getItem('mute');
  if (mute == 'false') {
    audio.play();
  }
}

//MUTED
let btnMuted = document.querySelector('.btn__muted');
btnMuted.addEventListener('click', (e)=>{

  let mute = sessionStorage.getItem('mute');

  if (mute == 'true') {
    sessionStorage.setItem('mute', 'false');
    btnMuted.innerHTML='Couper le son';
  }else{
    sessionStorage.setItem('mute', 'true');
    btnMuted.innerHTML='Rétablir le son';
  }
});


  


//TIMER
var timer1;
var timer3;
var timer33;
var timer42;
var timer52;
function delay(boolean, e){
  let nameClass = e.currentTarget.getAttribute('class').slice(7, 9);
  let element = document.querySelector('.delay__el--'+nameClass);
  let c = element.getAttribute('data-time');

  if (boolean == true) {

    if(nameClass == 1){
      timer1 = delayText(element, nameClass, c);
    }else if(nameClass == 3){
      timer3 = delayText(element, nameClass, c);
    }else if(nameClass == 33){
      timer33 = delayText(element, nameClass, c);
    }else if(nameClass == 42){
      timer42 = delayText(element, nameClass, c);
    }else{
      timer52 = delayText(element, nameClass, c);
    }

  }else{
    if (c != 0) {
      if (nameClass == 1) {
        element.innerHTML='';
        clearInterval(timer1); 
      }else{

        if(nameClass == 3){
          clearInterval(timer3); 
        }else if(nameClass == 33){
          clearInterval(timer33); 
        }else if(nameClass == 42){
          clearInterval(timer42); 
        }else{
          clearInterval(timer52); 
        }

        element.innerHTML='';

      }
    }
  }
}


function delayText(element, nameClass, c){
  let timer = setInterval(function(){
    c++;
    element.setAttribute('data-time', c);
    converter(c);
    if (nameClass == 1) {
      element.innerHTML='Vous mettez le Namourette en retard de '+ converter(c);
    }else{
      element.innerHTML='Vous mettez le bus '+nameClass+' en retard de '+ converter(c);
    }
  }, 1000);  
  return timer;
}

function converter(totalSeconds){
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  if (minutes == 0) {
    if (seconds <= 1) {
      return seconds+" seconde";
    }else{
      return seconds+" secondes";
    }
  }else if(hours == 0){

    if (minutes <= 1) {
      if (seconds < 10) {
        return minutes+':0'+seconds +" minute";
      }else{
        return minutes+':'+seconds +" minute";
      }
    }else{
      if (seconds < 10) {
        return minutes+':0'+seconds +" minutes";
      }else{
        return minutes+':'+seconds +" minutes";
      }
    }
  }else{


    if (hours <= 1) {

      if(seconds < 10 && minutes < 10){
        return hours+':0'+minutes+':0'+seconds +" heure";
      }else if (seconds < 10) {
        return hours+':'+minutes+':0'+seconds +" heure";
      }else if(minutes < 10){
        return hours+':0'+minutes+':'+seconds +" heure";
      }else{
        return hours+':'+minutes+':'+seconds +" heure";
      }
      
    }else{

    }

      if(seconds < 10 && minutes < 10){
        return hours+':0'+minutes+':0'+seconds +" heures";
      }else if (seconds < 10) {
        return hours+':'+minutes+':0'+seconds +" heures";
      }else if(minutes < 10){
        return hours+':0'+minutes+':'+seconds +" heures";
      }else{
        return hours+':'+minutes+':'+seconds +" heures";
      }




  }
}


//display infos

document.querySelector('.dataPlay__btn').addEventListener('click', (e)=>{
  document.querySelector('.infos').classList.toggle('infos--open')
});


//HOVER IMG
let photos = document.querySelectorAll('.ul__li');
photos.forEach(element =>{
  element.addEventListener('mouseover', (e)=>{
    hoverImg(2, element);
  });

  element.addEventListener('mouseout', (e)=>{
    hoverImg(1, element);
  });
});

function hoverImg(img, element){
  let src = element.children[0].children[0].getAttribute('src');

  let ext = src.slice(0, -5);

  element.children[0].children[0].setAttribute('src', ext+img+'.jpg');

  element.children[0].children[0].setAttribute('srcset', ext +img+'@2x.jpg');
}