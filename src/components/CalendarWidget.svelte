<script>
  let currentDate = $state(new Date())
  let mounted = $state(false)
  
  const DAYS = ['日', '一', '二', '三', '四', '五', '六']
  
  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
  }
  
  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay()
  }
  
  function generateCalendar() {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    
    const calendar = []
    for (let i = 0; i < firstDay; i++) {
      calendar.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push(i)
    }
    return calendar
  }
  
  function prevMonth(e) {
    e?.stopPropagation?.()
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  }
  
  function nextMonth(e) {
    e?.stopPropagation?.()
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  }
  
  function goToToday(e) {
    e?.stopPropagation?.()
    currentDate = new Date()
  }
  
  const today = new Date()
  const calendarDays = $derived(generateCalendar())
  const currentMonth = $derived(currentDate.getMonth() + 1)
  const currentYear = $derived(currentDate.getFullYear())
  
  import { onMount } from 'svelte'
  onMount(() => {
    requestAnimationFrame(() => { mounted = true })
  })
</script>

<div class="calendar-widget" class:mounted>
  {#if mounted}
    <div class="calendar-header">
      <button class="nav-btn" onclick={prevMonth} onkeydown={(e) => e.stopPropagation()} aria-label="上一月">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button class="calendar-title" onclick={goToToday} onkeydown={(e) => e.stopPropagation()} aria-label="回到今天">
        {currentYear}年{currentMonth}月
      </button>
      <button class="nav-btn" onclick={nextMonth} onkeydown={(e) => e.stopPropagation()} aria-label="下一月">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>

    <div class="calendar-weekdays">
      {#each DAYS as day}
        <span class="weekday">{day}</span>
      {/each}
    </div>

    <div class="calendar-days">
      {#each calendarDays as day}
        <span
          class="calendar-day"
          class:other-month={!day}
          class:today={day === today.getDate() &&
                     currentMonth === today.getMonth() + 1 &&
                     currentYear === today.getFullYear()}
        >
          {day || ''}
        </span>
      {/each}
    </div>
  {:else}
    <div class="calendar-skeleton">
      <div class="skeleton skeleton-cal-header"></div>
      <div class="skeleton skeleton-cal-weekdays"></div>
      <div class="skeleton-cal-grid">
        {#each Array(31) as _}
          <div class="skeleton skeleton-cal-cell"></div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .calendar-widget {
    width: 260px;
    padding: 18px;
    background-color: rgba(26, 26, 26, 0.45);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    opacity: 0;
    transition: opacity 0.6s ease;
  }
  
  .calendar-widget.mounted {
    opacity: 1;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .nav-btn {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 12px;
    padding: 4px;
    transition: color 0.2s;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }
  
  .nav-btn:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }
  
  .calendar-title {
    background: none;
    border: none;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background 0.2s;
  }
  
  .calendar-title:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  
  .calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }
  
  .weekday {
    font-size: 10px;
    color: #666;
    text-align: center;
    padding: 6px 0;
  }
  
  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
  
  .calendar-day {
    font-size: 11px;
    color: #ccc;
    text-align: center;
    padding: 8px 0;
    border-radius: 8px;
    cursor: default;
    transition: background 0.2s;
  }
  
  .calendar-day:hover:not(.other-month) {
    background: rgba(255, 255, 255, 0.08);
  }
  
  .calendar-day.other-month {
    color: #333;
  }
  
  .calendar-day.today {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    font-weight: 600;
  }
  
  @media (max-width: 1200px) {
    .calendar-widget {
      display: none;
    }
  }

  /* ===== 骨架屏 ===== */
  .calendar-skeleton {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skeleton-cal-header {
    height: 28px;
    width: 60%;
    margin: 0 auto;
    border-radius: 6px;
  }

  .skeleton-cal-weekdays {
    height: 24px;
    width: 100%;
    border-radius: 4px;
  }

  .skeleton-cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .skeleton-cal-cell {
    aspect-ratio: 1;
    border-radius: 4px;
    height: 24px;
  }
</style>
