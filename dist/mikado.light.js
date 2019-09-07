/**
 * Mikado.js v0.0.61 (Light)
 * Copyright 2019 Nextapps GmbH
 * Author: Thomas Wilkerling
 * Licence: Apache-2.0
 * https://github.com/nextapps-de/mikado
 */
(function(){'use strict';var g=window.requestAnimationFrame,p={};function w(a,b,c){a.nodeType||(c=b,b=a,a=null);b||(c=a,a=c.root,b=c.template);"string"===typeof b?b=p[b]:w.register(b);this.cache=!c||!1!==c.cache;this.u=c&&c.async;this.v=!c||!1!==c.reuse;a&&this.mount(a);this.m!==b&&(this.m=b,this.id=++x,this.clone=this.o=this.f=null,this.l=!0);this.state={}}w.register=function(a,b){b||(b=a,a=b.n);p[a]=b};w["new"]=function(a,b,c){return new this(a,b,c)};
w.prototype.mount=function(a){if(this.b!==a){this.b=a;var b;if(!(b=a._d)){b=a.children;for(var c=b.length,d=Array(c),k=0,e;k<c;k++)e=b[k],e._i=k,d[k]=e;b=a._d=d}this.g=b;this.length=this.g.length}return this};
var y={change:1,click:1,dblclick:1,input:1,keydown:1,keypress:1,keyup:1,mousedown:1,mouseenter:1,mouseleave:1,mousemove:1,mouseout:1,mouseover:1,mouseup:1,mousewheel:1,touchstart:1,touchmove:1,touchend:1,touchcancel:1,reset:1,select:1,submit:1,toggle:1,blur:1,error:1,focus:1,load:1,resize:1,scroll:1};w.prototype.get=function(a){return this.g[a]};var x=0;w.prototype.create=function(a,b,c){var d=this.clone;d||(this.clone=d=z(this,this.m));this.l||this.o(d._p,a,c,b);return d.cloneNode(!0)};
w.prototype.render=function(a,b,c,d){"function"===typeof a?c=a:"function"===typeof b&&(c=b,b=null);if(!d){if(c){var k=this;g(function(){k.render(a,b,null,!0);"function"===typeof c&&c()});return this}if(this.u){var e=this;return new Promise(function(r){g(function(){e.render(a,b,null,!0);r()})})}}(d=this.b._t)?d!==this.id&&(this.b._t=this.id,this.b.textContent="",this.b._d=this.g=[],this.length=0,this.cache&&(this.b._h=null)):this.b._t=this.id;if(a){d=a.length;for(var f,h=0,l=void 0,n=void 0;h<d;h++)n=
a[h],(l=this.g[h])?this.v?this.update(l,n,b,h):this.replace(l,n,b,h):this.add(n,b,f||(f=document.createDocumentFragment()));f&&this.b.appendChild(f);if(d<this.length)for(f=this.g.splice(d),this.length=d,d=f.length,h=0;h<d;h++)this.b.removeChild(f[h])}else this.g[0]||this.add();return this};w.prototype.add=function(a,b,c){var d=this.length;a=this.create(a,b,d);a._i=d;(c||this.b).appendChild(a);this.g[d]=a;this.length++;return this};var A;
function z(a,b,c,d,k){var e=document.createElement(b.t||"div");c||(c=0,d="&",A="",a.f=[],e._p=k=[]);var f=b.s,h=b.i,l=b.x,n=b.h,r=b.a,m=b.c,q=b.j;b=a.f.length;A+=";self=p["+b+"];";q&&(A+=q+";");a.cache&&(A+="this");m&&("object"===typeof m?(A+=a.cache?"._l(self,"+m[0]+")":"self.className="+m[0]+";",a.f[b]=d,k[b++]=e,a.l=!1):e.className=m);if(r){m=Object.keys(r);for(q=0;q<m.length;q++){var t=m[q],v=r[t];if("object"===typeof v){A+=a.cache?"._a(self,'"+t+"',"+v[0]+")":"self.setAttribute('"+t+"',"+v[0]+
");";var u=!0}else e.setAttribute(t,v);y[t]&&a.w(t)}u&&(a.f[b]=d,k[b++]=e,a.l=!1)}if(f)if("string"===typeof f)e.style.cssText=f;else if(f.length)A+=a.cache?"._c(self,"+f[0]+")":"self.style.cssText="+f[0]+";",a.f[b]=d,k[b++]=e;else{r=Object.keys(f);for(u=0;u<r.length;u++)if(m=r[u],q=f[m],"object"===typeof q){A+=a.cache?"._s(self,'"+m+"',"+q[0]+")":"self.style.setProperty('"+m+"',"+q[0]+");";var B=!0}else e.style.setProperty(m,q);B&&(a.f[b]=d,k[b++]=e,a.l=!1)}if(h)if(h.length)for(l=">",b=0;b<h.length;b++)b&&
(l+="+"),e.appendChild(z(a,h[b],c+b+1,d+l,k));else e.appendChild(z(a,h,c+1,d+">",k));else l?(d+="|",(h="object"===typeof l)&&(l=l[0]),f=document.createTextNode(l),h&&(A+=a.cache?"._t(self,"+l+")":"self.nodeValue="+l+";",a.f[b]=d,k[b++]=f,a.l=!1),e.appendChild(f)):n&&("object"===typeof n?(n=n[0],A+=a.cache?"._h(self, "+n+")":"self.innerHTML="+n+";",a.f[b]=d,k[b++]=e,a.l=!1):e.innerHTML=n);c||a.l||(a.o=Function("p","item","index","view",A?'"use strict";var root=p[0],self'+A:""));return e}
w.prototype._t=function(a,b){a._x!==b&&(a.nodeValue=b,a._x=b);return this};w.prototype._h=function(a,b){a._h!==b&&(a.innerHTML=b,a._h=b);return this};w.prototype._l=function(a,b){a._c!==b&&(a.className=b,a._c=b,a._cs=null);return this};w.prototype._s=function(a,b,c){var d=a._sc||(a._sc={});d[b]!==c&&(d[b]=c,(a._s||(a._s=a.style)).setProperty(b,c),a._cs=null);return this};w.prototype._c=function(a,b){a._cs!==b&&((a._s||(a._s=a.style)).cssText=b,a._cs=b,a._sc=null);return this};
w.prototype._a=function(a,b,c){var d="_a_"+b;a[d]!==c&&(a.setAttribute(b,c),a[d]=c);return this};(function(){var a=this||window,b;(b=a.define)&&b.amd?b([],function(){return w}):(b=a.modules)?b.mikado=w:"object"===typeof a.exports?a.module.exports=w:a.Mikado=w})();}).call(this);
