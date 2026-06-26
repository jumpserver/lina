import { onBeforeMount, onBeforeUnmount, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const { body } = document
const WIDTH = 992 // refer to Bootstrap's responsive design

/**
 * useResizeHandler - 处理响应式布局的 composable
 * 替代 ResizeHandler mixin
 */
export function useResizeHandler() {
  const store = useStore()
  const router = useRouter()

  function isMobile() {
    const rect = body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
  }

  function resizeHandler() {
    if (!document.hidden) {
      const mobile = isMobile()
      store.dispatch('app/toggleDevice', mobile ? 'mobile' : 'desktop')

      if (mobile) {
        store.dispatch('app/closeSideBar', { withoutAnimation: true })
      }
    }
  }

  // 监听路由变化，返回取消注册函数
  const unregisterRouterGuard = router.afterEach((to) => {
    if (store.state.app.device === 'mobile' && store.state.app.sidebar.opened) {
      store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  })

  onBeforeMount(() => {
    window.addEventListener('resize', resizeHandler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
    // 清理路由守卫
    if (unregisterRouterGuard) {
      unregisterRouterGuard()
    }
  })

  onMounted(() => {
    const mobile = isMobile()
    if (mobile) {
      store.dispatch('app/toggleDevice', 'mobile')
      store.dispatch('app/closeSideBar', { withoutAnimation: true })
    }
  })

  return {
    isMobile,
    resizeHandler
  }
}

export default useResizeHandler
