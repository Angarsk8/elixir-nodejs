function requireModule(modulePath) {
  // When not running in production mode, refresh the cache on each call.
  if (process.env.NODE_ENV !== 'production') {
    delete require.cache[require.resolve(modulePath)];
  }

  return require(modulePath);
}

function getAncestor(parent, [key, ...keys]) {
  if (typeof key === 'undefined') {
    return parent;
  }
  return getAncestor(parent[key], keys);
}

function requireModuleFunction([modulePath, ...keys]) {
  const mod = requireModule(modulePath);
  return getAncestor(mod, keys);
}

function callModuleFunction(moduleFunction, args) {
  const fn = requireModuleFunction(moduleFunction);
  return fn(...args);
}

function getResponse(message) {
  try {
    const [moduleFunction, args] = JSON.parse(message);
    const result = callModuleFunction(moduleFunction, args);
    return JSON.stringify([true, result]);
  } catch (error) {
    return JSON.stringify([false, `${error.message}\n${error.stack}`]);
  }
}

function onMessage(message) {
  const response = getResponse(message);
  process.send(response);
}

process.on('message', onMessage);
