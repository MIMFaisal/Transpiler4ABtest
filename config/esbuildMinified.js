import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import { SITE, ID, VAR } from '../process/activeExp.js';

const sourcePath = `./src/${SITE}/${ID}/${VAR}`;
const buildPath = `${sourcePath}/build`;

build({
  entryPoints: [`${sourcePath}/index.js`, `${sourcePath}/scss/index.scss`],
  entryNames: `${SITE}-${ID}_${VAR}.min`,
  bundle: true,
  outdir: `${buildPath}`,
  minify: true,
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
});