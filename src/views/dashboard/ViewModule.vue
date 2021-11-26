<template>
  <div class="box">
    <div slot="header" class="clearfix">
      <span>{{ this.$t('common.nav.QuickAccess') }}</span>
    </div>
    <el-row :gutter="10">
      <el-col
        v-for="(item, index) of module"
        :key="index"
        :md="24 / module.length"
        :sm="24 / module.length"
        :xs="12"
      >
        <div @click="test(item)">
          <el-card class="box-card" shadow="hover">
            {{ item.label }}
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import store from '@/store'

export default {
  name: 'ViewModule',
  data() {
    return {
      module: []
    }
  },
  computed: {
    viewsMapper() {
      const mapper = {}
      const addRoutes = this.$store.state.permission.addRoutes || []
      for (const view of addRoutes) {
        const child = view.children || []
        if (child && child.length > 0) {
          if (child[0].children && child[0].children.length > 0) {
            mapper[view.meta.view] = child[0].children[0].meta.fullPath
          } else {
            mapper[view.meta.view] = view.children[0].meta.fullPath
          }
        } else {
          mapper[view.meta.view] = view.meta.fullPath
        }
      }
      return mapper
    }
  },
  created() {
    this.getFilterRoutes()
  },
  methods: {
    getFilterRoutes() {
      store.dispatch('permission/getFilterRoutes').then((res) => {
        this.module = res
      })
    },
    test(item) {
      const routeName = this.viewsMapper[item.name] || '/'
      const fromRoute = this.$route
      this.$router.push(routeName, () => {
        store.dispatch('permission/generateViewRoutes', { to: this.$route, from: fromRoute })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-col {
    margin-bottom: 20px;
  }
  @media print {
    .el-col-24{
      width: 50% !important;
    }
  }
  .box {
    margin-bottom: 25px;
    padding: 20px 15px 0;
    background-color: #fff;
    .clearfix {
      font-weight: 600;
      font-size: 14px;
      color: #333;
      margin-bottom: 15px;
    }
  }
  .box-card {
    cursor: pointer;
    text-align: center;
    color: #333;
    font-size: 14px;
    background-color: #f3f6fb;
    &:hover {
      color: #428bca;
      background-color: #ebf4ff;
    }
  }

</style>
