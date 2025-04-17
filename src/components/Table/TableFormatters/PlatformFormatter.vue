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

<style lang="scss" scoped>
.platform-td {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;

  .icon-zone {
    width: 1.5em;
    height: 1.5em;
    flex-shrink: 0;

    .asset-icon {
      height: 100%;
      width: 100%;
      vertical-align: -0.2em;
      fill: currentColor;
    }
  }

  .platform-name {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis
  }
}

</style>
