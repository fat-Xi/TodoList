<script lang="ts" setup>
import {ref} from 'vue'
import headnav from '@/components/HeadNav.vue';
import mainindex1 from '@/components/MainIndex1.vue';
import mainindex2 from '@/components/MainIndex2.vue';

const complete=ref(false)

const iscomplete=(value:boolean)=>{
  complete.value=value
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <component :is="headnav" @isscomplete="iscomplete"></component>
      </el-header>
      <el-main>
        <component :is="complete ? mainindex2 : mainindex1"></component>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 100%;
  height: 100px;
  background-color: rgb(100, 145, 240);
  overflow: hidden;
}

.el-main {
  height: 100vh;
  width: 100vw;
  margin-top: 100px;
  padding: 40px;
  background-color: rgb(240, 240, 245);
}
</style>
