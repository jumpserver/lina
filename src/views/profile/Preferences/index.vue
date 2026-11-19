<template>
  <TabPage v-model:active-menu="activeMenu" :submenu="submenu" :title="$t('Preferences')">
    <keep-alive>
      <Lina v-if="activeMenu === 'Lina'" key="Lina" />
      <IBox v-else :key="activeMenu">
        <Luna :section="activeMenu === 'Luna' ? 'graphics' : 'commandLine'" />
      </IBox>
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import IBox from '@/components/Common/IBox'
import Lina from './Lina'
import Luna from './Luna'

export default {
  components: {
    IBox,
    TabPage,
    Luna,
    Lina
  },
  data() {
    return {
      activeMenu: 'Lina'
    }
  },
  computed: {
    submenu() {
      return [
        {
          title: this.$t('General'),
          name: 'Lina'
        },
        {
          title: this.$t('CommandLine'),
          name: 'CommandLine'
        },
        {
          title: this.$t('Graphics'),
          name: 'Luna'
        }
      ]
    }
  }
}
</script>
