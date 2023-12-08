/* eslint-disable */
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import inquirer from 'inquirer';
import fse from 'fs-extra';
import fuzzy from 'fuzzy';
import siteLinks from './siteLinks.js';

function getFiles(dir, files = []) {
  const fileList = fse.existsSync(dir) ? fse.readdirSync(dir) : [];
  fileList.forEach((file) => {
    const name = `${dir}/${file}`;
    if (fse.statSync(name).isDirectory()) files.push(file);
  });
  return files;
}
async function createPrompt() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);

  const testInfo = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'client',
      message: 'Select a client:',
      source: async (answersSoFar, input) => {
        const filteredList = fuzzy.filter(input, getFiles('./src'));
        let mathces = filteredList.map((el) => el.original);
        if (!input) mathces = [...getFiles('./src')];

        mathces.push('Create New Client');
        return mathces.map((choice) => ({
          name: choice,
          value: choice
        }));
      },
      when: () => getFiles('./src').length > 0
    },
    {
      type: 'input',
      name: 'newClient',
      message: 'Enter Client ID:',
      when: (answers) => !answers.client || answers.client.includes('Create')
    },
    {
      type: 'autocomplete',
      name: 'experiment',
      message: 'Select an experiment to run:',
      source: async (answersSoFar, input) => {
        const filteredList = fuzzy.filter(input, getFiles(`./src/${answersSoFar.newClient || answersSoFar.client}`));
        let mathces = filteredList.map((el) => el.original);

        if (!input) mathces = [...getFiles(`./src/${answersSoFar.newClient || answersSoFar.client}`)];
        
        mathces.push('Create New Experiment');
        return mathces.map((choice) => ({
          name: choice,
          value: choice
        }));
      },
      when: (answers) => !answers.newClient || (answers.newClient && getFiles(`./src/${answers.newClient}`).length)
    },
    {
      type: 'input',
      name: 'newExperiment',
      message: 'Enter Experiment ID:',
      when: (answers) => !answers.client || answers.client.includes('Create') || answers.experiment.includes('Create')
    },
    {
      type: 'autocomplete',
      name: 'variation',
      message: 'Select a variation to run:',
      source: async (answersSoFar, input) => {
        const filteredList = fuzzy.filter(input, getFiles(`./src/${answersSoFar.newClient || answersSoFar.client}/${answersSoFar.newExperiment || answersSoFar.experiment}`));
        let matches = filteredList.map((el) => el.original);
        if (!input) matches = [...getFiles(`./src/${answersSoFar.newClient || answersSoFar.client}/${answersSoFar.newExperiment || answersSoFar.experiment}`)];
        
        matches.push('Create New Variation');
        return matches.map((choice) => ({
          name: choice,
          value: choice
        }));
      },
      when: (answers) => !answers.newExperiment || (answers.newExperiment && getFiles(`./src/${answers.newClient || answers.client}/${answers.newExperiment}`).length)
    },
    {
      type: 'input',
      name: 'newVariation',
      message: 'Enter Variation ID:',
      when: (answers) => answers.newExperiment || answers.variation.includes('Create')
    },
    {
      type: 'input',
      name: 'siteLink',
      message: 'Paste Site Link Once to enable auto redirection or Press Enter to Continue:',
      when: (answers) => !siteLinks[answers.newClient || answers.client]
    }
  ]);

  const clientId = testInfo.newClient || testInfo.client;
  const expId = testInfo.newExperiment || testInfo.experiment;
  const varId = testInfo.newVariation || testInfo.variation;
  const { siteLink } = testInfo;

  return {
    clientId, expId, varId, siteLink
  };
}

const sharedJsContent = (siteName, experimentId, variationName) => `export const SITE = '${siteName}';
export const ID = '${experimentId}';
export const VAR = '${variationName}';
`;

const createFile = (location, content) => {
  fse.writeFile(location, content, (err) => {
    if (err) console.error('ERROR', err);
  });
};

export {
  getFiles,
  sharedJsContent,
  createFile,
  createPrompt
};