<template>
  <div>
    <div class="summary-header">
      <el-tooltip :content="title" :open-delay="500" placement="top">
        <span class="title">{{ title }}</span>
      </el-tooltip>
    </div>
    <slot>
      <h3 class="no-margins ">
        <span
          :class="{ 'can-direct': canDirect }"
          class="num"
          @click="handleClick"
        >
          <span v-if="count === null"> - </span>
          <span v-else>{{ count }}</span>
        </span>
      </h3>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'SummaryCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    count: {
      type: [Number, String, Promise],
      default: null
    },
    route: {
      type: [String, Object],
      default: ''
    },
    canDirect: {
      type: Boolean,
      default: false
    },
    callback: {
      type: Function,
      default: () => {
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  methods: {
    handleClick() {
      if (this.disabled) {
        return
      }
      if (this.route) {
        this.$router.push(this.route)
        return
      }
      this.callback.bind(this)()
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss" scoped>
.summary-header {
  //color: var(--color-icon-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  .title {
    font-style: normal;
    font-weight: var(--font-weight-regular, 400);
    font-size: var(--font-size-sm, 13px);
    text-transform: none;
    line-height: var(--line-height-sm, 20px);
    color: var(--N600);
  }
}

.no-margins {
  margin: 0 !important;

  .num {
    font-style: normal;
    font-weight: var(--font-weight-medium, 500);
    font-size: 24px;
    line-height: 32px;
    color: var(--N900);
    cursor: pointer;

    &.can-direct:hover {
      color: var(--color-primary);
    }
  }
}
</style>
