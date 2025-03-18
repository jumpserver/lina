<template>
  <Drawer
    :component="component"
    :component-listeners="listener"
    :title="title"
    :visible.sync="iVisible"
    append-to-body
    class="form-drawer"
    destroy-on-close
    v-bind="props"
    @close="closeDrawer"
    v-on="$listeners"
  />
</template>

<script>
import Drawer from '@/components/Drawer/index.vue'

export default {
  components: { Drawer },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    component: {
      type: [String, Function],
      required: true
    },
    props: {
      type: Object,
      default: () => ({})
    },
    action: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      listener: {
        ...this.$listeners
      }
    }
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    closeDrawer() {
      this.iVisible = false
      // 关闭 Drawer 后，清空所有 params 参数
      Reflect.ownKeys(this.$route.params).forEach(key => {
        Reflect.deleteProperty(this.$route.params, key)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
