# Transpiler4ABtest

A/B test Transpiler built with esbuild

## Installation

```
npm i
```

## Start experiment server

```
npm start
```

This will prompt you to provide Client/Site name, Experiment ID, variation ID and select template which will be used to create a directory under `src` folder. These input are required.
The Experiment ID should be started with an Alphabet.
Additionally, this will ask for the site URL for a new client(or if it is not provided before) which is optional. Once inserted, this will be used redirect user to the given URL using the default browser.

To continue working on the last experiment you can use
```
npm start prev
```

## Build the experiment

```
npm run build
```

The build file can be found inside the active experiment variation directory.
Alternatively, the unminified build files can be found in www folder during development which can be directly used in tools.

## Connect to client site
Download **User JavaScript and CSS extension** and paste the content given below in JS field
```
(() => {
  const ID = "ABtest-script";
  const localLink = "http://127.0.0.1:3030";
  const fileType = {
    js: ["script", "src", !!0],
    css: ["link", "href", !0]
  };
  const pushInDom = (type) => {
    const newEle = document.createElement(fileType[type][0]);
    const oldEle = document.querySelector(`#${ID}-${type}`);
    newEle.id = `${ID}-${type}`;
    newEle[fileType[type][1]] = `${localLink}/index.${type}?v=${parseInt(Math.random() * 10000, 10)}`;
    if (fileType[type][2]) newEle.rel = "stylesheet";
    if (oldEle) oldEle.remove();
    document.head.append(newEle);
  };
  pushInDom("js");
  pushInDom("css");
  fetch(localLink)
    .then(() => {
      new EventSource(`${localLink}/esbuild`).addEventListener("change", (e) => {
        const { updated } = JSON.parse(e.data);

        updated.forEach((item) => {
          if (item.includes("css")) {
            pushInDom("css");
          } else {
            // Uncomment following line and comment out the pushInDom function if you want to reload the page on change in JS file
            // location.reload(); 
            pushInDom("js");
            pushInDom("css");
          }
        });
      });
    })
    .catch((err) => {
      console.debug(`Failed to establish connection to ${localLink}. ${err}`);
    });
})();
```
Set the URL pattern to `*://*/*, !https://*.google.com/`.

Alternatively, **Tampermonkey** extension can be used with the script given below
```
// ==UserScript==
// @name         TranspilerEsbuild
// @description  A/B testing transpiler
// @version      1.0
// @author       Moinul Islam
// @match        *://*/*
// @exclude      https://*.google.com/*
// @noframes
// ==/UserScript==

(() => {
  const ID = "ABtest-script";
  const localLink = "http://127.0.0.1:3030";
  const fileType = {
    js: ["script", "src", !!0],
    css: ["link", "href", !0]
  };
  const pushInDom = (type) => {
    const newEle = document.createElement(fileType[type][0]);
    const oldEle = document.querySelector(`#${ID}-${type}`);
    newEle.id = `${ID}-${type}`;
    newEle[fileType[type][1]] = `${localLink}/index.${type}?v=${parseInt(Math.random() * 10000, 10)}`;
    if (fileType[type][2]) newEle.rel = "stylesheet";
    if (oldEle) oldEle.remove();
    document.head.append(newEle);
  };
  pushInDom("js");
  pushInDom("css");
  fetch(localLink)
    .then(() => {
      new EventSource(`${localLink}/esbuild`).addEventListener("change", (e) => {
        const { updated } = JSON.parse(e.data);

        updated.forEach((item) => {
          if (item.includes("css")) {
            pushInDom("css");
          } else {
            // Uncomment following line and comment out the pushInDom function if you want to reload the page on change in JS file
            // location.reload();
            pushInDom("js");
            pushInDom("css");
          }
        });
      });
    })
    .catch((err) => {
      console.debug(`Failed to establish connection to ${localLink}. ${err}`);
    });
})();
```
To exclude a domain, use follow same pattern shown here to exclude google apps.

Some sites may have Content security policy enabled which will prevent script injection from unauthorized external source. Use an extension like [Disable Content-Security-Policy](https://chromewebstore.google.com/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden) or [Allow CSP: Content-Security-Policy](https://chromewebstore.google.com/detail/allow-csp-content-securit/hnojoemndpdjofcdaonbefcfecpjfflh) during development to remove existing content security policy rules in that case.


## Template Support

To create a separate template for your project. Just copy the default folder inside the `template` folder. Rename and modify the index.js or index.css file according to your need. The new template will appear in the list when creating a new experiment.

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
