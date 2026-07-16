import { onMounted } from 'vue'
import { useStore } from 'vuex'

/**
 * useFixIOSBug - 修复 iOS 设备菜单点击 bug 的 composable
 * 替代 FixiOSBug mixin
 *
 * @param {import('vue').Ref} subMenuRef - el-sub-menu 组件的 ref
 */
export function useFixIOSBug(subMenuRef) {
  const store = useStore()

  function fixBugIniOS() {
    const $subMenu = subMenuRef.value
    if ($subMenu) {
      const handleMouseleave = $subMenu.handleMouseleave
      $subMenu.handleMouseleave = (e) => {
        if (store.state.app.device === 'mobile') {
          return
        }
        handleMouseleave(e)
      }
    }
  }

  onMounted(() => {
    fixBugIniOS()
  })

  return {
    fixBugIniOS
  }
}

export default useFixIOSBug
