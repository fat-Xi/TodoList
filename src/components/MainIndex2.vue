<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import localforage from 'localforage'

const timeLists = ref<DoneTime[]>([])
const groupedTimelists = ref<{ [date: string]: TodoItem[] }>({})
const dialogVisible = ref(false)
const deleteContent = ref()
const deleteDonetime = ref()

// 定义 todo 项的接口
interface TodoItem {
  todoHead: string;
  todoContent: string;
  todoDdl: string;
  todoStartTime: string;
  todoDoneTime: string;
}
// 定义开始时间列表数据接口
interface StartTime {
  startTime: string;
  itemList: TodoItem[]
}
// 定义完成时间列表数据接口
interface DoneTime {
  doneTime: string;
  itemList: TodoItem[]
}
// 定义用户数据接口
interface UserData {
  password: string;
  avatar: string;
  name: string;
  todoList: StartTime[];
  doneList: DoneTime[];
}

// 删除记录
const toDelete = (todoContent: string, todoDoneTime: string) => {
  deleteContent.value = todoContent
  deleteDonetime.value = todoDoneTime
  dialogVisible.value = true
}
const deleteList = async () => {
  const content = deleteContent.value;
  const doneTime = deleteDonetime.value;
  try {
    const userNumber = await localforage.getItem('user') as string;
    const oldData = await localforage.getItem(userNumber) as UserData;
    const { password, name, avatar, todoList } = oldData;
    // 统一日期格式
    const formattedDonetime = formatDate(doneTime);
    // 查找对应的完成时间分组
    const doneTimeIndex = oldData.doneList.findIndex(
      item => formatDate(item.doneTime) === formattedDonetime
    );
    console.log('doneTimeIndex:', doneTimeIndex);
    if (doneTimeIndex !== -1) {
      // 找到对应的完成时间分组后，查找要删除的待办事项
      const itemIndex = oldData.doneList[doneTimeIndex].itemList.findIndex(
        item => item.todoContent === content
      );
      console.log('itemIndex:', itemIndex);
      if (itemIndex !== -1) {
        // 从数组中删除该项
        oldData.doneList[doneTimeIndex].itemList.splice(itemIndex, 1);
        // 如果删除后该日期下没有待办事项了，删除整个日期分组
        if (oldData.doneList[doneTimeIndex].itemList.length === 0) {
          oldData.doneList.splice(doneTimeIndex, 1);
        }
        // 更新本地存储
        await localforage.setItem(userNumber, { password, name, avatar, todoList, doneList: oldData.doneList });
        console.log('删除成功');
        // 刷新数据并更新UI
        await getList();
      } else {
        console.log('未找到要删除的待办事项');
      }
    } else {
      console.log('未找到对应的完成时间分组');
    }
  } catch (error) {
    console.log('删除记录错误', error);
    alert('删除失败，请重试');
  }
};


// 获取数据
const getList = async () => {
  const userNumber = await localforage.getItem('user') as string
  console.log('用户账号', userNumber);
  if (userNumber) {
    try {
      const userData = await localforage.getItem(userNumber) as UserData
      console.log('用户信息', userData);
      if (userData) {
        timeLists.value = userData.doneList.map((doneTime) => ({
          doneTime: doneTime.doneTime,
          itemList: doneTime.itemList
        }))
        // 按日期升序排序
        timeLists.value.sort((a, b) => new Date(b.doneTime).getTime() - new Date(a.doneTime).getTime())
        // 分组逻辑
        const grouped: { [date: string]: TodoItem[] } = {};
        timeLists.value.forEach((timeList) => {
          timeList.itemList.forEach((item) => {
            const date = getDateOnly(item.todoDoneTime);
            if (!grouped[date]) {
              grouped[date] = [];
            }
            grouped[date].push(item);
          });
        });
        groupedTimelists.value = grouped;
        console.log("读取成功", timeLists.value)
      }
    } catch (error) {
      console.log("读取错误", error)
    }
  }
  else {
    document.querySelector('.add')?.classList.add('none')
  }
  dialogVisible.value = false;
}

// 提取日期函数
const getDateOnly = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // 使用 toLocaleDateString 方法并指定日期格式
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
}

// 格式化日期函数
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  // 使用 padStart 确保月份和日期为两位数
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="custom-timeline">
    <div class="custom-timeline-item" v-for="(groupedItems, date) in groupedTimelists" :key="date">
      <div class="timestamp"> --- {{ formatDate(date) }} --- </div>
      <div class="todo-container">
        <div class="todocard" v-for="(item, itemIndex) in groupedItems" :key="itemIndex">
          <div class="cardhead">
            <h2>--{{ item.todoHead }}--</h2>
            <button @click="toDelete(item.todoContent, item.todoDoneTime)"></button>
          </div>
          <hr>
          <div class="content">{{ item.todoContent }}</div>
          <hr>
          <div class="cardfoot">
            <h4>Donetime: {{ formatDate(getDateOnly(item.todoDoneTime)) }}</h4>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 删除确认 -->
  <el-dialog v-model="dialogVisible" title="确定删除这个完成记录？" width="500" top="32vh">
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="deleteList">
          删除
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>


<style scoped>
@font-face {
  font-family: 'icomoon';
  src: url('fonts/icomoon.eot?nlie2y');
  src: url('fonts/icomoon.eot?nlie2y#iefix') format('embedded-opentype'),
    url('fonts/icomoon.ttf?nlie2y') format('truetype'),
    url('fonts/icomoon.woff?nlie2y') format('woff'),
    url('fonts/icomoon.svg?nlie2y#icomoon') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.custom-timeline-item {
  margin-bottom: 50px;
}

.timestamp {
  font-size: 28px;
  font-weight: 700;
  color: rgb(100, 145, 240);
  margin-bottom: 20px;
  display: block;
  font-family: 'icomoon';
}

.todo-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 30px 0 0 30px;
  border-radius: 20px;
  background-color: white;
}

.todocard {
  height: 250px;
  width: 325px;
  margin-right: 27px;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 20px;
  background-color: rgb(130, 165, 245);
}

.todocard .cardhead {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cardhead h2 {
  letter-spacing: 0.08em;
  color: white;
}

.cardhead button {
  width: 25px;
  height: 25px;
  margin-top: 5px;
  margin-right: 5px;
  border: 1.5px solid white;
  border-radius: 25px;
  font-size: 20px;
  background-color: transparent;
  color: white;
  font-family: 'icomoon';
}

.cardhead button:hover {
  border: 2px solid white;
}

.content {
  height: 150px;
  margin: 10px 0 10px 0;
  font-size: 20px;
  color: white;
  word-wrap: break-word;
}

.todocard .cardfoot {
  display: flex;
  justify-content: space-between;
  color: white;
}

.cardfoot h4 {
  margin-top: 12px;
}
</style>
