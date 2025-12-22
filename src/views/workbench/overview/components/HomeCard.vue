<template>
  <div id="HomeCard">
    <el-card class="box-card no-border" shadow="never">
      <div v-show="title || btnText" slot="header" class="clearfix">
        <span v-show="title" class="title">{{ title }}</span>
        <el-button
          v-show="btnText"
          style="float: right; padding: 3px 0"
          type="text"
          @click="btnChange"
        >
          {{ btnText }}
        </el-button>
      </div>
      <ListTable
        ref="ListTable"
        :header-actions="headerActions"
        :table-config="tableConfig"
        class="ListTable"
      />
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
      default: () => {
      }
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
  #HomeCard {
    position: relative;
    width: 100%;
    background-color: #fff;
    transition: all 0.4s ease;
    overflow: hidden;

    &:nth-child(n) {
      margin-bottom: 20px;
    }

    .fa {
      position: absolute;
      right: -4px;
      top: -19px;
    }

    .fa:before {
      font-size: 110px;
      opacity: .1;
    }

    .others {
      width: 100%;
      height: auto;
      text-align: center;

      .icon {
        text-align: center;
        font-size: 30px;
      }
    }
  }

  .public-height {
    min-height: .1px;
  }

  :deep(.el-card__body) {
    padding-top: 10px
  }

  .ListTable :deep(.el-data-table .el-pagination) {
    display: none;
  }
</style>
