let burger = document.querySelector('.burger');
burger.addEventListener('click', (e)=>{
    menu()
});

let links = document.querySelectorAll('.menu__el');
links.forEach(element =>{
    element.addEventListener('click', (e)=>{
        menu()
    });
});

function menu(){
    document.querySelector('.burger').classList.toggle('burger--selected');
    document.querySelector('.menu').classList.toggle('menu--open');
}