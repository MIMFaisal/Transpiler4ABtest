// eslint-disable-next-line
export function waitFor(t,i,o=!1,a=1e4,e=25){a<0||(t()?i():setTimeout(()=>{o&&waitFor(t,i,o,a,e);o||waitFor(t,i,o,a-e,e)},e))}
export function q(s, o) { return o ? s.querySelector(o) : document.querySelector(s); }
export function qq(s, o) { return o ? s.querySelectorAll(o) : document.querySelectorAll(s); }
export function insert(target, position, element, exists) { if (!exists) { typeof element === 'string' ? target.insertAdjacentHTML(position, element) : target.insertAdjacentElement(position, element); } }
