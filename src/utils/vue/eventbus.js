import mitt from 'mitt'

const emitter = mitt()

export const eventBus = {
  $on: emitter.on,
  $off: emitter.off,
  $emit: emitter.emit,
  on: emitter.on,
  off: emitter.off,
  emit: emitter.emit
}

export default {
  eventBus
}
