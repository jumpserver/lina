<template>
  <div class="panel-item">
    <div class="item-label">{{ title }}</div>
    <div :title="content" class="text-info">{{ content || '' }}</div>
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
  text-align: left;
  padding: 3px 0;
  line-height: 20px;

  .item-label {
    text-align: left;
  }
  .item-label::after {
    content: ':';
    margin-left: 1px;
  }
  .text-info {
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
