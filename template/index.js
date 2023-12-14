import {
  waitFor, q, qq, insert
} from '../../../../utils/common.js';
import { EXPID, VAR, expLog } from './info.js';

window.runningExperiments = window.runningExperiments || {};
window.runningExperiments[EXPID] = {
  name: '',
  variation: `${VAR}`,
  logs: []
};

waitFor(
  () => q('body'),
  () => {
    q('body').classList.add(`${EXPID}_${VAR}`);
    expLog('RUNNING EXPERIMENT: ', EXPID, ' :: ', VAR);
    expLog('TEST', q('body'));
  }
);