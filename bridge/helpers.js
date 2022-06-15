const localArgsRegex = /^_(session|request|response|cookies)_$/

module.exports.callFn = function (fn, ctx, providedParams = [], localArgs = {}) {
  const requiredParams = getParamNames(fn)

  // inject local args into client provided params
  for (let i = 0; i < requiredParams.length; i++) {
    const p = requiredParams[i]
    const inject = localArgsRegex.exec(p)
    if(inject && inject[1] in localArgs) {
      providedParams.splice(i, 0, localArgs[inject[1]])
    }
  }

  return fn.call(ctx, ...providedParams)
}

// taken from https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
// possibly swap with better impl
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
const ARGUMENT_NAMES = /([^\s,]+)/g
function getParamNames(fn) {
  const fnStr = fn.toString().replace(STRIP_COMMENTS, '')
  const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
  return result === null ? [] : result
}


