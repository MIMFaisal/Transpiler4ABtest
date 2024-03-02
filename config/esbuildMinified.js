import fs from 'fs';
import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import { SITE, ID, VAR } from '../process/activeExp.js';

const sourcePath = `./src/${SITE}/${ID}/${VAR}`;
const buildPath = `${sourcePath}/build`;

build({
  entryPoints: [`${sourcePath}/index.js`, `${sourcePath}/scss/index.scss`],
  entryNames: `${ID}_${VAR}.min`,
  bundle: true,
  outdir: `${buildPath}`,
  minify: true,
  sourcemap: false,
  plugins: [
    sassPlugin({
      async transform(source) {
        const { css } = await postcss([autoprefixer({ flexbox: 'no-2009', grid: 'no-autoplace' })]).process(source, { from: undefined });
        return css;
      }
    })
  ],
  treeShaking: true,
  charset: 'utf8',
  target: ['es2016']
}).then(() => {
  const css = fs.readFileSync(`${buildPath}/${ID}_${VAR}.min.css`, 'utf8');

  const cssTemplate = `(()=>{const s=document.createElement('style');s.classList.add('${ID}_${VAR}-css');s.innerHTML=\`${css.trim()}\`;(function p(){if(document.head){document.head.appendChild(s);}else{setTimeout(p,25);}}())})();\n`;
  fs.writeFileSync(`${buildPath}/${ID}_${VAR}.bundle.min.js`, cssTemplate, (err) => {
    if (err) throw err;
  });

  const buildjs = fs.readFileSync(`${buildPath}/${ID}_${VAR}.min.js`, 'utf8');

  fs.appendFile(`${buildPath}/${ID}_${VAR}.bundle.min.js`, buildjs, (err) => {
    if (err) throw err;
  });
});