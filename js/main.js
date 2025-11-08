const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const calendarDisplay = document.getElementById("calendarDisplay");
const daysGrid = document.getElementById("daysGrid");
const monthSelectorBtn = document.getElementById("monthSelector");
const yearSelectorBtn = document.getElementById("yearSelector");

const selectorModal = document.getElementById("selectorModal");
const selectorTitle = document.getElementById("selectorTitle");
const selectorList = document.getElementById("selectorList");

const eventFormModal = document.getElementById("eventFormModal");
const eventDetailsModal = document.getElementById("eventDetailsModal");

const popupEventDate = document.getElementById("popupEventDate");
const eventDetailsContent = document.getElementById("eventDetailsContent");
const eventForm = document.getElementById("eventForm");
const eventDateDisplay = document.getElementById("eventDateDisplay");
const eventDayDateInput = document.getElementById("eventDayDate");

// (Mới) DOM Elements cho Sidebar
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const searchEventsInput = document.getElementById('searchEventsInput');
const searchResults = document.getElementById('searchResults');
const gotoDateInput = document.getElementById('gotoDateInput');
const lunarToggle = document.getElementById('lunarToggle');
const themeToggle = document.getElementById('themeToggle'); // (Mới) Thêm theme toggle
const importFileBtn = document.getElementById('importFileBtn');
const exportFileBtn = document.getElementById('exportFileBtn');
const colorPicker = document.getElementById('colorPicker');
const eventColorInput = document.getElementById('eventColor');
const addAnotherEventBtn = document.getElementById('addAnotherEventBtn'); // (Mới) Thêm nút

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDayForEvent = null;
let showLunar = false; 

function loadEvents() {
  return JSON.parse(localStorage.getItem("calendarEvents") || "{}");
}

function saveEvents(e) {
  localStorage.setItem("calendarEvents", JSON.stringify(e));
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(d) {
  const p = d.split("-");
  return `${p[2]}/${p[1]}/${p[0]}`;
}

function getLunarDate(d, m, y) {
  // Placeholder
  let lunarDay = d;
  let lunarMonth = (m === 1 ? 12 : m - 1);
  if (d > 28) lunarDay = d - 28;
  if (d === 1) lunarMonth = m;
  if (d === 30) lunarMonth = m;
  return `${lunarDay}/${lunarMonth}`;
}

function renderCalendar() {
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const firstDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  daysGrid.innerHTML = "";
  calendarDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  monthSelectorBtn.textContent = monthNames[currentMonth];
  yearSelectorBtn.textContent = currentYear;

  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  for (let i = firstDay; i > 0; i--) {
    const day = daysInPrevMonth - i + 1;
    daysGrid.appendChild(createCell(day, "inactive", null));
  }

  const today = new Date();
  const events = loadEvents();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth, d);
    const key = formatDate(date);
    const cell = createCell(d, "", key);

    if (today.toDateString() === date.toDateString()) {
      const span = cell.querySelector(".day-number");
      span.classList.add("current-day");
    }
    
    const dayEvents = events[key] || [];
    if (dayEvents.length) {
      // (MỚI) Hiển thị nhiều dot (tối đa 3)
      const dotsContainer = document.createElement('div');
      dotsContainer.style.display = 'flex';
      dotsContainer.style.gap = '3px';
      dotsContainer.style.position = 'absolute';
      dotsContainer.style.bottom = '8px';
      
      dayEvents.slice(0, 3).forEach(event => {
          const dot = document.createElement("div");
          dot.className = "event-dot";
          dot.style.backgroundColor = event.color || 'var(--primary)';
          dot.style.position = 'relative';
          dot.style.bottom = 'auto';
          dotsContainer.appendChild(dot);
      });
      
      dotsContainer.style.zIndex = '3';
      cell.appendChild(dotsContainer);
      cell.onclick = (e) => { e.stopPropagation(); showEventDetails(key); };
    } else {
      cell.onclick = (e) => { e.stopPropagation(); showEventForm(key); };
    }
    daysGrid.appendChild(cell);
  }
  
  const totalCells = 42; 
  const filledCells = firstDay + daysInMonth;
  for (let i = 1; i <= totalCells - filledCells; i++) {
    daysGrid.appendChild(createCell(i, "inactive", null));
  }
}

function createCell(day, className, dateKey) {
  const div = document.createElement("div");
  div.className = `day-cell ${className}`;
  if(dateKey) div.dataset.date = dateKey; 

  const num = document.createElement("span");
  num.className = "day-number";
  num.textContent = day;
  div.appendChild(num);
  
  const lunar = document.createElement("span");
  lunar.className = "lunar-day";
  if (!className && dateKey) {
     const [y, m, d] = dateKey.split('-').map(Number);
     lunar.textContent = getLunarDate(d, m, y);
  }
  div.appendChild(lunar);

  return div;
}

function changeMonth(x) {
  currentMonth += x;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

function showModal(id) {
    document.getElementById(id).classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

function showSelector(type) {
  selectorList.innerHTML = "";
  selectorTitle.textContent = type === "month" ? "Select month" : "Select year";
  const opts = type === "month" 
    ? monthNames.map((n, i) => ({ n, i })) 
    : [...Array(11)].map((_, i) => ({ n: currentYear - 5 + i, i: currentYear - 5 + i }));

  opts.forEach(o => {
    const b = document.createElement("button");
    b.textContent = o.n;
    b.onclick = () => {
      if (type === "month") currentMonth = o.i;
      else currentYear = o.i;
      renderCalendar();
      closeModal("selectorModal");
    };
    selectorList.appendChild(b);
  });
  showModal("selectorModal");
}

function showEventForm(date) {
  selectedDayForEvent = date;
  eventDateDisplay.textContent = formatDisplayDate(date);
  eventDayDateInput.value = date;
  eventForm.reset();
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  const defaultColorEl = document.querySelector('.color-swatch[data-color="#2563eb"]');
  if (defaultColorEl) defaultColorEl.classList.add('selected');
  eventColorInput.value = '#2563eb';
  
  showModal("eventFormModal");
  document.getElementById("eventTitle").focus();
}

eventForm.onsubmit = e => {
  e.preventDefault();
  const title = document.getElementById("eventTitle").value;
  const details = document.getElementById("eventDetails").value;
  const color = eventColorInput.value; 
  const date = eventDayDateInput.value;
  if (!title) return;
  const ev = loadEvents();
  if (!ev[date]) ev[date] = [];
  ev[date].push({ title, details, color }); 
  saveEvents(ev);
  renderCalendar();
  closeModal("eventFormModal");
};

// (MỚI) Sửa lại hàm showEventDetails
function showEventDetails(date) {
  selectedDayForEvent = date;
  const ev = loadEvents()[date] || [];
  popupEventDate.textContent = formatDisplayDate(date);
  
  eventDetailsContent.innerHTML = ev.length ? ev.map((e, index) => `
    <div class="event-list-item">
        <div class="event-list-item-details">
            <b style="color: ${e.color || 'var(--primary)'}">${e.title}</b>
            <p>${e.details || "No details"}</p>
        </div>
        <button class="delete-event-btn" data-index="${index}" aria-label="Delete event ${e.title}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
    </div>
  `).join("") : "<p>No events</p>";
  
  showModal("eventDetailsModal");
}

// (MỚI) Hàm xóa 1 sự kiện
function deleteSingleEvent(date, index) {
    const ev = loadEvents();
    if (!ev[date] || !ev[date][index]) return;
    
    ev[date].splice(index, 1); // Xóa sự kiện tại index
    
    if (ev[date].length === 0) { // Nếu không còn sự kiện nào, xóa key
        delete ev[date];
    }
    
    saveEvents(ev);
    renderCalendar();
    
    // Tải lại modal hoặc đóng nếu hết sự kiện
    if (ev[date]) {
        showEventDetails(date);
    } else {
        closeModal('eventDetailsModal');
    }
}

// (MỚI) Toast notification
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// (MỚI) --- Sidebar Functions ---
function openSidebar() {
  sidebar.classList.add('open');
  document.body.classList.add('sidebar-open');
  if (window.innerWidth < 1024) {
    sidebarOverlay.classList.add('open');
  }
}

function closeSidebar() {
  sidebar.classList.remove('open');
  document.body.classList.remove('sidebar-open');
  sidebarOverlay.classList.remove('open');
}

function gotoDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    currentYear = year;
    currentMonth = month - 1;
    renderCalendar();
    
    setTimeout(() => {
      const cell = document.querySelector(`.day-cell[data-date="${dateString}"]`);
      if (cell) {
        cell.style.transition = 'none';
        cell.style.backgroundColor = 'var(--primary-light)';
        cell.style.borderColor = 'var(--primary-dark)';
        setTimeout(() => {
          cell.style.transition = 'var(--transition)';
          cell.style.backgroundColor = '';
          cell.style.borderColor = '';
        }, 1000);
      }
    }, 100);
    
    closeSidebar();
}

// (MỚI) --- Theme Functions ---
function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('calendarTheme', 'dark');
    themeToggle.checked = true;
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('calendarTheme', 'light');
    themeToggle.checked = false;
  }
}

// --- Event Listeners ---
menuToggleBtn.onclick = openSidebar;
closeSidebarBtn.onclick = closeSidebar;
sidebarOverlay.onclick = closeSidebar;

document.getElementById("prevMonthBtn").onclick = () => changeMonth(-1);
document.getElementById("nextMonthBtn").onclick = () => changeMonth(1);
monthSelectorBtn.onclick = () => showSelector("month");
yearSelectorBtn.onclick = () => showSelector("year");
document.getElementById("addEventBtn").onclick = () => showEventForm(formatDate(new Date()));

// (MỚI) Nút thêm mới từ modal chi tiết
addAnotherEventBtn.onclick = () => {
    closeModal('eventDetailsModal');
    // selectedDayForEvent vẫn đang giữ ngày
    if (selectedDayForEvent) {
        showEventForm(selectedDayForEvent);
    }
};

// (MỚI) Listener cho nút xóa (event delegation)
eventDetailsContent.addEventListener('click', e => {
    const deleteBtn = e.target.closest('.delete-event-btn');
    if (deleteBtn) {
        const index = parseInt(deleteBtn.dataset.index, 10);
        if (selectedDayForEvent && index >= 0) {
            deleteSingleEvent(selectedDayForEvent, index);
        }
    }
});

// (MỚI) Sidebar Listeners
lunarToggle.onchange = (e) => {
  showLunar = e.target.checked;
  document.body.classList.toggle('lunar-visible', showLunar);
  localStorage.setItem('calendarShowLunar', showLunar);
};

// (MỚI) Theme listener
themeToggle.onchange = (e) => {
  setTheme(e.target.checked ? 'dark' : 'light');
};

searchEventsInput.oninput = (e) => {
  const searchTerm = e.target.value.toLowerCase();
  searchResults.innerHTML = '';
  if (searchTerm.length < 2) return;
  
  const events = loadEvents();
  let found = [];
  for (const date in events) {
      events[date].forEach(event => {
          const title = (event.title || '').toLowerCase();
          const details = (event.details || '').toLowerCase();
          if (title.includes(searchTerm) || details.includes(searchTerm)) {
              found.push({ date, event });
          }
      });
  }
  
  if(found.length === 0) {
    searchResults.innerHTML = '<li>No results found...</li>';
    return;
  }
  
  found.sort((a,b) => new Date(a.date) - new Date(b.date)); 
  
  found.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<small>${formatDisplayDate(item.date)}</small> ${item.event.title}`;
      li.onclick = () => gotoDate(item.date);
      searchResults.appendChild(li);
  });
};

gotoDateInput.onchange = (e) => {
  if(e.target.value) gotoDate(e.target.value);
};

importFileBtn.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (res) => {
            try {
                const importedEvents = JSON.parse(res.target.result);
                const currentEvents = loadEvents();
                // Merge
                const mergedEvents = { ...currentEvents };
                // (MỚI) Cải thiện logic merge: Nối mảng thay vì ghi đè
                for (const date in importedEvents) {
                    if (mergedEvents[date]) {
                        mergedEvents[date] = mergedEvents[date].concat(importedEvents[date]);
                    } else {
                        mergedEvents[date] = importedEvents[date];
                    }
                }
                saveEvents(mergedEvents);
                renderCalendar();
                showToast('Events imported successfully!');
                closeSidebar();
            } catch (err) {
                console.error(err);
                showToast('Error: Invalid JSON file.');
            }
            e.target.value = null; // Reset input
        };
        reader.readAsText(file);
    }
};

exportFileBtn.onclick = () => {
    const events = loadEvents();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `calendar_events_${formatDate(new Date())}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast('Events file exported!');
};

colorPicker.addEventListener('click', e => {
    if (e.target.classList.contains('color-swatch')) {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        e.target.classList.add('selected');
        eventColorInput.value = e.target.dataset.color;
    }
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// (MỚI) Khởi tạo trạng thái sidebar và theme khi tải trang

// 1. Theme
const savedTheme = localStorage.getItem('calendarTheme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
if (savedTheme) {
  setTheme(savedTheme);
} else if (prefersDark) {
  setTheme('dark');
} else {
  setTheme('light');
}

// 2. Sidebar
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
        sidebarOverlay.classList.remove('open');
    } else {
        if (sidebar.classList.contains('open')) {
            sidebarOverlay.classList.add('open');
            document.body.classList.add('sidebar-open');
        }
    }
});

if (window.innerWidth >= 1024) {
    openSidebar();
}

// 3. Lunar
showLunar = localStorage.getItem('calendarShowLunar') === 'true';
lunarToggle.checked = showLunar;
document.body.classList.toggle('lunar-visible', showLunar);

renderCalendar();