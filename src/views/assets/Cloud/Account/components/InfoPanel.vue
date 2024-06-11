<template>
  <div class="panel-item">
    <span>{{ title }}</span>
    <el-link :underline="false" type="primary">
      <span class="content">{{ content }}</span>
    </el-link>
  </div>
</template>

<script>

export default {
  name: 'InfoPanel',
  components: {
  },
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
    return {
    }
  },
  methods: {
  }
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
  justify-content: flex-start;
  align-items: center;
  padding: 5px 0;
  line-height: 20px;
  @include textOverflow;

  span {
   @include textOverflow;
    text-align: left;
  }

  ::v-deep .content {
    margin-left: 5px;
    color: var(--color-text-primary);
  }
}

html:lang(en) .panel-item span {
  min-width: 160px;
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
