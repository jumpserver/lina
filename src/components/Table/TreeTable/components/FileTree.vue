<template>
  <div>
    <el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick" />
  </div>
</template>

<script>
export default {
  name: 'FileTree',
  data() {
    return {
      data: [
        {
          label: 'roles',
          children: [
            {
              label: 'a.yml'
            }
          ]
        },
        {
          label: 'vars',
          children: [
            {
              label: 'a.yml'
            }
          ]
        },
        {
          label: 'main.yml'
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  methods: {
    handleNodeClick(data) {
    }
  }
}
</script>

<style scoped>

</style>
