import {
  poll, q, qq, insert
} from '../../../../utils/common.js';
import { ID, VAR, expLog } from './info.js';

window.runningExperiments = window.runningExperiments || {};
window.runningExperiments[ID] = {
  name: '',
  variation: `${VAR}`,
  logs: []
};

poll(
  () => q('body'),
  () => {
    q('body').classList.add(`${ID}_${VAR}`);
    expLog('RUNNING EXPERIMENT: ', ID, ' :: ', VAR);
    expLog('TEST', q('body'));
  }
);