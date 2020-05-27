<template>
  <GenericDetailPage :object.sync="iObject" :active-menu.sync="iActiveMenu" v-bind="config" v-on="$listeners">
    <slot v-slot />
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'

export default {
  name: 'AutoTabDetailPage',
  components: {
    GenericDetailPage
  },
  props: {
    object: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: true
    },
    activeMenu: {
      type: String,
      required: true
    }
  },
  computed: {
    iObject: {
      get() {
        return this.object
      },
      set(item) {
        this.$emit('update:object', item)
      }
    },
    iActiveMenu: {
      get() {
        return this.activeMenu
      },
      set(item) {
        this.$emit('update:activeMenu', item)
      }
    }
  },
  mounted() {
    const col = this.$route.query.col
    const activeMenu = this.config.colMenuMapper[col] || this.activeMenu
    this.$emit('update:activeMenu', activeMenu)
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
