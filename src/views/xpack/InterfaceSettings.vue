<template>
  <TabPage :submenu="submenu" :active-menu="activemenu">
    <IBox>
      <GenericCreateUpdateForm
        :fields="fields"
        :url="url"
        :update-success-next-route="successUrl"
        :fields-meta="fieldsMeta"
      />
    </IBox>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import { IBox } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { UploadField } from '@/components'

export default {
  name: 'InterfaceSettings',
  components: {
    IBox,
    TabPage,
    GenericCreateUpdateForm
  },
  data() {
    return {
      activemenu: 'interface',
      submenu: [
        {
          title: 'interface-settings',
          name: 'interface'
        }
      ],
      successUrl: { name: 'Settings' },
      fields: [
        ['', ['login_title']],
        ['', ['login_image']],
        ['', ['favicon']],
        ['', ['logo_index']],
        ['', ['logo_logout']]
      ],
      fieldsMeta: {
        login_title: {
          label: 'login_title'
        },
        login_image: {
          label: 'login_image'
        },
        favicon: {
          label: 'favicon'
        },
        logo_index: {
          label: 'logo_index'
        },
        logo_logout: {
          component: UploadField,
          label: 'logo_logout',
          el: {
            action: '/api/v1/xpack/interface/setting/',
            autoUpload: false,
            name: 'logo_logout',
            onChange: function(file, fileList) {
              console.log(file, fileList)
            }
          },
          on: {
            focus: ([event], updateForm) => {
              console.log(event.target.value) // output: input value
            },
            customEvent: ([value, msg], updateForm) => {
              console.log(msg) // output: 'message'
            }
          }
        }
      },
      url: '/api/v1/xpack/interface/setting'
    }
  }
}
</script>

<style scoped>

</style>
