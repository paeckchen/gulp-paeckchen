import test, {CallbackTestContext, Context} from 'ava';
import { File, PluginError } from 'gulp-util';
import { Duplex } from 'stream';
import { ExtendedFile } from '../src/context';

import { transformFactory } from '../src/transform-factory';

test.cb('transformFactory should let through null files', (t: CallbackTestContext & Context<any>) => {
  const context = {} as any;
  const inputFile = new File({
    path: '/test',
    contents: undefined
  });
  const callback = (_: any, outputFile: File) => {
    t.is(outputFile, inputFile);
    t.end();
  };

  const transform = transformFactory(context);
  transform(inputFile, 'utf-8', callback);
});

test.cb('transformFactory should throw error on stream input', (t: CallbackTestContext & Context<any>) => {
  let error: PluginError;

  const context = {} as any;
  const inputFile = new File({
    path: '/test',
    contents: new Duplex()
  });
  const callback = () => {
    t.regex(error.message, /Streaming not supported/);
    t.end();
  };

  const transform = transformFactory(context);
  const fakeEmitter = {
    emit: (_type: string, pluginError: PluginError) => {
      error = pluginError;
    }
  };
  transform.call(fakeEmitter, inputFile, 'utf-8', callback);
});

test.cb('transformFactory remembers the first input file', (t: CallbackTestContext & Context<any>) => {
  const context = {} as any;
  const inputFile1 = new File({
    path: '/test',
    contents: new Buffer('')
  });
  const inputFile2 = new File({
    path: '/test',
    contents: new Buffer('')
  });

  const callback = () => {
    t.is(context.firstFile, inputFile1);
    t.end();
  };

  const transform = transformFactory(context);
  transform(inputFile1, 'utf-8', () => undefined);
  transform(inputFile2, 'utf-8', callback);
});

test.cb('transformFactory add input files to the host', (t: CallbackTestContext & Context<any>) => {
  const context = {} as any;
  const inputFile1 = new File({
    path: '/test',
    contents: new Buffer('')
  });

  const callback = () => {
    t.is(context.host.files['/test'], inputFile1);
    t.end();
  };

  const transform = transformFactory(context);
  transform(inputFile1, 'utf-8', callback);
});

test.cb('transformFactory should enable sourceMap and add a sourceMapFile to the host',
    (t: CallbackTestContext & Context<any>) => {
  const context = {} as any;
  const inputFile1: ExtendedFile = new File({
    path: '/test',
    contents: new Buffer('')
  });
  inputFile1.sourceMap = {};

  const callback = () => {
    t.true(context.withSourceMap);
    t.true('/test.map' in context.host.files);
    t.end();
  };

  const transform = transformFactory(context);
  transform(inputFile1, 'utf-8', callback);
});
