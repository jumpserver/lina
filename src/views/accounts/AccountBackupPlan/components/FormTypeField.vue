<template>
  <el-tree
    :data="iData"
    show-checkbox
    node-key="id"
    :default-expand-all="true"
    :default-checked-keys="value"
    :props="defaultProps"
    v-bind="$attrs"
    @check="handleCheckChange"
  />
</template>

<script>
export default {
  name: 'FormTypeField',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    choices: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      fullChoicesTreeNodes: [
        {
          id: 'all',
          label: this.$t('perms.all'),
          children: [
            {
              id: 'host',
              label: this.$t('applications.host'),
              children: [
                {
                  id: 'linux',
                  label: 'Linux'
                },
                {
                  id: 'windows',
                  label: 'Windows'
                },
                {
                  id: 'unix',
                  label: 'Unix'
                },
                {
                  id: 'bsd',
                  label: 'BSD'
                },
                {
                  id: 'macos',
                  label: 'MacOS'
                },
                {
                  id: 'mainframe',
                  label: 'Mainframe'
                },
                {
                  id: 'other_host',
                  label: 'Other host'
                }
              ]
            },
            {
              id: 'networking',
              label: 'Device',
              children: [
                {
                  id: 'switch',
                  label: 'Switch'
                },
                {
                  id: 'router',
                  label: 'Router'
                },
                {
                  id: 'firewall',
                  label: 'Firewall'
                },
                {
                  id: 'other_network',
                  label: 'Other network'
                }
              ]
            },
            {
              id: 'database',
              label: this.$t('assets.Database'),
              children: [
                {
                  id: 'mysql',
                  label: 'Mysql'
                },
                {
                  id: 'mariadb',
                  label: 'MariaDB'
                },
                {
                  id: 'postgresql',
                  label: 'PostgreSQL'
                },
                {
                  id: 'oracle',
                  label: 'Oracle'
                },
                {
                  id: 'sqlserver',
                  label: 'SQLServer'
                },
                {
                  id: 'mongodb',
                  label: 'MongoDB'
                },
                {
                  id: 'redis',
                  label: 'Redis'
                }
              ]
            },
            {
              id: 'cloud',
              label: 'Clouding',
              children: [
                {
                  id: 'k8s',
                  label: 'Kubernetes'
                }
              ]
            },
            {
              id: 'web',
              label: 'Web',
              children: [
                {
                  id: 'general',
                  label: 'General'
                }
              ]
            }
          ]
        }
      ]
    }
  },
  computed: {
    choicesIDs() {
      return this.choices.map((v) => v.value)
    },
    iData() {
      this.$log.debug('choices: ', this.choicesIDs)
      const fullTreeNodes = _.cloneDeep(this.fullChoicesTreeNodes)
      const treeNodes = this.trimChoicesTreeNodes(fullTreeNodes)
      this.$log.debug('choicesTreeNodes: ', treeNodes)
      return treeNodes
    }
  },
  methods: {
    trimChoicesTreeNodes(treeNodes) {
      const newTreeNodes = []
      for (const treeNode of treeNodes) {
        if (!this.choicesIDs.includes(treeNode.id)) {
          continue
        }
        let children = treeNode.children || []
        if (children.length !== 0) {
          children = this.trimChoicesTreeNodes(children)
          treeNode.children = children
        }
        newTreeNodes.push(treeNode)
      }
      return newTreeNodes
    },
    handleCheckChange(data, obj) {
      const checkedKeys = obj.checkedKeys
      if (checkedKeys.length !== 0) {
        checkedKeys.push('connect')
      }
      this.$emit('input', checkedKeys)
    }
  }
}
</script>

<style scoped>

</style>
