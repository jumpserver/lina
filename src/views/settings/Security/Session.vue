<template>
  <IBox>
    <GenericCreateUpdateForm submit-method="patch" v-bind="config" />
    <WatermarkHelpDialog :variables="sessionVariables" :visible.sync="showSessionHelpDialog" />
    <WatermarkHelpDialog :variables="consoleVariables" :visible.sync="showConsoleHelpDialog" />
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import WatermarkHelpDialog from './WatermarkHelpDialog.vue'

export default {
  name: 'SessionSecurity',
  components: { GenericCreateUpdateForm, IBox, WatermarkHelpDialog },
  data() {
    return {
      showSessionHelpDialog: false,
      showConsoleHelpDialog: false,
      sessionVariables: {
        'userId': this.$t('userId'),
        'name': this.$t('name'),
        'userName': this.$t('userName'),
        'currentTime': this.$t('currentTime'),
        'assetId': this.$t('assetId'),
        'assetName': this.$t('assetName'),
        'assetAddress': this.$t('assetAddress')
      },
      consoleVariables: {
        'userId': this.$t('userId'),
        'name': this.$t('name'),
        'userName': this.$t('userName'),
        'currentTime': this.$t('currentTime')
      },
      config: {
        url: '/api/v1/settings/setting/?category=security_session',
        hasDetailInMsg: false,
        fields: [
          [
            this.$t('Basic'),
            [
              'SECURITY_SESSION_SHARE',
              'SESSION_EXPIRE_AT_BROWSER_CLOSE',
              'VIEW_ASSET_ONLINE_SESSION_INFO',
              'SECURITY_MAX_IDLE_TIME',
              'SECURITY_MAX_SESSION_TIME'
            ]
          ],
          [
            this.$t('Watermark'),
            this.$store.getters.hasValidLicense ? [
              'SECURITY_WATERMARK_ENABLED',
              'SECURITY_WATERMARK_SESSION_CONTENT',
              'SECURITY_WATERMARK_CONSOLE_CONTENT',
              'SECURITY_WATERMARK_COLOR',
              'SECURITY_WATERMARK_FONT_SIZE',
              'SECURITY_WATERMARK_HEIGHT',
              'SECURITY_WATERMARK_WIDTH',
              'SECURITY_WATERMARK_ROTATE'
            ] : ['SECURITY_WATERMARK_ENABLED']
          ]
        ],
        fieldsMeta: {
          SECURITY_WATERMARK_SESSION_CONTENT: {
            helpTextFormatter: () => {
              const handleClick = () => {
                this.showSessionHelpDialog = true
              }
              return (
                <i onClick={handleClick} class='fa fa-question-circle' style='cursor: pointer'>{this.$t('Help')}</i>
              )
            }
          },
          SECURITY_WATERMARK_CONSOLE_CONTENT: {
            helpTextFormatter: () => {
              const handleClick = () => {
                this.showConsoleHelpDialog = true
              }
              return (
                <i onClick={handleClick} class='fa fa-question-circle' style='cursor: pointer'>{this.$t('Help')}</i>
              )
            }
          },
          SECURITY_WATERMARK_COLOR: {
            component: 'el-color-picker',
            el: {
              size: 'small',
              'show-alpha': true,
              predefine: [
                'rgba(128, 128, 128, 0.25)',
                'rgba(0, 0, 0, 0.15)',
                'rgba(255, 255, 255, 0.2)',
                'rgba(176, 176, 176, 0.3)',
                'rgba(91, 155, 213, 0.25)',
                'rgba(192, 80, 77, 0.2)',
                'rgba(112, 173, 71, 0.2)',
                'rgba(255, 192, 0, 0.18)'
              ]
            }
          }
        },
        onSubmit: async(validValues) => {
          const url = '/api/v1/settings/setting/?category=security_session'

          try {
            const res = await this.$axios.patch(url, validValues)

            if (res) {
              this.$message.success(this.$t('UpdateSuccessMsg'))
              this.$store.commit('settings/SET_SECURITY_WATERMARK_ENABLED', res['SECURITY_WATERMARK_ENABLED'])
            }
          } catch (error) {
            throw new Error(error)
          }
        }
      }
    }
  }
}
</script>
