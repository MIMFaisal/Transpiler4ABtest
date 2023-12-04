import autocomplete from 'inquirer-autocomplete-standalone';
import fuzzy from 'fuzzy';
import fs from 'fs';

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  fileList.forEach((file) => {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      files.push(file);
    }
  });
  return files;
}
function fileResolver(target, path) {
  if (fs.existsSync(path)) {
    return getFiles(path);
  }
  fs.mkdirSync(path);
  return [];
}
async function createPrompt(message, choiceList, newItem) {
  let mathces = [];
  const isSuggestOnly = !newItem;
  const emptyTextVal = !newItem && '';
  const answer = await autocomplete({
    message,
    source: async (input) => {
      const filteredList = fuzzy.filter(input, choiceList);
      mathces = filteredList.map((el) => el.original);

      if (!input) {
        mathces = [...choiceList];
      }
      newItem && mathces.push(`Create New ${newItem}`);
      return mathces.map((choice) => ({
        name: choice,
        value: choice
      }));
    },
    suggestOnly: isSuggestOnly,
    emptyText: emptyTextVal
  });

  return answer;
}

const sharedJsContent = (siteName, experimentId, variationName) => `export const SITE = '${siteName}';
export const ID = '${experimentId}';
export const VAR = '${variationName}';
`;

const createFile = (location, content) => {
  fs.writeFile(location, content, (err) => {
    if (err) {
      console.error('ERROR', err);
    }
  });
};

async function getIdValue(idName, list) {
  let id = await createPrompt(`Select a ${idName}`, list, idName);

  if (id.includes('Create')) {
    console.log('==============================');
    id = await createPrompt(`Enter ${idName} ID\n`, []);
  }

  return id;
}

async function getSiteLink() {
  const siteLink = await createPrompt('Paste Site Link Once to enable auto redirection or Press Enter to Continue: \n', []);
  return siteLink;
}

export {
  getFiles,
  getIdValue,
  sharedJsContent,
  createFile,
  fileResolver,
  getSiteLink
};