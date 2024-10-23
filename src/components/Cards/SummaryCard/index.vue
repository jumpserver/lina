<template>
  <div>
    <div class="summary-header">
      <span class="title">{{ title }}</span>
    </div>
    <slot>
      <h3 class="no-margins ">
        <span class="num" @click="handleClick">
          {{ iCount }}
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
      type: [Number, String],
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
      return this.body.count || this.count
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
      this.callback()
    }
  }
}
</script>

<style lang="scss" scoped>
.summary-header {
  color: var(--color-icon-primary);

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

    &:hover {
      color: var(--color-primary);
    }
  }
}
</style>
