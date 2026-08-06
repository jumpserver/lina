<template>
  <el-tag
    v-bind="{ ...$attrs, ...el }"
    :class="{ 'no-color': !label.color }"
    :closable="closable"
    :color="label.color"
    :title="label.name + ': ' + label.value"
    class="tag-formatter"
    disable-transitions
    effect="plain"
    size="small"
    @click="handleClick(label)"
  >
    <span :class="[getColor(label)]" class="label-content">
      <b class="label-key">{{ getKey(label) }}:</b>
      <span class="label-value">&nbsp;{{ getValue(label) }}</span>
    </span>
  </el-tag>
</template>

<script>
import { isDarkness } from '@/utils/common/color'

export default {
  name: 'Label',
  props: {
    label: {
      type: [Object, String],
      default: () => ({})
    },
    el: {
      type: Object,
      default: () => ({})
    },
    closable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(label) {
      this.$emit('click', label)
    },
    getKey(tag) {
      if (typeof tag === 'string') {
        return tag.split(':')[0]
      } else {
        return tag.name
      }
    },
    getValue(tag) {
      if (!tag) {
        return ''
      } else if (typeof tag === 'string') {
        return tag.split(':')?.slice(1).join(':')
      } else {
        return tag.value
      }
    },
    getColor(tag) {
      if (isDarkness(tag.color)) {
        return 'white'
      } else {
        return 'black'
      }
    }
  }
}
</script>

<style scoped>
.white {
  color: white;
}

.black {
  color: black;
}

.tag-formatter {
  border: none;

  .label-content {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    gap: 0;
    line-height: 20px;
    vertical-align: middle;
  }

  .label-key,
  .label-value {
    display: inline-block;
    line-height: inherit;
    white-space: nowrap;
  }

  .label-key {
    flex: 0 0 auto;
  }

  .label-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.no-color {
    border: solid 1px var(--color-primary);

    span.black {
      color: var(--color-primary);
    }
  }

  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
}
</style>
