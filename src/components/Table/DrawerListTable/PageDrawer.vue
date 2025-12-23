<template>
  <Drawer
    v-model:visible="iVisible"
    :component="component"
    :component-listeners="listener"
    :title="title"
    append-to-body
    class="form-drawer"
    v-bind="props"
    v-on="$listeners"
  />
</template>

<script>
import Drawer from '@/components/Drawer/index.vue'
import vModelMixin from '@/utils/vue/vModelMixin'

export default {
  components: { Drawer },
  mixins: [vModelMixin('visible')],
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
  emits: ['update:visible'],
  data() {
    return {
      listener: {
        ...this.$listeners
      }
    }
  },
  mounted() {
    this.$log.debug('>>> PageDrawer component: ', this.component)
  },
  methods: {
    closeDrawer() {
      this.$emit('update:visible', false)
      // 关闭 Drawer 后，清空所有 params 参数
      // Reflect.ownKeys(this.$route.params).forEach(key => {
      //   Reflect.deleteProperty(this.$route.params, key)
      // })
    }
  }
}
</script>

<style lang="scss" scoped></style>
