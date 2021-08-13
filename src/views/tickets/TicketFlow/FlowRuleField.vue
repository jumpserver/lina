<template>
  <!-- 自定义组件 my-input -->
  <div>
    <div v-for="item of value.slice(0, level)" :key="item.name" style="border: 1px solid red; margin-bottom: 10px">
      <p>{{ item.name }}</p>
      <el-radio-group v-model="item.strategy" @change="onChange()">
        <el-radio label="super">超级管理员</el-radio>
        <el-radio label="admin">超级管理员+组织用户</el-radio>
        <el-radio label="all">自定义</el-radio>
      </el-radio-group>
      <br>
      <Select2 v-show="item.strategy === 'all'" v-model="item.assignees" v-bind="select2Option" @change="onChange()" />
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
      select2Option: {
        url: '/api/v1/users/users/'
      },
      fields: [
      ]
    }
  },
  watch: {
    value(value) {
      console.log('Value is: ', value)
    }
  },
  mounted() {
    console.log('Vlaue is: ', this.value)
  },
  methods: {
    onChange() {
      this.$emit('input', this.value)
    }
  }
}
</script>
