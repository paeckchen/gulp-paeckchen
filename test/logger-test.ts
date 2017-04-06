import * as ava from 'ava';
import * as getLogger from 'glogg';
import { LogLevel } from 'paeckchen-core';

import { GulpLogger } from '../src/logger';

const gulplog = getLogger('gulplog');

function contextualize<T>(): ava.RegisterContextual<T> {
  ava.test.beforeEach(t => {
    gulplog.on('info', message => {
      t.context.message = message;
    });
  });
  return ava.test;
}

const test = contextualize<{message: string|undefined}>();

test.afterEach(() => {
  gulplog.removeAllListeners();
});

test('GulpLogger should contain loglevel in output line', t => {
  const logger = new GulpLogger();
  logger.configure({
    logLevel: LogLevel.trace
  } as any);

  logger.trace('test', 'message');
  if (t.context.message) {
    t.regex(t.context.message, /TRACE/);
  }

  logger.debug('test', 'message');
  if (t.context.message) {
    t.regex(t.context.message, /DEBUG/);
  }

  logger.info('test', 'message');
  if (t.context.message) {
    t.regex(t.context.message, /INFO/);
  }

  logger.error('test', new Error(), 'message');
  if (t.context.message) {
    t.regex(t.context.message, /ERROR/);
  }
});

test('GulpLogger should only log trace if enabled', t => {
  const logger = new GulpLogger();
  logger.configure({
    logLevel: LogLevel.debug
  } as any);

  logger.trace('test', 'message');
  t.is(t.context.message, undefined);
});

test('GulpLogger should only log debug if enabled', t => {
  const logger = new GulpLogger();

  logger.debug('test', 'message');
  t.is(t.context.message, undefined);
});

test('GulpLogger should log error message', t => {
  const logger = new GulpLogger();

  logger.error('test', new Error('error-msg'), 'message');
  if (t.context.message) {
    t.regex(t.context.message, /error-msg/);
  }
});
