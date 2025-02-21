<template>
  <span class="platform-td">
    <span class="icon-zone">
      <img :src="icon" alt="icon" class="asset-icon">
    </span>
    <span class="platform-name">{{ value.name }}</span>
  </span>
</template>

<script>
import BaseFormatter from './base.vue'
import { loadPlatformIcon } from '@/utils/jms'

export default {
  name: 'PlatformFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          platformAttr: ''
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    icon() {
      return loadPlatformIcon(this.value.name, this.value.type)
    },
    value() {
      if (!this.formatterArgs.platformAttr) {
        return this.cellValue
      } else {
        return _.get(this.row, this.formatterArgs.platformAttr)
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

.icon-zone {
  display: inline-block;
  width: 1.5em;
}

.asset-icon {
  height: 1.5em;
  vertical-align: -0.2em;
  fill: currentColor;
}
</style>
