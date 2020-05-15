(this["webpackJsonphexagon-game"]=this["webpackJsonphexagon-game"]||[]).push([[0],{33:function(e,t,n){e.exports=n(86)},37:function(e,t,n){},38:function(e,t,n){},86:function(e,t,n){"use strict";n.r(t);var r,a=n(4),i=n.n(a),u=n(29),o=n.n(u),l=(n(37),n(38),n(32)),c=n(17),s=n(30),d=n(31),m=n(11),y=n(18);!function(e){e[e.Empty=0]="Empty",e[e.PlayerA=1]="PlayerA",e[e.PlayerB=2]="PlayerB",e[e.DominatedA=3]="DominatedA",e[e.DominatedB=4]="DominatedB"}(r||(r={}));var h=function(e){switch(e){case r.Empty:return"#FCDC5F";case r.PlayerA:return"#D2111B";case r.PlayerB:return"#3F48CC";case r.DominatedA:return"#F8A7AB";case r.DominatedB:return"#CACDF0"}},f=function(e,t){return{q:e.q+t.q,r:e.r+t.r}},v=[{q:-1,r:0},{q:0,r:-1},{q:1,r:-1},{q:1,r:0},{q:0,r:1},{q:-1,r:1}],b=function(){function e(t){Object(s.a)(this,e),this.board=void 0,this.turnPlayer=void 0,this.turnMove=void 0,this.turnNumber=void 0,this[y.a]=!0;var n=2*t-1;this.board=[];for(var a=0;a<n;a+=1)this.board.push(Array(n).fill(r.Empty));this.turnPlayer=r.PlayerA,this.turnMove=1,this.turnNumber=1}return Object(d.a)(e,[{key:"at",value:function(e){return console.assert(this.inBounds(e)),this.board[e.r][e.q]}},{key:"inBounds",value:function(e){return e.q>=0&&e.r>=0&&e.q+e.r>=this.sideLen-1&&e.q<this.diamLen&&e.r<this.diamLen&&e.r+e.q<this.diamLen+this.sideLen-1}},{key:"move",value:function(e){return console.dir(this),Object(y.b)(this,(function(t){t.board[e.r][e.q]=t.turnPlayer;var n,a,i=Object(c.a)(v);try{for(i.s();!(n=i.n()).done;)for(var u=n.value,o=f(e,u);t.inBounds(o)&&(a=t.at(o),![r.PlayerA,r.PlayerB].includes(a));)t.board[o.r][o.q]=t.dominator(o),o=f(o,u)}catch(l){i.e(l)}finally{i.f()}1===t.turnMove&&t.turnNumber>2?t.turnMove+=1:(t.turnMove=1,t.turnPlayer=t.turnPlayer===r.PlayerA?r.PlayerB:r.PlayerA,t.turnNumber+=1)}))}},{key:"dominator",value:function(e){var t,n=0,a=0,i=Object(c.a)(v);try{for(i.s();!(t=i.n()).done;)for(var u=t.value,o=e;o=f(o,u),this.inBounds(o);)this.at(o)===r.PlayerA?n+=1:this.at(o)===r.PlayerB&&(a+=1)}catch(l){i.e(l)}finally{i.f()}return n===a?r.Empty:n>a?r.DominatedA:r.DominatedB}},{key:"sideLen",get:function(){return Math.ceil(this.board.length/2)}},{key:"diamLen",get:function(){return this.board.length}}]),e}(),P=function(){var e=Object(a.useState)((function(){return new b(6)})),t=Object(l.a)(e,2),n=t[0],u=t[1],o=30*Math.sqrt(3),c=o/2;return i.a.createElement(i.a.Fragment,null,i.a.createElement("div",null,"Board size: ",i.a.createElement("input",{type:"number",min:1,value:n.sideLen,onChange:function(e){return u(new b(Number(e.target.value)))}})),i.a.createElement("div",null,"Turn ",n.turnNumber,", move ",n.turnMove,". ",i.a.createElement("button",{onClick:function(){return u(new b(n.sideLen))}},"Reset")),i.a.createElement("div",null,i.a.createElement("span",{style:{color:h(n.turnPlayer)}},n.turnPlayer===r.PlayerA?"Red":"Blue")," player's turn."),i.a.createElement(m.Stage,{width:window.innerWidth,height:800},i.a.createElement(m.Layer,null,n.board.flatMap((function(e,t){var a=t*c;return e.flatMap((function(e,l){var s={q:l,r:t};return n.inBounds(s)?[i.a.createElement(m.RegularPolygon,{sides:6,radius:30,fill:h(e),stroke:"black",strokeWidth:1,x:50+a+o*l,y:50+(30+c/2)*t,key:"".concat(l,"_").concat(t),onClick:function(e){var t,a;0===e.evt.button&&(t=n.turnPlayer,a=n.at(s),(t===r.PlayerA?[r.PlayerB,r.DominatedB].includes(a):[r.PlayerA,r.DominatedA].includes(a))||u((function(e){return e.move(s)})))}})]:[]}))})))))},B=function(){return i.a.createElement("div",{className:"App"},i.a.createElement(P,null))};o.a.render(i.a.createElement(i.a.StrictMode,null,i.a.createElement(B,null)),document.getElementById("root"))}},[[33,1,2]]]);
//# sourceMappingURL=main.6e0c603c.chunk.js.map