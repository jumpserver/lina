<template>
  <!-- 自定义组件 my-input -->
  <div>
    <div v-for="(item, i) of data.slice(0, level)" :key="i" style="margin-bottom: 10px">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ i + 1 + '级审批' }}</span>
        </div>
        <el-radio-group v-model="item.strategy" @change="onChange()">
          <el-radio label="super_admin">超级管理员</el-radio>
          <el-radio label="org_admin">组织管理员</el-radio>
          <el-radio label="super_org_admin">超级管理员+组织管理员</el-radio>
          <el-radio label="custom_user">自定义用户</el-radio>
        </el-radio-group>
        <br>
        <Select2 v-show="item.strategy === 'custom_user'" v-model="item.assignees" v-bind="select2Option" @change="onChange()" />
      </el-card>
    </div>
  </div>
</template>

<script>
import Select2 from '@/components/FormFields/Select2'

export default {
  components: {
    Select2
  },
  props: {
    value: {
      type: [String, Array],
      default: () => []
    },
    level: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      vm: this,
      data: [],
      initData: [
        {
          strategy: 'super_admin',
          assignees_read_only: []
        },
        {
          strategy: 'super_admin',
          assignees_read_only: []
        }
      ],
      select2Option: {
        url: '/api/v1/users/users/?all=true'
      },
      fields: [
      ]
    }
  },
  computed: {

  },
  watch: {
    level(value) {
      console.log('Value is: ', value)
    }
  },
  mounted() {
    this.data = this.value.concat(this.initData)
    this.data.forEach(item => {
      item.assignees = item.assignees_read_only
      delete item.assignees_read_only
    })
    this.$emit('input', this.data.slice(0, this.level))
  },
  methods: {
    onChange() {
      this.$emit('input', this.data.slice(0, this.level))
    }
  }
}
</script>

<style>
  .text {
    font-size: 14px;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  }

  .item {
    padding: 18px 0;
  }

  .box-card {
    width: 600px;
  }
</style>
