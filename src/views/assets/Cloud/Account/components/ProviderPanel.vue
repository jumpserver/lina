<template>
  <div>
    <el-row :gutter="12">
      <el-col v-for="p in providers" :key="p.name" :span="6" style="margin-bottom: 10px">
        <el-card
          shadow="hover"
          :class="selected === p.name ? 'active': ''"
          :body-style="{ padding: '15px', position: 'relative', height: '100px' }"
          @click.native="handleCardClick(p.name)"
        >
          <el-image
            shape="square"
            :src="p.image"
            :style="p.imageCSS ? p.imageCSS : {'padding': '1.5em 0.5em'}"
          />
        </el-card>
      </el-col>
    </el-row>
    <el-button size="small" style="float: right;" @click="handleCancel">{{ $tc('Cancel') }}</el-button>
    <el-button
      size="small"
      style="float: right; margin-right: 10px;"
      type="primary"
      @click="handleNext"
    >
      {{ $tc('Next') }}
    </el-button>
  </div>
</template>

<script>

export default {
  name: 'ProviderPanel',
  components: {
  },
  props: {
    providers: {
      type: Array,
      default: () => []
    },
    selected: {
      type: String,
      default: () => ''
    },
    active: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  methods: {
    handleCardClick(platform) {
      this.$emit('update:selected', platform)
    },
    handleNext() {
      const provider = this.providers.filter(p => p.name === this.selected)[0]
      if (!provider) {
        this.$message.error(this.$tc('SelectProviderMsg'))
        return
      }
      this.$emit('update:active', 2)
    },
    handleCancel() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang='scss' scoped>
.platform-title {
  display: inline-block;
  line-height: 60px;
  height: 60px;
  position: absolute;
  margin-left: 20px;
}

.el-card.active {
  color: var(--color-primary);
  border: 1px solid;
}
</style>
