import fse from 'fs-extra';
import { execSync } from 'child_process';
import {
  createFile, sharedJsContent, createPrompt
} from './utils.js';
import siteLinks from './siteLinks.js';

function startExp() {
  setTimeout(() => {
    execSync('npm run server', { stdio: 'inherit' });
  }, 1000);
}

if (process.argv.includes('prev')) {
  if (fse.pathExistsSync('./process/activeExp.js')) {
    startExp();
  } else {
    console.log('No previous active experiment found');
  }
} else {
  fse.ensureDirSync('./src');
  const {
    clientId, expId, varId, siteLink
  } = await createPrompt();

  fse.ensureDirSync(`./src/${clientId}/${expId}/${varId}`);

  if (!fse.pathExistsSync(`./src/${clientId}/${expId}/${varId}/index.js`)) {
    console.clear();
    console.log(`Creating New Experiment: ${clientId}-${expId}_${varId}`);
    fse.copySync('./template', `./src/${clientId}/${expId}/${varId}/`);
    createFile('./process/activeExp.js', sharedJsContent(clientId, expId, varId));
    createFile(`./src/${clientId}/${expId}/${varId}/info.js`, `${sharedJsContent(clientId, expId, varId)}export const EXPID = '${clientId}-${expId}';\n\nexport function expLog() {\n  window.runningExperiments[EXPID].logs.push([...arguments]);\n  console.debug(...arguments);\n}`);
    createFile(`./src/${clientId}/${expId}/${varId}/scss/components/_info.scss`, `$ID: '${clientId}-${expId}';\n$variation-name: '${varId}';`);
  } else {
    createFile('./process/activeExp.js', sharedJsContent(clientId, expId, varId));
  }
  if (siteLink) {
    siteLinks[clientId] = siteLink;
    createFile('./process/siteLinks.js', `const siteLinks = {\n${Object.keys(siteLinks).map((key) => `  ${key}: '${siteLinks[key]}',\n`).join('')}};\n\nexport default siteLinks;`);
  }

  startExp();
}