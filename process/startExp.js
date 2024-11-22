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

console.clear();

if (process.argv.includes('prev')) {
  if (fse.pathExistsSync('./process/activeExp.js')) {
    startExp();
  } else {
    console.log('No previous active experiment found');
  }
} else {
  fse.ensureDirSync('./src');
  const {
    clientName, expId, varId, siteLink, template
  } = await createPrompt();

  fse.ensureDirSync(`./src/${clientName}/${expId}/${varId}`);

  if (!fse.pathExistsSync(`./src/${clientName}/${expId}/${varId}/index.js`)) {
    console.clear();
    console.log(`Creating New Experiment For ${clientName}: ${expId}_${varId}`);
    fse.copySync(`./template/${template}`, `./src/${clientName}/${expId}/${varId}/`);
    createFile('./process/activeExp.js', sharedJsContent(clientName, expId, varId));
    createFile(`./src/${clientName}/${expId}/${varId}/info.js`, `${sharedJsContent(clientName, expId, varId)}\nexport function expLog() {\n  window.runningExperiments[ID].logs.push([...arguments]);\n  console.debug(...arguments);\n}`);
    createFile(`./src/${clientName}/${expId}/${varId}/scss/components/_info.scss`, `$ID: "${expId}";\n$variation-name: "${varId}";`);
  } else {
    createFile('./process/activeExp.js', sharedJsContent(clientName, expId, varId));
  }
  if (siteLink) {
    siteLinks[clientName] = siteLink;
    createFile('./process/siteLinks.js', `const siteLinks = {\n${Object.keys(siteLinks).map((key) => `  "${key}": "${siteLinks[key]}",\n`).join('')}};\n\nexport default siteLinks;`);
  }

  startExp();
}