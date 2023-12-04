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
  entryNames: `${SITE}-${ID}_${VAR}`,
  bundle: true,
  // outfile: `${paths.build}/${SITE}-${ID}_${VAR}.js`,
  outdir: `${buildPath}`,
  minify: false,
  sourcemap: false,
  plugins: [
    sassPlugin({
      async transform(source) {
        const { css } = await postcss([autoprefixer]).process(source, { from: undefined });
        return css;
      }
    })
  ],
  treeShaking: true,
  charset: 'utf8',
  target: ['es2016']
}).then(() => {
  const css = fs.readFileSync(`${buildPath}/${SITE}-${ID}_${VAR}.css`, 'utf8');

  const cssTemplate = `(() => {
  const style = document.createElement('style');
  style.classList.add('${SITE}-${ID}_${VAR}-css');
  style.innerHTML = \`${css.split('*/')[1]}\`;
  document.head.appendChild(style);
})();
  `;
  fs.writeFileSync(`${buildPath}/${SITE}-${ID}_${VAR}.bundle.js`, cssTemplate, (err) => {
    if (err) throw err;
  });

  const buildjs = fs.readFileSync(`${buildPath}/${SITE}-${ID}_${VAR}.js`, 'utf8');

  fs.appendFile(`${buildPath}//${SITE}-${ID}_${VAR}.bundle.js`, buildjs, (err) => {
    if (err) throw err;
    console.log('Bundle file is created successfully.');
  });
}).then(() => console.log('⚡ Build complete! ⚡'))
  .catch(() => process.exit(1));