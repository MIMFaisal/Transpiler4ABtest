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
  entryNames: `${ID}_${VAR}`,
  bundle: true,
  outdir: `${buildPath}`,
  minify: false,
  sourcemap: false,
  plugins: [sassPlugin({
    async transform(source) {
      const { css } = await postcss([autoprefixer({ flexbox: 'no-2009', grid: 'no-autoplace' })]).process(source, { from: undefined });
      return css;
    }
  })],
  treeShaking: true,
  charset: 'utf8',
  target: ['es2016']
}).then(() => {
  fs.appendFileSync(`${buildPath}/${ID}_${VAR}.js`, `\n//# sourceURL=ABtest/${ID}_${VAR}.js`);
  const css = fs.readFileSync(`${buildPath}/${ID}_${VAR}.css`, 'utf8');

  const cssTemplate = `(() => {
  const style = document.createElement('style');
  style.classList.add('${ID}_${VAR}-css');
  style.innerHTML = \`${css.split('*/')[1]}\`;

  (function poll(){
    if (document.head) {
      document.head.appendChild(style);
    } else {
      setTimeout(poll, 25);
    }
  }())
})();
  `;
  fs.writeFileSync(`${buildPath}/${ID}_${VAR}.bundle.js`, cssTemplate, (err) => {
    if (err) throw err;
  });

  const buildjs = fs.readFileSync(`${buildPath}/${ID}_${VAR}.js`, 'utf8');

  fs.appendFile(`${buildPath}/${ID}_${VAR}.bundle.js`, buildjs, (err) => {
    if (err) throw err;
    console.log('Bundle file is created successfully.');
  });
}).then(() => console.log('⚡ Build complete! ⚡'))
  .catch(() => process.exit(1));