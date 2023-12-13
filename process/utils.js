/* eslint-disable */
import enquirer from 'enquirer';
import fse from 'fs-extra';
import siteLinks from './siteLinks.js';

function getFiles(dir, files = []) {
  const fileList = fse.existsSync(dir) ? fse.readdirSync(dir) : [];
  fileList.forEach((file) => {
    const name = `${dir}/${file}`;
    if (fse.statSync(name).isDirectory()) {
      files.push(file);
    }
  });
  return files;
}
async function createInputPrompt(item) {
  const prompt = new enquirer.Input({
    message: `${item.includes('Link') ? 'Enter Link for auto redirection or Press Enter to continue' : `Enter ${item} ID:`}`,
    name: item
  });
  try {
    const answer = await prompt.run();
    return answer;
  } catch (error) {
    console.log('Exitting Program');
    process.exit(0);
  }
}
async function createAutocompletePrompt(files, item) {
  const fileList = [...files];
  fileList.push(`Create a New ${item}`);
  item.includes('Client') ? fileList.push('Cancel') : fileList.push('Back');
  const prompt = new enquirer.AutoComplete({
    name: item,
    message: `Select a${item.includes('Experiment') ? 'n' : ''} ${item}:`,
    limit: 10,
    choices: fileList
  });

  try {
    const answer = await prompt.run();
    return answer;
  } catch (error) {
    console.log('Exitting Program');
    process.exit(0);
  }
}
async function createPrompt() {
  let clientId = '';
  let expId = '';
  let varId = '';
  let siteLink = '';
  let exit = false;
  let shouldAskClient = true;
  let shouldAskExperiment = true;
  let shouldAskVariation = true;
  while (!exit) {
    if (shouldAskClient) {
      const clientList = getFiles('./src');
      if (getFiles('./src').length > 0) {
        clientId = await createAutocompletePrompt(clientList, 'Client');
        if (clientId.includes('Create')) {
          clientId = await createInputPrompt('Client');
        }
      } else if (!varId.includes('Back')) {
        clientId = await createInputPrompt('Client');
      }
      if (clientId.includes('Cancel')) {
        console.log('Exitting Program');
        process.exit(0);
      }
      shouldAskClient = false;
    }
    if (shouldAskExperiment) {
      const experimentList = getFiles(`./src/${clientId}`);
      if (experimentList.length > 0 || varId.includes('Back')) {
        expId = await createAutocompletePrompt(experimentList, 'Experiment');
        if (expId.includes('Create')) {
          expId = await createInputPrompt('Experiment');
        }
      } else {
        expId = await createInputPrompt('Experiment');
      }
      if (expId.includes('Back')) {
        shouldAskClient = true;
        continue;
      }
      shouldAskExperiment = false;
    }
    if (shouldAskVariation) {
      const variationList = getFiles(`./src/${clientId}/${expId}`);
      if (variationList.length > 0) {
        varId = await createAutocompletePrompt(variationList, 'Variation');
        if (varId.includes('Create')) {
          varId = await createInputPrompt('Variation');
        }
      } else {
        varId = await createInputPrompt('Variation');
      }
      if (varId.includes('Back')) {
        shouldAskExperiment = true;
        continue;
      }
      shouldAskVariation = false;
    }
    if (siteLinks[clientId]) {
      siteLink = siteLinks[clientId];
    } else {
      siteLink = await createInputPrompt('siteLink');
    }

    if (clientId && expId && varId) {
      exit = true;
      break;
    }
  }

  if (clientId && expId && varId) {
    return {
      clientId,
      expId,
      varId,
      siteLink
    };
  }
  console.log('Exitting Program');
  process.exit(0);
}

const sharedJsContent = (siteName, experimentId, variationName) => `export const SITE = '${siteName}';
export const ID = '${experimentId}';
export const VAR = '${variationName}';
`;

const createFile = (location, content) => {
  fse.writeFile(location, content, (err) => {
    if (err) {
      console.error('ERROR', err);
    }
  });
};

export {
  getFiles,
  sharedJsContent,
  createFile,
  createPrompt
};