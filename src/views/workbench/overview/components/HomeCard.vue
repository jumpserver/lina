<template>
  <div class="home-card">
    <el-card class="box-card no-border" shadow="never">
      <template #header>
        <div v-show="title || btnText" class="card-heading">
          <span v-show="title" class="title">{{ title }}</span>
          <slot name="header-action">
            <el-button v-if="btnText" link @click="btnChange">{{ btnText }}</el-button>
          </slot>
        </div>
      </template>
      <slot>
        <ListTable
          ref="ListTable"
          :header-actions="headerActions"
          :table-config="tableConfig"
          class="ListTable"
        />
      </slot>
    </el-card>
  </div>
</template>

<script>
import ListTable from '@/components/Table/ListTable/index'

export default {
  name: 'HomeCard',
  components: {
    ListTable
  },
  props: {
    title: {
      type: String,
      default: () => ''
    },
    btnText: {
      type: String,
      default: () => ''
    },
    headerActions: {
      type: Object,
      default: () => {
        return {
          hasLeftActions: false,
          hasRightActions: false,
          hasSearch: false
        }
      }
    },
    tableConfig: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  methods: {
    btnChange() {
      if (this.btnRouteName) {
        this.$router.push({ name: this.btnRouteName })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.home-card {
  position: relative;
  width: 100%;
  margin-bottom: 20px;

  // `.no-border` has a global bottom margin. Keep the spacing on this transparent
  // wrapper instead, otherwise the white wrapper exposes a strip below the card.
  > .box-card {
    margin-bottom: 0;
  }
}

:deep(.el-card__body) {
  padding-top: 10px;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ListTable :deep(.el-data-table .el-pagination) {
  display: none;
}
</style>
