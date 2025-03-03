<script setup lang="ts">
import {ref, computed} from 'vue'
import { DateTime } from 'luxon'
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
const locale = ref('uk-UA');

const currentDate = ref(DateTime.now())

const daysInMonth = computed(() => {
  return currentDate.value.daysInMonth
})

const firstDayOfMonth = computed(() => {
  return currentDate.value.startOf('month').weekday - 1 // Adjust to make Monday the first day
})

const lastDayOfMonth = computed(() => {
  return currentDate.value.endOf('month').weekday - 1 // Adjust to make Monday the first day
})


const monthName = computed(() => {
  return currentDate.value.setLocale(locale.value).toFormat('LLLL')
})

const calendarDays = computed(() => {
  const days = []
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push('')
  }
  // Add the days of the month
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push(i)
  }
  // Add empty cells for days after the last day of month
  for (let i = lastDayOfMonth.value + 1; i < 7; i++) {
    days.push('')
  }
  return days
})

const calendarWeeks = computed(() => {
  const weeks = []
  for (let i = 0; i < calendarDays.value.length; i += 7) {
    weeks.push(calendarDays.value.slice(i, i + 7))
  }
  return weeks
})

const previousMonth = () => {
  currentDate.value = currentDate.value.minus({ months: 1 })
}

const nextMonth = () => {
  currentDate.value = currentDate.value.plus({ months: 1 })
}

const weekdays = computed(() => {
  const baseDate = DateTime.fromObject({ year: 2021, month: 1, day: 4 }) // Monday, January 4, 2021
  return Array.from({ length: 7 }).map((_, i) =>
      baseDate.plus({ days: i }).setLocale(locale.value).toFormat('ccc')
  )
})


const downloadPDF = async () => {
  const container = document.getElementById('calendar-container');
  if (!container) return;


  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1190, // A3 width in pixels (approximately)
    windowHeight: 842,  // A3 height in pixels (approximately)
    foreignObjectRendering: true,
    removeContainer: false,
    ignoreElements: (element) => {
      const style = window.getComputedStyle(element);
      return style.color.startsWith('oklch');
    },
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    allowTaint: true,
    onclone: (document, element) => {
      // Ensure the cloned element has correct dimensions
      element.style.width = '420mm';
      element.style.height = '290mm';
      element.style.position = 'absolute';
      element.style.top = '-10';
      element.style.left = '0';
    }
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3'
  });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  pdf.addImage(imgData, 'JPEG', 0, 0, 420, 297); // A3 dimensions in mm

  pdf.save(`calendar_${monthName.value}_${currentDate.value.year}.pdf`);
};

const count = ref(3)
const initials = ref(['', '', ''])

function changeFamilySize() {
  if (initials.value.length > count.value) {
    initials.value = initials.value.slice(0, count.value)
  } else {
    initials.value = [...initials.value, ...Array(count.value - initials.value.length).fill('')]
  }
}

</script>

<template>
  <div class="p-16">
    <div class="flex gap-8 flex-row items-center">
      <select v-model="locale" class="input">
        <option value="uk-UA">🇺🇦</option>
        <option value="en-US">🇺🇸</option>
      </select>
      <select v-model="count" class="input" @change="changeFamilySize">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <div class="flex flex-row items-center gap-2">

        <label>Initials:</label>
        <input type="text" class="input w-[4rem]" v-for="(_, index) in initials" v-model="initials[index]">
      </div>
      <button @click="downloadPDF" class="input bg-green-200 cursor-pointer">Download PDF</button>
    </div>
    <div class="relative h-[290mm] w-[420mm]" id="calendar-container" style="zoom: 0.8">
      <div class="flex justify-between items-center p-2 h-16 w-full">
        <button @click="previousMonth">&lt;</button>
        <h2 class="text-4xl">{{ monthName }} {{ currentDate.year }}</h2>
        <button @click="nextMonth">&gt;</button>
      </div>

      <div class="flex flex-col align-top h-[94%] border-b-4 ">
        <div class="grid [grid-template-columns:3rem_repeat(7,1fr)]">
          <div></div>
          <div class="weekday" v-for="wday in weekdays">{{wday}}</div>
        </div>
        <div class="grid [grid-template-columns:3rem_repeat(7,1fr)] border grow">

          <template v-for="(week, index) in calendarWeeks" :key="index">
            <div class="day ">
              <div class="day-part name" v-for="i in initials">{{ i }}</div>
            </div>
            <div
                v-for="(day, index) in week"
                :key="index"
                class="day contain-content"
                :class="{
                  'disabled-day': !day,
                }"
            >
              <div class="day-part" v-for="_ in initials"></div>
              <div class="date absolute bottom-0 right-0">{{ day }}</div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>


</template>

<style scoped>
@reference "tailwindcss";

.weekday {
  @apply text-center py-2 h-[5rem] text-4xl capitalize ;
}

.day {
  @apply text-center border-r-3 border-t-3 justify-stretch flex flex-col
}


.disabled-day {
  @apply border-r-gray-400;
}



.day-part {
  @apply flex-1 border-b border-dotted grow items-center justify-center flex;
}

.day-part:last-child {
  @apply border-transparent;
}

.date {
  @apply text-end pr-2 text-4xl grow;
}

.name {
  @apply text-xl font-bold
}

.input {
  @apply p-2 border rounded-md
}
</style>