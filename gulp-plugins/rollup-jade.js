import { createFilter } from 'rollup-pluginutils';
import jade from 'pug';
import pugWrap from 'pug-runtime/wrap';

export default (options = {}) => {
  var filter = createFilter( options.include || ['*.jade', '**/*.jade'], options.exclude );

  return {
    transform(code, id) {
      if (!filter(id)) return;

      const parsedCode = jade.compile(code, { externalRuntime: true, compileDebug: false });
      return { code: `export default ${pugWrap(parsedCode)}`, map: { mappings: '' } };
    }
  };
};
