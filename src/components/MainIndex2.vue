<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import localforage from 'localforage'

const timelists = ref<DoneTime[]>([])
const groupedTimelists = ref<{ [date: string]: TodoItem[] }>({})
const dialogVisible = ref(false)
const deletecontent = ref()
const deletedonetime = ref()



// 定义 todo 项的接口
interface TodoItem {
  todohead: string;
  todocontent: string;
  tododdl: string;
  todostarttime: string;
  tododonetime: string;
}

// 定义开始时间列表数据接口
interface StartTime {
  todostarttime: string;
  itemlist: TodoItem[]
}

// 定义完成时间列表数据接口
interface DoneTime {
  tododonetime: string;
  itemlist: TodoItem[]
}

// 定义用户数据接口
interface UserData {
  password: string;
  avatar: string;
  name: string;
  todolist: StartTime[];
  donelist: DoneTime[];
}


// 删除记录
const todelete = (todocontent: string, tododonetime: string) => {
  deletecontent.value = todocontent
  deletedonetime.value = tododonetime
  dialogVisible.value = true
}
const deletelist = async () => {
  const content = deletecontent.value;
  const donetime = deletedonetime.value;
  try {
    const usernumber = await localforage.getItem('user') as string;
    const olddata = await localforage.getItem(usernumber) as UserData;
    const { password, name, avatar, todolist } = olddata;
    // 统一日期格式
    const formattedDonetime = formatDate(donetime);
    // 查找对应的完成时间分组
    const doneTimeIndex = olddata.donelist.findIndex(
      item => formatDate(item.tododonetime) === formattedDonetime
    );
    console.log('doneTimeIndex:', doneTimeIndex);
    if (doneTimeIndex !== -1) {
      // 找到对应的完成时间分组后，查找要删除的待办事项
      const itemIndex = olddata.donelist[doneTimeIndex].itemlist.findIndex(
        item => item.todocontent === content
      );
      console.log('itemIndex:', itemIndex);
      if (itemIndex !== -1) {
        // 从数组中删除该项
        olddata.donelist[doneTimeIndex].itemlist.splice(itemIndex, 1);
        // 如果删除后该日期下没有待办事项了，删除整个日期分组
        if (olddata.donelist[doneTimeIndex].itemlist.length === 0) {
          olddata.donelist.splice(doneTimeIndex, 1);
        }
        // 更新本地存储
        await localforage.setItem(usernumber, { password, name, avatar, todolist, donelist: olddata.donelist });
        console.log('删除成功');
        // 刷新数据并更新UI
        await gettimelist();
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
const gettimelist = async () => {
  const usernumber = await localforage.getItem('user') as string
  console.log('用户账号', usernumber);
  if (usernumber) {
    try {
      const userdata = await localforage.getItem(usernumber) as UserData
      console.log('用户信息', userdata);
      if (userdata) {
        timelists.value = userdata.donelist.map((doneTime) => ({
          tododonetime: doneTime.tododonetime,
          itemlist: doneTime.itemlist
        }))
        // 按日期升序排序
        timelists.value.sort((a, b) => new Date(b.tododonetime).getTime() - new Date(a.tododonetime).getTime())
        // 分组逻辑
        const grouped: { [date: string]: TodoItem[] } = {};
        timelists.value.forEach((timelist) => {
          timelist.itemlist.forEach((item) => {
            const date = getDateOnly(item.tododonetime);
            if (!grouped[date]) {
              grouped[date] = [];
            }
            grouped[date].push(item);
          });
        });
        groupedTimelists.value = grouped;
        console.log("读取成功", timelists.value)
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
  gettimelist()
})
</script>

<template>
  <div class="custom-timeline">
    <div class="custom-timeline-item" v-for="(groupedItems, date) in groupedTimelists" :key="date">
      <div class="timestamp"> --- {{ formatDate(date) }} --- </div>
      <div class="todo-container">
        <div class="todocard" v-for="(item, itemIndex) in groupedItems" :key="itemIndex">
          <div class="cardhead">
            <h2>--{{ item.todohead }}--</h2>
            <button @click="todelete(item.todocontent, item.tododonetime)"></button>
          </div>
          <hr>
          <div class="content">{{ item.todocontent }}</div>
          <hr>
          <div class="cardfoot">
            <h4>Donetime: {{ formatDate(getDateOnly(item.tododonetime)) }}</h4>
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
        <el-button type="primary" @click="deletelist">
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
