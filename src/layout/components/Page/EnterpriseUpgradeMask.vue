<template>
  <div class="content-disabled-mask">
    <IBox class="upgrade-card" shadow="always">
      <div class="disabled-content">
        <div class="lock-icon">
          <el-icon><Unlock /></el-icon>
        </div>
        <div class="disabled-text">
          {{ $t('UpgradeEnterpriseEditionHelpText') }}
        </div>
        <el-button class="upgrade-btn" type="primary" size="default" @click="handleUpgrade">
          {{ $t('UpgradeEnterpriseEdition') }}
        </el-button>
      </div>
    </IBox>
  </div>
</template>

<script setup>
import IBox from '@/components/Common/IBox/index.vue'

function handleUpgrade() {
  window.open('https://www.jumpserver.com/pricing', '_blank')
}
</script>

<style lang="scss" scoped>
.content-disabled-mask {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .upgrade-card {
    width: min(500px, calc(100% - 32px));
    position: absolute;
    top: 30%;
  }

  .disabled-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .lock-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px auto;

    i {
      font-size: 40px;
      color: #909399;
    }
  }

  .disabled-text {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 20px;
    padding: 10px;
  }

  .upgrade-btn {
    min-width: 140px;
    margin: 10px auto;
  }
}
</style>
