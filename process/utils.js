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
    message: `${item.includes('Link') ? 'Enter Link for auto redirection or Press Enter to continue' : `Enter ${item} ${item.includes('Client') ? 'Name' : 'ID'}`}`,
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

async function createTemplatePrompt() {
  const prompt = new enquirer.Select({
    name: 'template',
    message: 'Choose a template:',
    choices: fse.readdirSync('./template'),
  });

  try {
    const answer = await prompt.run();
    return answer;
  } catch (error) {
    console.log('Exiting Program');
    process.exit(0);
  }
}

async function createPrompt() {
  let clientName = '';
  let expId = '';
  let varId = '';
  let siteLink = '';
  let template = 'default';
  let exit = false;
  let shouldAskClient = true;
  let shouldAskExperiment = true;
  let shouldAskVariation = true;
  let shouldAskTemplate = false;
  while (!exit) {
    if (shouldAskClient) {
      const clientList = getFiles('./src');
      if (getFiles('./src').length > 0) {
        clientName = await createAutocompletePrompt(clientList, 'Client');
        if (clientName.includes('Create')) {
          clientName = await createInputPrompt('Client');
        }
      } else if (!varId.includes('Back')) {
        clientName = await createInputPrompt('Client');
      }
      if (clientName.includes('Cancel')) {
        console.log('Exitting Program');
        process.exit(0);
      } else if (clientName.length === 0) {
        console.log('Please Enter a Valid Client Name');
        continue;
      }
      shouldAskClient = false;
    }
    if (shouldAskExperiment) {
      const experimentList = getFiles(`./src/${clientName}`);
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
      } else if (expId.length === 0) {
        console.log('Please Enter a Valid Experiment ID');
        continue;
      }
      shouldAskExperiment = false;
    }
    if (shouldAskVariation) {
      const variationList = getFiles(`./src/${clientName}/${expId}`);
      if (variationList.length > 0) {
        varId = await createAutocompletePrompt(variationList, 'Variation');
        if (varId.includes('Create')) {
          shouldAskTemplate = true;
          varId = await createInputPrompt('Variation');
        }
      } else {
        shouldAskTemplate = true;
        varId = await createInputPrompt('Variation');
      }
      if (varId.includes('Back')) {
        shouldAskExperiment = true;
        continue;
      } else if (varId.length === 0) {
        console.log('Please Enter a Valid Variation ID');
        continue;
      }
      shouldAskVariation = false;
    }

    if (shouldAskTemplate) {
      template = await createTemplatePrompt();
      shouldAskTemplate = false;
    }

    if (siteLinks[clientName]) {
      siteLink = siteLinks[clientName];
    } else {
      siteLink = await createInputPrompt('siteLink');
    }

    if (clientName && expId && varId) {
      exit = true;
      break;
    }
  }

  if (clientName && expId && varId) {
    return {
      clientName,
      expId,
      varId,
      siteLink,
      template
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