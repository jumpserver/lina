<template>
  <div class="page-heading">
    <el-row :gutter="0" class="page-heading-top">
      <el-col :span="16" class="page-heading-left">
        <slot><h2>{{ title }}</h2></slot>
      </el-col>
      <el-col :span="8" class="page-heading-right">
        <div class="page-heading-right-actions">
          <el-button size="small" icon="el-icon-edit">{{ $t('action.update') }}</el-button>
          <el-dropdown>
            <el-button size="small">
              <i class="el-icon-more"></i><i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-delete">{{ $t('action.delete') }} </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-col>
    </el-row>
    <Breadcrumb></Breadcrumb>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
export default {
  name: 'PageHeading',
  components: {
    Breadcrumb
  },
  props: {
    title: {
      type: String,
      default: () => ''
    }
  }
}
</script>

<style scoped>
  .page-heading {
    border-top: 0;
    padding: 10px 30px 20px 25px;
    background-color: #ffffff;
    min-height: 1px;
  }

  .page-heading-left, h2 {
    font-size: 24px;
    font-weight: 100;
    line-height: 26px;
    margin-top: 10px;
    margin-bottom: 12px;
    max-height: 32px;
  }

  .page-heading-right-actions {
    float: right;
  }
</style>
