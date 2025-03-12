<template>
  <div>
    <div class="summary-header">
      <el-tooltip :content="title" placement="top" :open-delay="500">
        <span class="title">{{ title }}</span>
      </el-tooltip>
    </div>
    <slot>
      <h3 class="no-margins ">
        <span
          v-async="iCount"
          class="num"
          :class="{ 'can-direct': body.canDirect ? true : false }"
          @click="handleClick"
        >
          -
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
    body: {
      type: Object,
      default: () => ({})
    },
    count: {
      type: [Number, String, Promise],
      default: 0
    },
    route: {
      type: [String, Object],
      default: ''
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
  computed: {
    iCount() {
      const count = this.body.count || this.count
      return count
    },
    iRoute() {
      return this.body.route || this.route
    },
    iDisabled() {
      return this.body.disabled === undefined ? this.disabled : this.body.disabled
    }
  },
  methods: {
    handleClick() {
      if (this.iDisabled) {
        return
      }
      if (this.iRoute) {
        this.$router.push(this.iRoute)
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
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    line-height: 1.2;
  }
}

.no-margins {
  margin: 0 !important;

  .num {
    font-style: normal;
    font-weight: 500;
    font-size: 24px;
    line-height: 40px;
    color: var(--color-text-primary);
    cursor: pointer;

    &.can-direct:hover {
      color: var(--color-primary);
    }
  }
}
</style>
