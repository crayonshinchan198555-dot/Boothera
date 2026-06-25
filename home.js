/**
 * 0. 页面初始化设置 (Page Initialization)
 * 当网页加载完毕后，自动执行此区域的代码
 */
document.addEventListener("DOMContentLoaded", function() {
    // 检查用户是否已经登录 (检查 localStorage 中有没有 isLoggedIn 这个标记)
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    // 如果没有登录，就踢回 index.html (登录页)
    if (isLoggedIn !== "true") {
        alert("Please sign in first!");
        window.location.href = "index.html"; 
        return;
    }

    // 调用函数：从电脑本地存储 (LocalStorage) 恢复之前保存过的活动和审批状态
    restoreSavedEvents();
    restoreSavedApplications();

    // 监听 "Add Event" 表单的提交动作 (Submit)
    const addEventForm = document.getElementById('add-event-form');
    if (addEventForm) {
        addEventForm.addEventListener('submit', handleAddEventSubmit);
    }

    // 监听 "Upload Booth Layout" 图片上传动作，用来显示即时预览图 (Preview)
    const layoutInput = document.getElementById('add-input-layout');
    if (layoutInput) {
        layoutInput.addEventListener('change', function(e) {
            const file = e.target.files[0]; // 获取上传的文件
            if (file) {
                const reader = new FileReader(); // 使用 FileReader 将图片转为 Base64 字符串
                reader.onload = function(event) {
                    const previewImg = document.getElementById('layout-preview');
                    const previewContainer = document.getElementById('layout-preview-container');
                    previewImg.src = event.target.result; // 将 Base64 字符串赋给 <img> 标签
                    previewContainer.style.display = 'block'; // 显示预览框
                };
                reader.readAsDataURL(file); // 开始读取文件
            }
        });
    }
});

/**
 * 1. 切换左侧菜单 Tab 功能
 */
function switchTab(tabId) {
    // 移除侧边栏所有按钮的高亮 (active) 状态
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    // 隐藏主视图区的所有面板
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(panel => panel.classList.remove('active'));

    // 给被点击的侧边栏按钮加上高亮状态
    const currentMenu = document.getElementById('menu-' + tabId);
    if (currentMenu) {
        currentMenu.classList.add('active');
    } else if (tabId === 'events') {
        document.getElementById('menu-events').classList.add('active');
    }

    // 将对应的目标面板显示出来
    const targetPanel = document.getElementById('tab-' + tabId);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    // 根据面板不同，自动更改网页顶部的大标题
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        if (tabId === 'events') pageTitle.innerText = "Events Management";
        if (tabId === 'event-details') pageTitle.innerText = "Event Details";
        if (tabId === 'application') pageTitle.innerText = "Applications";
        if (tabId === 'add-event') pageTitle.innerText = "Add New Event";
    }
}

/**
 * 2. 点击活动卡片，进入详情页并展示数据 (包括展示 Layout 平面图)
 */
function viewEventDetails(cardElement) {
    // 从被点击的卡片上，抓取所有 data- 隐藏属性里的数据
    const title = cardElement.getAttribute('data-title');
    const venue = cardElement.getAttribute('data-venue');
    const date = cardElement.getAttribute('data-date');
    const time = cardElement.getAttribute('data-time');
    const desc = cardElement.getAttribute('data-desc');
    const price = cardElement.getAttribute('data-price');
    const booths = cardElement.getAttribute('data-booths');

    // 把抓取到的数据，填入详情页的各个文本标签中
    document.getElementById('detail-title').innerText = title;
    document.getElementById('detail-venue').innerText = venue;
    document.getElementById('detail-date').innerText = date;
    document.getElementById('detail-time').innerText = time;
    document.getElementById('detail-desc').innerText = desc;
    document.getElementById('detail-price').innerText = price;
    document.getElementById('detail-booths').innerText = booths; 

    // 从本地存储中查找，该活动是否有上传过 Booth Layout 平面图
    const savedData = localStorage.getItem('saved_event_' + title);
    const layoutContainer = document.getElementById('detail-layout-container');
    
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.layout) {
            // 如果有图片，就渲染出一张 <img> 标签显示平面图
            layoutContainer.innerHTML = `<img src="${parsedData.layout}" alt="Booth Layout" style="width: 100%; border-radius: 8px; border: 1px solid #ddd;">`;
        } else {
            // 如果没有图片，就显示这句提示语
            layoutContainer.innerHTML = `<p style="color: #9BB0C1; font-style: italic;">No layout map uploaded for this event.</p>`;
        }
    } else {
        layoutContainer.innerHTML = `<p style="color: #9BB0C1; font-style: italic;">No layout map uploaded for this event.</p>`;
    }

    // 切换到详情页面板
    switchTab('event-details');
}

/**
 * 3. 提交并保存新活动 (Add Event 逻辑)
 */
function handleAddEventSubmit(event) {
    event.preventDefault(); // 阻止网页刷新

    // 获取输入框里的文字内容，并用 trim() 去除多余空格
    const title = document.getElementById('add-input-title').value.trim();
    const venue = document.getElementById('add-input-venue').value.trim();
    const date = document.getElementById('add-input-date').value;
    const time = document.getElementById('add-input-time').value;
    const price = document.getElementById('add-input-price').value.trim();
    const booths = document.getElementById('add-input-booths').value.trim();
    const desc = document.getElementById('add-input-desc').value.trim();
    
    // 获取上传的图片文件
    const layoutFile = document.getElementById('add-input-layout').files[0];

    // 防止同名活动冲突
    if (localStorage.getItem('saved_event_' + title)) {
        alert("An event with this title already exists!");
        return;
    }

    // 这是一个内部处理函数，用于最后将文字和图片一起保存到 localStorage
    const finalizeEventSave = (base64String) => {
        const newEventData = {
            title: title,
            venue: venue,
            date: date,
            time: time,
            price: price,
            booths: booths,
            desc: desc,
            status: 'active',
            isCustom: true, // 标记这是后台新增的活动
            layout: base64String // 存放 Base64 格式的图片
        };

        // 保存进浏览器的 localStorage (本地缓存)
        localStorage.setItem('saved_event_' + title, JSON.stringify(newEventData));

        // 记录一下这个活动的名字，方便下次刷新时能把它重新画出来
        let customTitles = JSON.parse(localStorage.getItem('custom_event_titles') || '[]');
        if (!customTitles.includes(title)) {
            customTitles.push(title);
            localStorage.setItem('custom_event_titles', JSON.stringify(customTitles));
        }

        // 调用函数，在网页上画出一张新的活动卡片
        createEventCardInDOM(newEventData);
        alert(`🎉 Event "${title}" created successfully!`);

        // 清空表单和预览区，并切回 Events 列表页
        document.getElementById('add-event-form').reset();
        document.getElementById('layout-preview-container').style.display = 'none';
        switchTab('events');
    };

    // 如果上传了图片，先转换成 Base64 再保存；如果没有图片，直接保存文字
    if (layoutFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            finalizeEventSave(e.target.result); 
        };
        reader.readAsDataURL(layoutFile);
    } else {
        finalizeEventSave(null); 
    }
}

/**
 * 4. 辅助函数：根据数据在网页上画出一张新卡片 (Inject into DOM)
 */
function createEventCardInDOM(data) {
    const eventsContainer = document.getElementById('events-grid');
    if (!eventsContainer) return;

    // 创建一个新的 div 作为卡片
    const card = document.createElement('div');
    card.className = 'booth-card clickable-card';
    
    // 把数据绑定在卡片上，方便详情页读取
    card.setAttribute('data-title', data.title);
    card.setAttribute('data-venue', data.venue);
    card.setAttribute('data-date', data.date);
    card.setAttribute('data-time', data.time);
    card.setAttribute('data-desc', data.desc);
    card.setAttribute('data-price', data.price);
    card.setAttribute('data-booths', data.booths);
    card.setAttribute('data-status', data.status || 'active');

    // 绑定点击事件
    card.onclick = function() {
        viewEventDetails(this);
    };

    // 判断如果活动是被删除的，就显示红色的 Deleted，否则显示 Active
    const statusHtml = data.status === 'deleted' 
        ? '<span class="status-deleted-text">Deleted</span>' 
        : 'Active';

    // 写入卡片表面的 HTML 内容
    card.innerHTML = `
        <h3>${data.title}</h3>
        <p class="booth-info">📅 Date: ${data.date}</p>
        <p class="booth-info">🎪 Total Booths: ${data.booths}</p>
        <p class="event-status-text">💡 Status: ${statusHtml}</p>
    `;

    // 将卡片塞入网格列表中
    eventsContainer.appendChild(card);
}

/**
 * 5. 编辑活动资料 (Edit Modal Logic)
 */
function closeEditModal() {
    // 隐藏编辑弹窗
    document.getElementById('edit-modal').classList.remove('show-modal');
}

function editEvent() {
    // 读取详情页上的当前文字，并填入编辑弹窗的输入框里
    document.getElementById('edit-input-title').value = document.getElementById('detail-title').innerText;
    document.getElementById('edit-input-venue').value = document.getElementById('detail-venue').innerText;
    document.getElementById('edit-input-date').value = document.getElementById('detail-date').innerText;
    document.getElementById('edit-input-time').value = document.getElementById('detail-time').innerText;
    document.getElementById('edit-input-desc').value = document.getElementById('detail-desc').innerText;
    document.getElementById('edit-input-price').value = document.getElementById('detail-price').innerText;
    document.getElementById('edit-input-booths').value = parseInt(document.getElementById('detail-booths').innerText) || 0;

    // 显示编辑弹窗
    document.getElementById('edit-modal').classList.add('show-modal');
}

function saveEventChanges(event) {
    event.preventDefault();

    // 抓取修改后的新数据
    const currentTitle = document.getElementById('edit-input-title').value;
    const newVenue = document.getElementById('edit-input-venue').value;
    const newDate = document.getElementById('edit-input-date').value;
    const newTime = document.getElementById('edit-input-time').value;
    const newDesc = document.getElementById('edit-input-desc').value;
    const newPrice = document.getElementById('edit-input-price').value;
    const newBooths = document.getElementById('edit-input-booths').value;

    // 1. 同步覆盖到详情页上
    document.getElementById('detail-venue').innerText = newVenue;
    document.getElementById('detail-date').innerText = newDate;
    document.getElementById('detail-time').innerText = newTime;
    document.getElementById('detail-desc').innerText = newDesc;
    document.getElementById('detail-price').innerText = newPrice;
    document.getElementById('detail-booths').innerText = newBooths; 

    // 2. 同步覆盖到列表页的对应卡片上
    const allCards = document.querySelectorAll('#tab-events .booth-card');
    allCards.forEach(card => {
        if (card.querySelector('h3').innerText === currentTitle) {
            // 更新卡片表面的文字
            const infoParagraphs = card.querySelectorAll('.booth-info');
            if (infoParagraphs.length >= 2) {
                infoParagraphs[0].innerText = `📅 Date: ${newDate}`;
                infoParagraphs[1].innerText = `🎪 Total Booths: ${newBooths}`; 
            }
            // 更新卡片背后的隐藏 data 属性
            card.setAttribute('data-venue', newVenue);
            card.setAttribute('data-date', newDate);
            card.setAttribute('data-time', newTime);
            card.setAttribute('data-desc', newDesc);
            card.setAttribute('data-price', newPrice);
            card.setAttribute('data-booths', newBooths);
        }
    });

    // 3. 将修改同步到 localStorage 永久保存
    const savedDataStr = localStorage.getItem('saved_event_' + currentTitle);
    let eventData = savedDataStr ? JSON.parse(savedDataStr) : {
        title: currentTitle, status: 'active', isCustom: false
    };

    eventData.venue = newVenue;
    eventData.date = newDate;
    eventData.time = newTime;
    eventData.desc = newDesc;
    eventData.price = newPrice;
    eventData.booths = newBooths;

    localStorage.setItem('saved_event_' + currentTitle, JSON.stringify(eventData));

    alert("Event changes saved successfully!");
    closeEditModal(); 
}

/**
 * 6. 将活动状态设为已删除 (Delete Event)
 */
function deleteEvent() {
    const currentEventName = document.getElementById('detail-title').innerText;
    
    if (confirm(`Are you sure you want to change the status of "${currentEventName}" to Deleted?`)) {
        
        const allCards = document.querySelectorAll('#tab-events .booth-card');
        allCards.forEach(card => {
            if (card.querySelector('h3').innerText === currentEventName) {
                // 修改卡片上的文字状态为 Deleted
                const statusParagraph = card.querySelector('.event-status-text');
                if (statusParagraph) {
                    statusParagraph.innerHTML = '💡 Status: <span class="status-deleted-text">Deleted</span>';
                }
                card.setAttribute('data-status', 'deleted'); // 设置属性方便筛选器过滤

                // 存入 localStorage
                const savedData = localStorage.getItem('saved_event_' + currentEventName);
                let eventData = savedData ? JSON.parse(savedData) : {
                    title: currentEventName,
                    venue: card.getAttribute('data-venue'),
                    date: card.getAttribute('data-date'),
                    time: card.getAttribute('data-time'),
                    desc: card.getAttribute('data-desc'),
                    price: card.getAttribute('data-price'),
                    booths: card.getAttribute('data-booths'),
                    isCustom: false
                };
                eventData.status = 'deleted';
                localStorage.setItem('saved_event_' + currentEventName, JSON.stringify(eventData));
            }
        });

        alert(`"${currentEventName}" status has been set to Deleted.`);
        switchTab('events'); // 删除后自动切回主列表
    }
}

/**
 * 7. 右上角：筛选器与搜索功能 (Filter & Search)
 */
function handleFilterChange() {
    const filterValue = document.getElementById('global-filter').value;
    const cards = document.querySelectorAll('.booth-card');

    cards.forEach(card => {
        const cardStatus = card.getAttribute('data-status') || 'active';
        
        // 如果是已删除的活动，只有选 All 时才显示
        if (cardStatus === 'deleted') {
            card.style.display = (filterValue === 'all') ? 'block' : 'none'; 
            return;
        }

        // 匹配状态决定是否显示卡片
        if (filterValue === 'all' || cardStatus === filterValue) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function handleSearch() {
    // 把搜索词统一转成小写，方便匹配
    const searchText = document.getElementById('global-search').value.toLowerCase();
    const cards = document.querySelectorAll('.booth-card');

    cards.forEach(card => {
        const titleText = card.querySelector('h3').innerText.toLowerCase();
        // 如果活动标题包含了搜索词，就显示
        if (titleText.includes(searchText)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * 8. 审批操作 (Approve / Deny Application)
 */
function actionApprove(button) {
    const card = button.closest('.booth-card');
    const titleText = card.querySelector('h3').innerText;
    card.setAttribute('data-status', 'confirmed');
    
    // 把黄色的 Pending 徽章换成绿色的 Confirmed
    const badge = card.querySelector('.status-badge');
    if (badge) {
        badge.innerText = 'Confirmed';
        badge.className = 'status-badge incoming'; 
    }
    
    localStorage.setItem('app_status_' + titleText, 'confirmed');
    alert("Application approved successfully!");
}

function actionDeny(button) {
    const card = button.closest('.booth-card');
    const titleText = card.querySelector('h3').innerText;
    card.setAttribute('data-status', 'denied');
    
    // 把黄色的 Pending 徽章换成红色的 Denied
    const badge = card.querySelector('.status-badge');
    if (badge) {
        badge.innerText = 'Denied';
        badge.className = 'status-badge denied'; 
    }
    
    localStorage.setItem('app_status_' + titleText, 'denied');
    alert("Application denied.");
}

/**
 * 9. 数据恢复逻辑 (Restore Data on Page Load)
 * 作用：刷新网页时，把以前保存的修改、图片、删除状态从 localStorage 捞回来
 */
function restoreSavedEvents() {
    // 恢复默认在 HTML 里写死的活动状态
    const allCards = document.querySelectorAll('#tab-events .booth-card');
    allCards.forEach(card => {
        const titleText = card.querySelector('h3').innerText;
        const savedData = localStorage.getItem('saved_event_' + titleText);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            card.setAttribute('data-venue', data.venue);
            card.setAttribute('data-date', data.date);
            card.setAttribute('data-time', data.time);
            card.setAttribute('data-desc', data.desc);
            card.setAttribute('data-price', data.price);
            card.setAttribute('data-booths', data.booths);

            const infoParagraphs = card.querySelectorAll('.booth-info');
            if (infoParagraphs.length >= 2) {
                infoParagraphs[0].innerText = `📅 Date: ${data.date}`;
                infoParagraphs[1].innerText = `🎪 Total Booths: ${data.booths}`;
            }

            if (data.status === 'deleted') {
                card.setAttribute('data-status', 'deleted');
                const statusParagraph = card.querySelector('.event-status-text');
                if (statusParagraph) {
                    statusParagraph.innerHTML = '💡 Status: <span class="status-deleted-text">Deleted</span>';
                }
            }
        }
    });

    // 恢复用户在 Add Event 页面自己创建的全新活动
    const customTitles = JSON.parse(localStorage.getItem('custom_event_titles') || '[]');
    customTitles.forEach(title => {
        const savedData = localStorage.getItem('saved_event_' + title);
        if (savedData) {
            createEventCardInDOM(JSON.parse(savedData));
        }
    });
}

function restoreSavedApplications() {
    const allAppCards = document.querySelectorAll('#tab-application .booth-card');
    allAppCards.forEach(card => {
        const titleText = card.querySelector('h3').innerText;
        const savedStatus = localStorage.getItem('app_status_' + titleText);
        
        if (savedStatus) {
            card.setAttribute('data-status', savedStatus);
            const badge = card.querySelector('.status-badge');
            if (badge) {
                if (savedStatus === 'confirmed') {
                    badge.innerText = 'Confirmed';
                    badge.className = 'status-badge incoming'; 
                } else if (savedStatus === 'denied') {
                    badge.innerText = 'Denied';
                    badge.className = 'status-badge denied'; 
                }
            }
        }
    });
}

/**
 * 10. 安全退出 (Logout)
 */
function logout() {
    if (confirm("Are you sure you want to log out?")) {
        alert("Logging out from Booking Booth System...");
        // 清除登录标记，但保留活动数据
        localStorage.removeItem("isLoggedIn");
        // 跳回登录页面
        window.location.href = "index.html"; 
    }
}