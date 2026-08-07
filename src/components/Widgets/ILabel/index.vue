<template>
  <el-tag
    v-bind="{ ...$attrs, ...el }"
    :class="{ 'no-color': !label.color }"
    :closable="closable"
    :style="{ '--label-color': label.color || 'var(--el-color-primary)' }"
    :title="getKey(label) + ': ' + getValue(label)"
    class="tag-formatter"
    disable-transitions
    effect="plain"
    size="small"
    @click="handleClick(label)"
  >
    <span class="label-content">
      <b class="label-key">{{ getKey(label) }}:</b>
      <span class="label-value">&nbsp;{{ getValue(label) }}</span>
    </span>
  </el-tag>
</template>

<script>
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
    }
  }
}
</script>

<style lang="scss" scoped>
.tag-formatter {
  box-sizing: border-box;
  max-width: 180px;
  height: 22px;
  padding: 0 7px 0 6px;
  overflow: hidden;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  border: 1px solid var(--el-border-color-lighter);
  border-color: color-mix(in srgb, var(--label-color) 32%, var(--el-border-color-lighter));
  border-radius: 4px;
  background-color: var(--el-fill-color-lighter);
  background-color: color-mix(in srgb, var(--label-color) 10%, var(--el-bg-color));
  opacity: 1;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  .label-content {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    gap: 0;
    line-height: 20px;
    vertical-align: middle;

    &::before {
      box-sizing: border-box;
      width: 6px;
      height: 6px;
      flex: 0 0 6px;
      margin-right: 6px;
      border: 1px solid color-mix(in srgb, var(--label-color) 72%, #000);
      border-radius: 50%;
      background-color: var(--label-color);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--label-color) 15%, transparent);
      content: '';
    }
  }

  .label-key,
  .label-value {
    display: inline-block;
    line-height: inherit;
    white-space: nowrap;
  }

  .label-key {
    flex: 0 0 auto;
    color: var(--el-text-color-primary);
    font-weight: 600;
  }

  .label-value {
    min-width: 0;
    overflow: hidden;
    color: var(--el-text-color-regular);
    text-overflow: ellipsis;
  }

  &:hover {
    border-color: color-mix(in srgb, var(--label-color) 48%, var(--el-border-color));
    background-color: color-mix(in srgb, var(--label-color) 15%, var(--el-bg-color));
    box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
  }

  &.no-color .label-content::before {
    border-color: var(--el-color-primary);
    background-color: var(--el-bg-color);
    box-shadow: none;
  }
}
</style>
