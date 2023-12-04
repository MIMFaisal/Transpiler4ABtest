import fse from 'fs-extra';
import { execSync } from 'child_process';
import {
  getFiles, getIdValue, fileResolver, createFile, sharedJsContent, getSiteLink
} from './utils.js';
import siteLinks from './siteLinks.js';

function startExp() {
  setTimeout(() => {
    execSync('npm run server', { stdio: 'inherit' });
  }, 1000);
}

if (process.argv.includes('prev')) {
  if (fse.pathExistsSync('./activeExp.js')) {
    startExp();
  } else {
    console.log('No previous active experiment found');
  }
} else {
  const clientList = getFiles('./src', []);
  let siteLink = '';

  const clientId = await getIdValue('Client', clientList);

  if (!siteLinks[clientId]) {
    siteLink = await getSiteLink();
  }

  const expList = fileResolver(clientId, `./src/${clientId}`);

  const expId = await getIdValue('Experiment', expList);

  const varList = fileResolver(expId, `./src/${clientId}/${expId}`);

  const varId = await getIdValue('Variation', varList);

  fileResolver(varId, `./src/${clientId}/${expId}/${varId}`);

  if (!fse.pathExistsSync(`./src/${clientId}/${expId}/${varId}/index.js`)) {
    console.log('==============================');
    console.log(`Creating New Experiment: ${clientId}-${expId}_${varId}`);
    fse.copySync('./template', `./src/${clientId}/${expId}/${varId}/`);
    createFile('./process/activeExp.js', sharedJsContent(clientId, expId, varId));
    createFile(`./src/${clientId}/${expId}/${varId}/info.js`, sharedJsContent(clientId, expId, varId));
    createFile(`./src/${clientId}/${expId}/${varId}/scss/components/_info.scss`, `$ID: '${clientId}-${expId}';\n$variation-name: '${varId}';`);
  } else {
    createFile('./process/activeExp.js', sharedJsContent(clientId, expId, varId));
  }
  if (siteLink && !siteLinks[clientId]) {
    console.log(siteLink);
    siteLinks[clientId] = siteLink;
    createFile('./process/siteLinks.js', `const siteLinks = {\n${Object.keys(siteLinks).map((key) => `  ${key}: '${siteLinks[key]}',\n`).join('')}};\n\nexport default siteLinks;`);
  }

  startExp();
}