# Transpiler4ABtest

A/B test Transpiler based on esbuild

## Installation

```
npm i
```

## Start experiment server

```
npm start
```

## Build the experiment

```
npm run build
```

## Connect experiment with the site

Copy ths code snippet provided below in UserJS/TemperMonkey.

### Snippet for live update without reload

```
// ==UserScript==
// @name         TranspilerEsbuild
// @description  A/B testing transpiler with HOT update script
// @version      1.0
// @author       Moinul Islam
// @match        *://*/*
// @noframes
// ==/UserScript==

(() => {
  const ID = 'ABtest';
  const fType = {
    js: 'script',
    css: 'style'
  };

  const pushInDom = (link, type) => {
    fetch(link)
      .then((response) => response.text())
      .then((fileData) => {
        const newF = document.createElement(fType[type]);
        const oldF = document.querySelector(`#${ID}-${type}`);

        if (oldF) {
          if (oldF.textContent === fileData) return;

          oldF.remove();
        }

        newF.id = `${ID}-${type}`;
        newF.textContent = fileData;
        document.head.append(newF);
      })
      .catch((err) => {
        console.debug('Please ensure server is running at http://localhost:3030');
      });
  };
  pushInDom('http://localhost:3030/index.js', 'js');
  pushInDom('http://localhost:3030/index.css', 'css');

  (function poll() {
    if (document.readyState === 'complete') {
      fetch('http://localhost:3030')
        .then(() => {
          new EventSource('http://localhost:3030/esbuild').addEventListener('change', () => {
            pushInDom('http://localhost:3030/index.js', 'js');
            pushInDom('http://localhost:3030/index.css', 'css');
          });
        })
        .catch((err) => {
          console.debug('Failed to establish connection to http://localhost:3030/');
        });
    } else {
      setTimeout(poll, 25);
    }
  }());
})();
```

### Snippet for update with page reload

```
// ==UserScript==
// @name         TranspilerEsbuildReload
// @description  A/B testing transpiler with HOT update script
// @version      1.0
// @author       Moinul Islam
// @match        *://*/*
// @noframes
// ==/UserScript==

(() => {
  const ID = 'ABtest';
  const fType = {
    js: 'script',
    css: 'style'
  };

  const pushInDom = (link, type) => {
    fetch(link)
      .then((response) => response.text())
      .then((fileData) => {
        const newF = document.createElement(fType[type]);
        const oldF = document.querySelector(`#${ID}-${type}`);

        if (oldF) {
          if (oldF.textContent === fileData) return;

          oldF.remove();
        }

        newF.id = `${ID}-${type}`;
        newF.textContent = fileData;
        document.head.append(newF);
      })
      .catch((err) => {
        console.debug('Please ensure server is running at http://localhost:3030');
      });
  };
  pushInDom('http://localhost:3030/index.js', 'js');
  pushInDom('http://localhost:3030/index.css', 'css');

  (function poll() {
    if (document.readyState === 'complete') {
      fetch('http://localhost:3030')
        .then(() => {
          new EventSource('http://localhost:3030/esbuild').addEventListener('change', () => {
            location.reload();
          });
        })
        .catch((err) => {
          console.debug('Failed to establish connection to http://localhost:3030/');
        });
    } else {
      setTimeout(poll, 25);
    }
  }());
})();
```

DOM manipulation with multiple funtional change might not work with the `Snippet for live update without reload` and will require manual page reload.
So it is better to create two different script for both type and activate/deactivate when needed.

Some sites may have Content security policy enabled which will prevent any script injection from unauthorized external source. Use a extension that can disable content security policy in that case during development.

## Template Support

To create a separate template for your project. Just copy the default folder inside the `template` folder. Rename it to your needs and it should automatically show it as a template when create a project.

Updated template folder should look like the following

```
template
────default
│   │   index.js
│   │   info.js
│   │
│   └───scss
│       │   ...
│
└───yourTemplate
    │   index.js
    │   info.js
    │
    └───scss
        │   ...
```
