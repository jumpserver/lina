<template>
  <div class="cloud-select-wrap">
    <el-row :gutter="12">
      <el-col v-for="p in providers" :key="p.name" :style="p.imageCSS ? p.imageCSS : ''">
        <el-card
          :body-style="{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }"
          :class="selected === p.name ? 'active': ''"
          shadow="hover"
          @dblclick.native="handleCardDBClick(p.name)"
          @click.native="handleCardClick(p.name)"
        >
          <el-image
            :src="p.image"
            fit="contain"
            shape="square"
          />
          <div class="description">{{ p.title }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="buttons">
      <el-col>
        <el-button size="small" @click="handleCancel">{{ $tc('Cancel') }}</el-button>
        <el-button
          size="small"
          type="primary"
          @click="handleNext"
        >
          {{ $tc('Next') }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'ProviderPanel',
  components: {},
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
    return {}
  },
  methods: {
    handleCardClick(platform) {
      this.$emit('update:selected', platform)
    },
    handleCardDBClick(platform) {
      this.handleCardClick(platform)
      this.handleNext()
    },
    handleNext() {
      const provider = this.providers.filter(p => p.name === this.selected)[0]
      if (!provider) {
        this.$message.error(this.$tc('SelectProviderMsg'))
        return
      }
      this.$emit('update:active', 1)
    },
    handleCancel() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang='scss' scoped>
.buttons {
  margin-top: 10px;
}

.cloud-select-wrap {
  background: #f3f3f3;

  .el-row {
    flex-direction: column;
    flex-wrap: wrap;
    cursor: pointer;

    .el-col {
      width: 265px;
      margin-bottom: 10px;

      .el-card.active {
        color: var(--color-primary);
        border: 1px solid;
      }

      ::v-deep .el-image {
        overflow: unset;

        img {
          width: 40px;
          height: 40px;
        }
      }

      ::v-deep .description {
        margin-left: 15px;
        font-size: 14px;
        word-break: keep-all;
        white-space: normal;
        text-overflow: ellipsis;
        overflow: hidden;
        color: var(--color-text-primary) !important;
      }
    }
  }
}
</style>
