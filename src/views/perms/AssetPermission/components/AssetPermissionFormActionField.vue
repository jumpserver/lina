<template>
  <el-tree
    :data="data"
    show-checkbox
    node-key="id"
    :default-expand-all="true"
    :default-checked-keys="value"
    :props="defaultProps"
    @check="handleCheckChange"
  />
</template>

<script>
export default {
  name: 'AssetPermissionFormActionFiel',
  props: {
    value: {
      type: Array,
      default: () => ['all', 'connect', 'upload_file', 'download_file', 'updownload']
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      data: [
        {
          id: 'all',
          label: this.$t('perms.all'),
          children: [
            {
              id: 'connect',
              label: this.$t('perms.connect')
            },
            {
              id: 'updownload',
              label: this.$t('perms.upDownload'),
              children: [
                {
                  id: 'upload_file',
                  label: this.$t('perms.uploadFile')
                },
                {
                  id: 'download_file',
                  label: this.$t('perms.downloadFile')
                }
              ]
            }
          ]
        }
      ]
    }
  },
  methods: {
    handleCheckChange(data, obj) {
      const checkedKeys = obj.checkedKeys
      this.$emit('input', checkedKeys)
    }
  }
}
</script>

<style scoped>

</style>
