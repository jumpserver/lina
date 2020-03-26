<template>
  <el-button-group>
    <el-button v-for="item in actions" :key="item.name" :size="size" :icon="item.icon" @click="handleClick(item.name)">{{ item.title }}</el-button>
    <el-dropdown v-if="moreActions.length > 0">
      <el-button size="small" class="btn-more-actions">
        更多操作<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="item in moreActions" :key="item.name" :icon="item.icon" @click="handleClick(item.name)">{{ item.title }} </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-button-group>
</template>

<script>
export default {
  name: 'ActionsGroup',
  props: {
    size: {
      type: String,
      default: 'small'
    },
    type: {
      type: String,
      default: ''
    },
    actions: {
      type: Array,
      default: () => []
    },
    moreActions: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleClick(item) {
      console.log(item)
    }
  }

}
</script>

<style scoped>

</style>
