<script lang="ts" setup>
import { ref } from 'vue'
import { defineEmits } from 'vue';

const login = ref(false)
const register = ref(false)
const emit = defineEmits(['istoLogin', 'istoRegister'])

const toLogin = () => {
  login.value = true
  emit('istoLogin', login.value)
}
const toRegister = () => {
  register.value = true
  emit('istoRegister', register.value)
}
</script>

<template>
  <el-dropdown-item @click="toLogin">登录账号</el-dropdown-item>
  <el-dropdown-item @click="toRegister">注册账号</el-dropdown-item>
</template>
