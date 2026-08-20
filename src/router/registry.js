let routerInstance = null
let resetRouterHandler = null

export function setRouter(router) {
  routerInstance = router
}

export function getRouter() {
  return routerInstance
}

export function setResetRouterHandler(handler) {
  resetRouterHandler = handler
}

export function resetRegisteredRouter() {
  return resetRouterHandler?.()
}
