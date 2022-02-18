<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { Text } from '@/components/FormFields'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      config: {
        initial: {
          scope: this.$route.query.scope
        },
        url: '/api/v1/rbac/roles/',
        fields: [
          [
            this.$t('common.Basic'), [
              'name', 'scope'
            ]
          ],
          [
            this.$t('perms.Permissions'), [
              'permissions'
            ]
          ],
          [
            this.$t('common.Other'), ['comment']
          ]
        ],
        fieldsMeta: {
          scope: {
            type: 'select',
            readonly: true
          },
          permissions: {
            component: Text,
            el: {
              text: '添加成功后，详情中添加权限'
            }
          }
        }
      }
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
