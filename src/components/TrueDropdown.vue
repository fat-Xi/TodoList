<script lang="ts" setup>
import { ref } from 'vue'

const change = ref(false)
const login = ref(false)
const logout = ref(false)
const emit = defineEmits(['istoChange', 'changeLogin', 'istoLogout'])

const toChange = () => {
  change.value = true
  emit('istoChange', change.value)
}

const toLogin = () => {
  login.value = true
  emit('changeLogin', login.value)
}

const toLogout = () => {
  logout.value = true
  emit('istoLogout', logout.value)
}

</script>

<template>
  <el-dropdown-item @click="toChange">编辑资料</el-dropdown-item>
  <el-dropdown-item @click="toLogin">切换账号</el-dropdown-item>
  <el-dropdown-item style="color: red;" @click="toLogout">退出登录</el-dropdown-item>
</template>
