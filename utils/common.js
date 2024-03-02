// eslint-disable-next-line
export function poll(t,i,o=!1,e=1e4,a=25){e<0||(t()?i():setTimeout(()=>{poll(t,i,o,o?e:e-a,a)},a))}
export function q(s, o) { return o ? s.querySelector(o) : document.querySelector(s); }
export function qq(s, o) { return o ? s.querySelectorAll(o) : document.querySelectorAll(s); }
export function insert(target, position, element, exists) { if (!exists) { typeof element === 'string' ? target.insertAdjacentHTML(position, element) : target.insertAdjacentElement(position, element); } }
