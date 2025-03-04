<template>
  <div class="panel-item">
    <span class="item-label">{{ title }}: </span>
    <span :title="content" class="text-info">{{ content || '' }}</span>
  </div>
</template>

<script>

export default {
  name: 'InfoPanel',
  components: {},
  props: {
    title: {
      type: String,
      default: () => ''
    },
    content: {
      type: [String, Number],
      default: () => ''
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang='scss' scoped>
@mixin textOverflow {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.panel-item {
  display: flex;
  flex-wrap: nowrap;
  text-align: left;
  padding: 3px 0;
  line-height: 20px;

  .item-label {
    text-align: left;
    display: flex;
    flex: 1;
    min-width: 110px;
  }

  .text-info {
    flex: 2;
    @include textOverflow;
  }
}

html:lang(en) .panel-item span {
  min-width: 100px;
}

html:lang(ja) .panel-item span {
  min-width: 160px;
}

html:lang(cn) .panel-item span {
  min-width: 120px;
}

html:lang(zh_hant) .panel-item span {
  min-width: 120px;
}
</style>
