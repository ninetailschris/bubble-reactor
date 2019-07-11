var menuList =[
{//0 Title
linkList:
[
['1 Player','updateInterface(1);'],
['How to play','updateInterface(2);'],
//['Credits','updateInterface(3);'],
]
},
{//1 single player
linkList:
[
['Demo Mode','timeMode();game();'],
['Test','updateInterface(0);'],
]
},
{//2 how to play
linkList:
[
['Back','updateInterface(0);']
]
},
{//3 credits
linkList:
[
['Back','updateInterface(0);']
]
},
{//4 pause
linkList:
[
['Resume','resume();'],
['Back to title','mainTitle();'],
['debug mode','debug();']
]
},
{//5 game over
linkList:
[
['Back to title','mainTitle();']
]
}

];


function updateInterface(menuId){

var temp ='';
var menu = menuList[menuId];

for ( var i=0; i < menu.linkList.length; i++ ){
temp += '<div class="button" onclick='+menu.linkList[i][1]+'>'+ menu.linkList[i][0]+'</div>';
}
$('.menus').html(temp);
}

