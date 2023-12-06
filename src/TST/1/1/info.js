export const SITE = 'TST';
export const ID = '1';
export const VAR = '1';
export const EXPID = 'TST-1';

export function expLog() {
  window.runningExperiments[EXPID].logs.push([...arguments]);
  console.debug(...arguments);
}