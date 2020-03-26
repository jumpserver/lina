<template>
  <Page>
    <template slot="content">
      <IBox :title="$t('users.usergrouplist')">
        <tables v-bind="tableConfig" />
      </IBox>
    </template>
  </Page>
</template>

<script>
import { IBox, Page, Tables } from '@/layout/components'
import { getUserGroupList } from '@/api/user'
export default {
  components: {
    IBox,
    Page,
    Tables
  },
  data() {
    return {
      tableConfig: {
        getData: getUserGroupList,
        hasSelect: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('usergroup.name'),
            key: 'name',
            nextroute: 'UserDetail'
          },
          {
            prop: 'user',
            label: this.$t('usergroup.user'),
            key: 'users_amount'
          },
          {
            prop: 'comment',
            label: this.$t('usergroup.comment'),
            key: 'comment'
          }
        ]
      }
    }
  }
}
</script>

<style>

</style>
