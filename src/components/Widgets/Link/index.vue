<template>
  <el-link v-right-click-target="target" :href="url" @click.prevent="openLink">
    <slot />
  </el-link>
</template>

<script>
export default {
  name: 'RightClickLink',
  directives: {
    'right-click-target': {
      inserted(el, binding) {
        el.addEventListener('contextmenu', (event) => {
          event.preventDefault()
          window.open(binding.value, '_blank')
        })
      }
    }
  },
  props: {
    url: {
      type: String,
      required: true
    },
    target: {
      type: String,
      default: '_blank'
    }
  },
  methods: {
    openLink() {
      window.open(this.url, this.target)
    }
  }
}
</script>
