<script lang="ts" setup>
import { ref } from 'vue'
import { defineEmits } from 'vue';

const login = ref(false)
const register = ref(false)
const emit = defineEmits(['istologin', 'istoregister'])

const tologin = () => {
  login.value = true
  emit('istologin', login.value)
}
const toregister = () => {
  register.value = true
  emit('istoregister', register.value)
}
</script>

<template>
  <el-dropdown-item @click="tologin">登录账号</el-dropdown-item>
  <el-dropdown-item @click="toregister">注册账号</el-dropdown-item>
</template>
