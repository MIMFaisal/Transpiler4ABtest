import esbuild from 'esbuild';
import fs from 'fs';
import { sassPlugin } from 'esbuild-sass-plugin';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import open from 'open';
import { SITE, ID, VAR } from '../process/activeExp.js';
import siteLinks from '../process/siteLinks.js';

const sourcePath = `./src/${SITE}/${ID}/${VAR}`;
console.clear();

const rebuildPlugin = {
  name: 'onrebuild',
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length === 0 && result.warnings.length === 0) {
        console.clear();
      }
      console.log(`build ended with ${result.errors.length} errors and ${result.warnings.length} warnings at ${new Date().toLocaleTimeString()}`);
      fs.appendFileSync('./www/index.js', `\n//last updated on: ${new Date().toLocaleTimeString()}\n//# sourceURL=ABtest/${ID}_${VAR}.js`);
    });
  }
};

async function serve() {
  const ctx = await esbuild.context({
    entryPoints: [`${sourcePath}/index.js`, `${sourcePath}/scss/index.scss`],
    entryNames: 'index',
    outdir: 'www',
    bundle: true,
    minify: false,
    sourcemap: false,
    plugins: [
      sassPlugin({
        async transform(source) {
          const { css } = await postcss([autoprefixer]).process(source, { from: undefined });
          return css;
        }
      }),
      rebuildPlugin
    ],
    treeShaking: true,
    charset: 'utf8'
  });

  await ctx.watch();

  const { host, port } = await ctx.serve({
    servedir: 'www',
    host: 'localhost',
    port: 3030
  });

  console.log(`Experiment ${SITE}: ${ID}_${VAR}`);
  console.log(`Serving on ${host}:${port}`);

  if (siteLinks[SITE]) {
    console.log(`Redirecting to site... ${siteLinks[SITE]}`);
    open(siteLinks[SITE]);
  }
}

serve();