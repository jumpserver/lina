import { unref } from 'vue'
import { DRAWER_RUNTIME_CONTEXT } from '@/components/Drawer/context'

// Router views render as pages. A Drawer explicitly provides its runtime
// context to the same view component, so presentation is known at first render.
export default {
  inject: {
    drawerRuntime: {
      from: DRAWER_RUNTIME_CONTEXT,
      default: null
    }
  },
  props: {
    presentation: {
      type: String,
      default: 'auto',
      validator: (value) => ['auto', 'page', 'drawer'].includes(value)
    }
  },
  computed: {
    presentationMode() {
      if (this.presentation !== 'auto') return this.presentation
      return unref(this.drawerRuntime)?.isDrawer ? 'drawer' : 'page'
    },
    drawer() {
      return this.presentationMode === 'drawer'
    }
  }
}
