<template>
  <GenericDetailPage :object.sync="group" v-bind="config">
    <template #info>
      <div>
        <el-row :gutter="20">
          <el-col :md="14" :sm="24">
            <DetailCard :title="cardTitle" :items="detailItems" />
          </el-col>
          <el-col :md="10" :sm="24">
            <RelationCard v-bind="relationConfig" />
          </el-col>
        </el-row>
      </div>
    </template>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import { DetailCard, RelationCard } from '@/components'

export default {
  components: {
    GenericDetailPage,
    DetailCard,
    RelationCard
  },
  data() {
    return {
      group: { name: '', comment: '' },
      config: {
        activeMenu: 'info',
        submenu: [
          {
            title: this.$tc('Basic Info'),
            name: 'info'
          },
          {
            title: this.$t('perms.Asset permissions'),
            name: 'assetPermissions'
          }
        ],
        actions: {
          canDelete: true,
          canUpdate: true
        }
      },
      groupMembers: [],
      relationConfig: {
        icon: 'fa-user',
        title: this.$tc('Members'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name',
          processResults(data) {
            let results = data.results
            results = results.map((item) => {
              return { label: item.name + '(' + item.username + ')', value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        },
        hasObjectsId: ['ff0d0dc8-ef71-415f-9b83-60978c1971a8',
          '9cb0e440-0340-408d-89d6-ce60eb5ab364',
          '1ed4fb15-c526-45c9-83a8-0527f47b44f3',
          '2c56fd37-db65-40ed-b787-b65a98635f12',
          '938b47a3-db34-40be-b732-ee0125a4857c',
          '6ece7c09-452f-4eac-ab20-9ccb1608680f',
          'e7f63eb0-1277-4dd9-87b2-0e347851bebc',
          'af84f59a-d70d-41ae-a30f-e92ceb4d84a1',
          'ce589bf7-f5ef-4eb1-b8ed-33c19a44566d',
          '2a7359fc-1a8b-4f49-9bd0-e4b84c94428a',
          '3e3b75a9-11fd-4b97-ad04-17a50a72507c',
          'fc175594-2895-4749-a350-0e9c3c89227a',
          'e34f1f38-eaf8-49ba-9229-44117833e9bb',
          '87dc36ae-ad17-4f04-ae32-c884312f64e0',
          'b61768fa-3dfb-41cf-be1c-198402da881e',
          'c0c75f51-a78f-4623-89bc-7e4906d9eee6',
          'e48fb72e-ca52-441a-b6cc-d4aa5772d5c8',
          '49aac9b3-4ff7-4ca1-a2fa-d8c577692f80',
          '38f4d901-8283-499a-8b7e-f3d1377159a4',
          '9c2e9073-5fa3-4a56-a5c5-3ef7b9e01fdb',
          '88174bec-1ce7-40ef-a222-f8496a374812',
          '12e835fc-978a-4229-b597-30a49232ee72',
          '91fe7fad-706f-4fd4-b108-14373ff1b86c',
          '8b63c190-0e3c-4a0c-9b7a-586a108f3239',
          'a442bfd9-117d-4604-b079-3ead15ebb4fd',
          '445c998b-35f8-4345-b2d3-0c4eb947ea5b',
          '55d09c56-09db-411a-93c4-eeeb080cf3c0',
          '3d11bc66-ed17-402a-b32e-ae912e65999e',
          '8a6387f0-0d8e-467d-8a57-957e2918e70e',
          '0dd63aa5-2dfb-4499-ba01-042a4ef40189',
          '47d63b4d-6a82-45ea-8194-744218b2c54f',
          '26fd4116-4de7-4628-84ab-c158262e8782',
          'c335b2f9-ffd1-4b5c-aea6-1e534263b28f',
          'fb072f99-c352-414c-9deb-10480a9e943e',
          'ae441f3a-f53b-4232-9f14-88ce47fa37b7',
          '579d21f7-ac3b-402b-87cd-258f788f95ef',
          'db20db9b-2d36-4db8-98c3-287e43a3454b',
          '9add3233-8535-488c-82c8-bb1c5845c87e',
          '647e467b-50da-4af3-bd71-6b8bca0ed4d6',
          '21b7cb6f-bbf3-449c-8e91-a461a2b459b8',
          '74c021e8-ae00-4433-9e48-99f76e975aa5',
          '204b13b5-d0db-404b-8987-fe0953315c67',
          '3a3728c0-5afb-43e3-a632-9338e1a7d591',
          '6e91f74a-0558-48d6-ae47-ccc5afb97c84',
          'e3cb895f-3a07-4985-b6fb-7bfb23b4834e',
          'e9a5c087-9f29-4ff9-859f-6c36f87ee67a',
          'ada94cda-cf3b-4a93-ad4b-97b982dda627',
          'b2b449d0-f7bf-4874-a463-68f51ec98212',
          '17dc5bc6-84b4-4814-9b96-d41bd12b5578',
          '05ed8bfe-e8cb-49aa-86e3-756779ff7fac'],
        hasObjects: [
          // {
          //   id: '1',
          //   name: '周杰伦'
          // },
          // {
          //   id: '2',
          //   name: '昆凌'
          // },
          // {
          //   id: '3',
          //   name: '周杰伦'
          // }
        ],
        loading: true
      },
      cardTitle: this.$tc('Basic Info')
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: this.$tc('Name'),
          value: this.group.name
        },
        {
          key: this.$tc('Created by'),
          value: this.group.created_by
        },
        {
          key: this.$tc('Date Created'),
          value: this.group.date_created
        },
        {
          key: this.$tc('Comment'),
          value: this.group.comment
        }
      ]
    }
  },
  mounted() {
    // getUserGroupMembers(this.$route.params.id).then(data => {
    //   for (const i of data) {
    //     this.relationConfig.objectsId.push(i.user)
    //   }
    //   console.log(this.relationConfig.objectsId)
    // }).finally(() => {
    //   this.relationConfig.loading = false
    // })
  },
  methods: {
  }
}
</script>

<style lang='scss' scoped>

</style>
