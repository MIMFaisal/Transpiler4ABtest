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
    name: item,
    validate: (input) => {
      if (input.length < 1 && !item.includes('Link')) {
        return 'Please enter a valid ID';
      }
      return true;
    }
  });
  try {
    const answer = await prompt.run();
    return answer;
  } catch (error) {
    console.log('Exiting Program');
    process.exit(0);
  }
}
async function createAutocompletePrompt(files, item) {
  const fileList = [...files];
  fileList.push(`Create a New ${item}`);
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
    console.log('Exiting Program');
    process.exit(0);
  }
}
async function getPromptResult(list, item) {
  let answer = '';
  if (list.length > 0) {
    answer = await createAutocompletePrompt(list, item);
    if (answer.includes('Create')) {
      answer = await createInputPrompt(item);
    }
  } else {
    answer = await createInputPrompt(item);
  }
  return answer;
}
async function createPrompt() {
  const clientList = getFiles('./src');
  const clientId = await getPromptResult(clientList, 'Client');

  const experimentList = getFiles(`./src/${clientId}`);
  const expId = await getPromptResult(experimentList, 'Experiment');

  const variationList = getFiles(`./src/${clientId}/${expId}`);
  const varId = await getPromptResult(variationList, 'Variation');

  let siteLink = '';
  if (siteLinks[clientId]) {
    siteLink = siteLinks[clientId];
  } else {
    siteLink = await createInputPrompt('siteLink');
  }

  if (clientId && expId && varId) {
    return {
      clientId,
      expId,
      varId,
      siteLink
    };
  }
  console.log('Experiment not found ... exiting program');
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