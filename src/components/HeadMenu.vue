<script lang="ts" setup>
import { ref } from 'vue'

const complete = ref(false)

const emit = defineEmits(['iscomplete'])

//选中代办
const toincomplete = () => {
  complete.value = false
  emit('iscomplete', complete.value)
  document.querySelector('.active')?.classList.remove('active')
  document.querySelector('.incomplete')?.classList.add('active')
}
// 选中已完成
const tocomplete = () => {
  complete.value = true
  emit('iscomplete', complete.value)
  document.querySelector('.active')?.classList.remove('active')
  document.querySelector('.complete')?.classList.add('active')
}
</script>

<template>
  <ul>
    <li class="hover active incomplete" @click="toincomplete"> Todo</li>
    <li class="hover complete" @click="tocomplete"> Done</li>
  </ul>
</template>

<style scoped>
@font-face {
  font-family: 'icomoon';
  src: url('fonts/icomoon.eot?vumcmg');
  src: url('fonts/icomoon.eot?vumcmg#iefix') format('embedded-opentype'),
    url('fonts/icomoon.ttf?vumcmg') format('truetype'),
    url('fonts/icomoon.woff?vumcmg') format('woff'),
    url('fonts/icomoon.svg?vumcmg#icomoon') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

ul {
  display: flex;
  position: absolute;
  left: 650px;
  padding-top: 30px;
}

li {
  width: 200px;
  height: 70px;
  text-align: center;
  line-height: 70px;
  font-size: 30px;
  border-radius: 20px 20px 0 0;
  color: white;
  cursor: default;
  font-family: 'icomoon';
}

.active {
  background-color: white;
  color: rgb(100, 145, 240);
  cursor: default;
}
</style>
