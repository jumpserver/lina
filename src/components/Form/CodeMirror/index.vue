<template>
  <codemirror v-bind="$attrs" />
</template>

<script>
import { codemirror } from 'vue-codemirror-lite'

export default {
  components: {
    codemirror
  },
  props: {
    ...codemirror.props
  }
}
</script>

<style></style>
