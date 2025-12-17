export function installAsyncDirective(app) {
  app.directive('async', {
    async beforeMount(el, binding) {
      const { value: asyncFn, arg } = binding
      if (typeof asyncFn === 'function') {
        const result = await asyncFn(arg)
        el.innerText = result
      }
    },
    async updated(el, binding) {
      const { value: asyncFn, arg } = binding
      if (typeof asyncFn === 'function') {
        const result = await asyncFn(arg)
        el.innerText = result
      } else if (typeof asyncFn === 'object' && asyncFn.then) {
        const result = await asyncFn
        el.innerText = result
      } else {
        el.innerText = asyncFn
      }
    }
  })
}

export default {
  install: installAsyncDirective
}
