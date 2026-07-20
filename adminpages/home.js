// 将全局函数 switchTab 挂载到 window 对象上，以便在页面其他地方可以直接调用
window.switchTab = switchTab;

// 监听整个网页的 DOM 内容加载完成事件，确保 HTML 元素都存在后再执行内部逻辑
document.addEventListener("DOMContentLoaded", function() {
    // 检查用户是否已经登录

    // 从电脑本地存储 (LocalStorage) 恢复之前保存过的活动和审批状态
    restoreSavedEvents();
    restoreSavedApplications();
    
    // 页面加载时自动读取并渲染来自用户发的消息
    if (typeof window.restoreUserMessages === 'function') {
        window.restoreUserMessages();
    }

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
    console.log("正在切换到标签页:", tabId); // 在控制台打印当前切换的目标标签页 ID

    // --- 第一部分：处理侧边栏高亮 ---
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active')); // 移除所有菜单项的高亮类
    const activeMenu = document.getElementById('menu-' + tabId) || document.getElementById('menu-events'); // 获取当前对应的菜单项，若无则默认选 events
    if (activeMenu) activeMenu.classList.add('active'); // 给当前菜单项添加高亮类

    // --- 第二部分：处理主视图面板显示/隐藏 ---
    // 隐藏所有面板
    document.querySelectorAll('.tab-panel, .tab-content, [id$="-section"]').forEach(section => {
        section.style.display = 'none'; // 将所有面板样式设为隐藏
        section.classList.remove('active'); // 移除激活状态类
    });

    // 显示目标面板
    const targetPanel = document.getElementById('tab-' + tabId) || document.getElementById(tabId + '-section'); // 获取目标面板元素
    if (targetPanel) {
        targetPanel.style.display = 'block'; // 将目标面板显示出来
        targetPanel.classList.add('active'); // 添加激活状态类
    }

    // --- 第三部分：更新标题 ---
    const pageTitle = document.getElementById('page-title'); // 获取页面顶部标题元素
    if (pageTitle) {
        const titles = {
            'events': 'Events Management',
            'event-details': 'Event Details',
            'application': 'Applications',
            'add-event': 'Add New Event',
            'messages': 'User Messages'
        }; // 定义各个 tabId 对应的标题文本字典
        pageTitle.innerText = titles[tabId] || "Dashboard"; // 根据 tabId 设置标题，若未匹配则默认 Dashboard
    }

    // --- 第四部分：触发特殊页面加载逻辑 ---
    if (tabId === 'application' && typeof loadApplications === 'function') {
        loadApplications(); // 如果切换到 application 标签且函数存在，则加载申请列表
    }
    if (tabId === 'messages' && typeof restoreUserMessages === 'function') {
        restoreUserMessages(); // 如果切换到 messages 标签且函数存在，则恢复用户消息
    }
}

/**
 * 2. 点击活动卡片，进入详情页并展示数据 (包括展示 Layout 平面图)
 */
function viewEventDetails(cardElement) {
    // 🔑 获取卡片上绑定的全局唯一事件 ID
    const eventId = cardElement.getAttribute('data-id'); // 获取卡片的事件 ID
    const title = cardElement.getAttribute('data-title'); // 获取卡片的标题
    const venue = cardElement.getAttribute('data-venue'); // 获取卡片的地点
    const date = cardElement.getAttribute('data-date'); // 获取卡片的日期
    const time = cardElement.getAttribute('data-time'); // 获取卡片的时间
    const desc = cardElement.getAttribute('data-desc'); // 获取卡片的描述
    const price = cardElement.getAttribute('data-price'); // 获取卡片的价格
    const booths = cardElement.getAttribute('data-booths'); // 获取卡片的展位数量

    // 💡 将 ID 存入详情区域或临时挂载在 DOM 上，以便后续的编辑和删除能精准定位
    document.getElementById('tab-event-details').setAttribute('data-current-event-id', eventId); // 将当前事件 ID 挂载到详情 Tab DOM 上

    document.getElementById('detail-title').innerText = title; // 设置详情页标题
    document.getElementById('detail-venue').innerText = venue; // 设置详情页地点
    document.getElementById('detail-date').innerText = date; // 设置详情页日期
    document.getElementById('detail-time').innerText = time; // 设置详情页时间
    document.getElementById('detail-desc').innerText = desc; // 设置详情页描述
    document.getElementById('detail-price').innerText = price; // 设置详情页价格
    document.getElementById('detail-booths').innerText = booths; // 设置详情页展位数量 

    // 优先通过更具唯一性的 ID 从本地存储获取扩展数据，若没有则退回到以 title 读取
    let savedData = localStorage.getItem('saved_event_' + eventId) || localStorage.getItem('saved_event_' + title); // 从本地存储读取保存的事件数据
    const layoutContainer = document.getElementById('detail-layout-container'); // 获取平面图容器元素
    
    if (savedData) {
        const parsedData = JSON.parse(savedData); // 解析 JSON 字符串
        if (parsedData.layout) {
            layoutContainer.innerHTML = `<img src="${parsedData.layout}" alt="Booth Layout" style="width: 100%; border-radius: 8px; border: 1px solid #ddd;">`; // 如果有平面图则渲染图片
        } else {
            layoutContainer.innerHTML = `<p style="color: #9BB0C1; font-style: italic;">No layout map uploaded for this event.</p>`; // 若无则显示提示文本
        }
    } else {
        layoutContainer.innerHTML = `<p style="color: #9BB0C1; font-style: italic;">No layout map uploaded for this event.</p>`; // 若本地没有数据也显示提示文本
    }

    switchTab('event-details'); // 切换视图到事件详情 Tab
}

/**
 * 3. 提交并保存新活动 (Add Event 逻辑)
 * 🚀 已升级支持携带上传文件的 FormData 请求
 */
function handleAddEventSubmit(e) {
    e.preventDefault(); // 阻止表单默认的刷新提交行为 

    // 找到提交按钮并禁用它，防止连击或重复提交
    const submitBtn = e.target.querySelector('button[type="submit"]'); // 获取表单内的提交按钮
    if (submitBtn) {
        submitBtn.disabled = true; // 禁用按钮
        submitBtn.innerText = "Publishing..."; // 提示正在发布
    }

    const formData = new FormData(e.target); // 创建 FormData 对象以收集表单所有输入和文件

    fetch('../add_event.php', {
        method: 'POST',
        body: formData
    }) // 发送 POST 请求到后端添加活动接口
    .then(response => response.json()) // 将后端响应解析为 JSON
    .then(res => {
        if (res.success) {
            alert('🎉 活动发布成功！'); // 弹出成功提示
            e.target.reset(); // 重置表单输入 
            window.location.reload(); // 刷新页面 
        } else {
            alert('提交失败: ' + res.message); // 弹出错误提示
            // 失败了就把按钮恢复
            if (submitBtn) {
                submitBtn.disabled = false; // 恢复按钮可用
                submitBtn.innerText = "🚀 Publish Event"; // 恢复按钮文字
            }
        }
    })
    .catch(error => {
        console.error('Error details:', error); // 在控制台打印错误详情
        alert('请求发送失败'); // 弹出请求失败提示
        // 出错了就把按钮恢复
        if (submitBtn) {
            submitBtn.disabled = false; // 恢复按钮可用
            submitBtn.innerText = "🚀 Publish Event"; // 恢复按钮文字
        }
    });
}

/**
 * 4. 辅助函数：根据数据在网页上画出一张新卡片 (Inject into DOM)
 */
function createEventCardInDOM(data) {
    const eventsContainer = document.getElementById('events-grid'); // 获取事件网格容器
    if (!eventsContainer) return; // 如果容器不存在则直接返回

    const card = document.createElement('div'); // 创建一个新的 div 元素作为卡片
    card.className = 'booth-card clickable-card'; // 设置卡片的类名
    
    // 🔑 将生成的或既有的唯一 ID 绑定 to DOM 节点属性上
    card.setAttribute('data-id', data.id || ('ev_' + data.title.replace(/\s+/g, '_'))); // 设置 data-id 属性
    card.setAttribute('data-title', data.title); // 设置 data-title 属性
    card.setAttribute('data-venue', data.venue); // 设置 data-venue 属性
    card.setAttribute('data-date', data.date); // 设置 data-date 属性
    card.setAttribute('data-time', data.time); // 设置 data-time 属性
    card.setAttribute('data-desc', data.desc); // 设置 data-desc 属性
    card.setAttribute('data-price', data.price); // 设置 data-price 属性
    card.setAttribute('data-booths', data.booths); // 设置 data-booths 属性
    card.setAttribute('data-status', data.status || 'active'); // 设置 data-status 属性，默认为 active

    card.onclick = function() { viewEventDetails(this); }; // 绑定点击卡片查看详情的事件

    const statusHtml = data.status === 'deleted' ? '<span class="status-deleted-text">Deleted</span>' : 'Active'; // 判断状态文本显示

    card.innerHTML = `
        <h3>${data.title}</h3>
        <p class="booth-info">📅 Date: ${data.date}</p>
        <p class="booth-info">🎪 Total Booths: ${data.booths}</p>
        <p class="event-status-text">💡 Status: ${statusHtml}</p>
    `; // 填充卡片内部的 HTML 结构

    eventsContainer.appendChild(card); // 将卡片追加到网格容器中
}

/**
 * 5. 编辑活动资料 (Edit Modal Logic)
 */
function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('show-modal'); // 移除编辑弹窗的显示类以关闭弹窗
}

function editEvent() {
    // 🔑 从详情面板读取当前被编辑的 ID，并同步赋值到隐藏域中
    const currentId = document.getElementById('tab-event-details').getAttribute('data-current-event-id'); // 获取当前事件 ID
    document.getElementById('edit-event-id').value = currentId; // 将 ID 赋值给表单隐藏域

    document.getElementById('edit-input-title').value = document.getElementById('detail-title').innerText; // 回填标题输入框
    document.getElementById('edit-input-venue').value = document.getElementById('detail-venue').innerText; // 回填地点输入框
    document.getElementById('edit-input-date').value = document.getElementById('detail-date').innerText; // 回填日期输入框
    document.getElementById('edit-input-time').value = document.getElementById('detail-time').innerText; // 回填时间输入框
    document.getElementById('edit-input-desc').value = document.getElementById('detail-desc').innerText; // 回填描述输入框
    document.getElementById('edit-input-price').value = document.getElementById('detail-price').innerText; // 回填价格输入框
    document.getElementById('edit-input-booths').value = parseInt(document.getElementById('detail-booths').innerText) || 0; // 回填展位数量输入框

    document.getElementById('edit-modal').classList.add('show-modal'); // 给编辑弹窗添加显示类以打开弹窗
}

function saveEventChanges(event) {
    event.preventDefault(); // 阻止表单默认提交行为

    // 🔑 读取隐藏域主键 ID，通过 ID 实施精准操作而不再仅仅靠 Title 匹配
    const currentId = document.getElementById('edit-event-id').value; // 获取隐藏域中的事件 ID
    const currentTitle = document.getElementById('edit-input-title').value; // 获取输入的标题
    const newVenue = document.getElementById('edit-input-venue').value; // 获取输入的新地点
    const newDate = document.getElementById('edit-input-date').value; // 获取输入的新日期
    const newTime = document.getElementById('edit-input-time').value; // 获取输入的新时间
    const newDesc = document.getElementById('edit-input-desc').value; // 获取输入的新描述
    const newPrice = document.getElementById('edit-input-price').value; // 获取输入的新价格
    const newBooths = document.getElementById('edit-input-booths').value; // 获取输入的新展位数量

    document.getElementById('detail-venue').innerText = newVenue; // 更新详情页的地点显示
    document.getElementById('detail-date').innerText = newDate; // 更新详情页的日期显示
    document.getElementById('detail-time').innerText = newTime; // 更新详情页的时间显示
    document.getElementById('detail-desc').innerText = newDesc; // 更新详情页的描述显示
    document.getElementById('detail-price').innerText = newPrice; // 更新详情页的价格显示
    document.getElementById('detail-booths').innerText = newBooths; // 更新详情页的展位数量显示 

    // 根据主键 ID 或标题寻找到列表里对应的卡片进行实时更新
    const allCards = document.querySelectorAll('#tab-events .booth-card'); // 获取所有事件卡片元素
    allCards.forEach(card => {
        if (card.getAttribute('data-id') === currentId || card.querySelector('h3').innerText === currentTitle) {
            const infoParagraphs = card.querySelectorAll('.booth-info'); // 获取卡片内的信息段落
            if (infoParagraphs.length >= 2) {
                infoParagraphs[0].innerText = `📅 Date: ${newDate}`; // 更新卡片显示的日期
                infoParagraphs[1].innerText = `🎪 Total Booths: ${newBooths}`; // 更新卡片显示的展位数量 
            }
            card.setAttribute('data-venue', newVenue); // 更新卡片属性
            card.setAttribute('data-date', newDate); // 更新卡片属性
            card.setAttribute('data-time', newTime); // 更新卡片属性
            card.setAttribute('data-desc', newDesc); // 更新卡片属性
            card.setAttribute('data-price', newPrice); // 更新卡片属性
            card.setAttribute('data-booths', newBooths); // 更新卡片属性
        }
    });

    const savedDataStr = localStorage.getItem('saved_event_' + currentId) || localStorage.getItem('saved_event_' + currentTitle); // 获取本地存储的数据
    let eventData = savedDataStr ? JSON.parse(savedDataStr) : { id: currentId, title: currentTitle, status: 'active', isCustom: false }; // 解析数据或初始化默认对象

    eventData.venue = newVenue; eventData.date = newDate; eventData.time = newTime; // 更新对象属性
    eventData.desc = newDesc; eventData.price = newPrice; eventData.booths = newBooths; // 更新对象属性

    // 同步写回两份缓存保证向下兼容
    if (currentId) localStorage.setItem('saved_event_' + currentId, JSON.stringify(eventData)); // 按 ID 写入本地存储
    localStorage.setItem('saved_event_' + currentTitle, JSON.stringify(eventData)); // 按标题写入本地存储
    
    alert("Event changes saved successfully!"); // 弹出修改成功提示
    closeEditModal(); // 关闭编辑弹窗 
}

/**
 * 6. 将活动状态设为已删除 (Delete Event)
 */
function deleteEvent() {
    const currentId = document.getElementById('tab-event-details').getAttribute('data-current-event-id'); // 获取当前事件 ID
    const currentEventName = document.getElementById('detail-title').innerText; // 获取当前事件标题
    
    if (confirm(`Are you sure you want to change the status of "${currentEventName}" to Deleted?`)) { // 弹出确认删除提示框
        const allCards = document.querySelectorAll('#tab-events .booth-card'); // 获取所有事件卡片
        allCards.forEach(card => {
            if (card.getAttribute('data-id') === currentId || card.querySelector('h3').innerText === currentEventName) {
                const statusParagraph = card.querySelector('.event-status-text'); // 获取状态文本元素
                if (statusParagraph) {
                    statusParagraph.innerHTML = '💡 Status: <span class="status-deleted-text">Deleted</span>'; // 更新状态为已删除
                }
                card.setAttribute('data-status', 'deleted'); // 设置卡片状态属性为 deleted

                const savedData = localStorage.getItem('saved_event_' + currentId) || localStorage.getItem('saved_event_' + currentEventName); // 获取本地存储数据
                let eventData = savedData ? JSON.parse(savedData) : {
                    id: currentId, title: currentEventName, venue: card.getAttribute('data-venue'),
                    date: card.getAttribute('data-date'), time: card.getAttribute('data-time'),
                    desc: card.getAttribute('data-desc'), price: card.getAttribute('data-price'),
                    booths: card.getAttribute('data-booths'), isCustom: false
                }; // 解析或构建事件数据对象
                eventData.status = 'deleted'; // 将状态标记为 deleted
                
                if (currentId) localStorage.setItem('saved_event_' + currentId, JSON.stringify(eventData)); // 按 ID 更新本地存储
                localStorage.setItem('saved_event_' + currentEventName, JSON.stringify(eventData)); // 按标题更新本地存储
            }
        });
        alert(`"${currentEventName}" status has been set to Deleted.`); // 弹出删除完成提示
        switchTab('events'); // 切换回活动管理列表视图
    }
}

/**
 * 7. 右上角：筛选器与搜索功能 (Filter & Search)
 */
function handleFilterChange() {
    const filterValue = document.getElementById('global-filter').value; // 获取筛选器的选中值
    const cards = document.querySelectorAll('.booth-card'); // 获取所有卡片

    cards.forEach(card => {
        const cardStatus = card.getAttribute('data-status') || 'active'; // 获取卡片状态属性
        if (cardStatus === 'deleted') {
            card.style.display = (filterValue === 'all') ? 'block' : 'none'; // 如果已删除，只有在全选时才显示
            return;
        }
        if (filterValue === 'all' || cardStatus === filterValue) {
            card.style.display = 'block'; // 符合筛选条件则显示卡片
        } else {
            card.style.display = 'none'; // 不符合则隐藏卡片
        }
    });
}

function handleSearch() {
    const searchText = document.getElementById('global-search').value.toLowerCase(); // 获取搜索框输入的文本并转为小写
    const cards = document.querySelectorAll('.booth-card'); // 获取所有卡片

    cards.forEach(card => {
        const titleText = card.querySelector('h3').innerText.toLowerCase(); // 获取卡片标题并转为小写
        if (titleText.includes(searchText)) {
            card.style.display = 'block'; // 标题包含搜索词则显示卡片
        } else {
            card.style.display = 'none'; // 否则隐藏卡片
        }
    });
}

/**
 * 8. 审批操作 (Approve / Deny Application)
 */
function actionApprove(button) {
    const card = button.closest('.booth-card'); // 获取当前按钮所在的最近卡片元素
    const titleText = card.querySelector('h3').innerText; // 获取卡片标题
    card.setAttribute('data-status', 'confirmed'); // 将卡片状态属性设为 confirmed
    
    const badge = card.querySelector('.status-badge'); // 获取状态徽章元素
    if (badge) {
        badge.innerText = 'Confirmed'; // 修改徽章文本为 Confirmed
        badge.className = 'status-badge incoming'; // 修改徽章类名 
    }
    
    localStorage.setItem('app_status_' + titleText, 'confirmed'); // 将审批状态存入本地存储
    alert("Application approved successfully!"); // 弹出审批通过提示
}

/**
 * 9. 数据恢复逻辑 (Restore Data on Page Load)
 */
function restoreSavedEvents() {
    const allCards = document.querySelectorAll('#tab-events .booth-card'); // 获取所有事件卡片
    allCards.forEach(card => {
        const titleText = card.querySelector('h3').innerText; // 获取卡片标题
        // 先为既有的静态 HTML 卡片补充生成虚拟 ID 以供点击联动
        const virtualId = 'ev_' + titleText.replace(/\s+/g, '_'); // 生成虚拟 ID
        card.setAttribute('data-id', virtualId); // 绑定虚拟 ID 属性

        const savedData = localStorage.getItem('saved_event_' + virtualId) || localStorage.getItem('saved_event_' + titleText); // 从本地存储读取数据
        
        if (savedData) {
            const data = JSON.parse(savedData); // 解析保存的数据
            card.setAttribute('data-venue', data.venue); // 恢复地点属性
            card.setAttribute('data-date', data.date); // 恢复日期属性
            card.setAttribute('data-time', data.time); // 恢复时间属性
            card.setAttribute('data-desc', data.desc); // 恢复描述属性
            card.setAttribute('data-price', data.price); // 恢复价格属性
            card.setAttribute('data-booths', data.booths); // 恢复展位数量属性

            const infoParagraphs = card.querySelectorAll('.booth-info'); // 获取信息段落
            if (infoParagraphs.length >= 2) {
                infoParagraphs[0].innerText = `📅 Date: ${data.date}`; // 更新日期显示
                infoParagraphs[1].innerText = `🎪 Total Booths: ${data.booths}`; // 更新展位显示
            }

            if (data.status === 'deleted') {
                card.setAttribute('data-status', 'deleted'); // 设置状态为 deleted
                const statusParagraph = card.querySelector('.event-status-text'); // 获取状态文本元素
                if (statusParagraph) {
                    statusParagraph.innerHTML = '💡 Status: <span class="status-deleted-text">Deleted</span>'; // 更新为已删除状态显示
                }
            }
        }
    });

    // 读取通过前端新创建的自定义活动 ID 列表并渲染
    const customIds = JSON.parse(localStorage.getItem('custom_event_ids') || '[]'); // 获取自定义事件 ID 列表
    customIds.forEach(id => {
        const savedData = localStorage.getItem('saved_event_' + id); // 读取对应数据
        if (savedData) { createEventCardInDOM(JSON.parse(savedData)); } // 渲染卡片到 DOM
    });

    // 向上兼容：如果原本存在旧标题列表但也需要载入的情况
    const customTitles = JSON.parse(localStorage.getItem('custom_event_titles') || '[]'); // 获取旧版自定义标题列表
    customTitles.forEach(title => {
        const savedData = localStorage.getItem('saved_event_' + title); // 读取对应数据
        if (savedData) {
            const parsed = JSON.parse(savedData); // 解析数据
            // 避免重复追加渲染
            const exists = Array.from(document.querySelectorAll('#tab-events .booth-card')).some(c => c.querySelector('h3').innerText === title); // 检查是否存在重复卡片
            if (!exists) createEventCardInDOM(parsed); // 若不存在则追加渲染
        }
    });
}

function restoreSavedApplications() {
    const allAppCards = document.querySelectorAll('#tab-application .booth-card'); // 获取所有申请卡片
    allAppCards.forEach(card => {
        const titleText = card.querySelector('h3').innerText; // 获取卡片标题
        const savedStatus = localStorage.getItem('app_status_' + titleText); // 读取本地保存的审批状态
        
        if (savedStatus) {
            card.setAttribute('data-status', savedStatus); // 设置卡片状态属性
            const badge = card.querySelector('.status-badge'); // 获取状态徽章
            if (badge) {
                if (savedStatus === 'confirmed') {
                    badge.innerText = 'Confirmed'; // 显示 Confirmed
                    badge.className = 'status-badge incoming'; // 设置对应样式类 
                } else if (savedStatus === 'denied') {
                    badge.innerText = 'Denied'; // 显示 Denied
                    badge.className = 'status-badge denied'; // 设置对应样式类 
                }
            }
        }
    });
}

/**
 * 10. 用户注销登录 (Logout)
 */
function logout() {
    if (confirm("Are you sure you want to log out?")) { // 弹出确认注销提示框
        // 请求后端的注销逻辑（销毁 Session）
        fetch('../logout.php', { method: 'POST' }) // 发送注销请求到后端
        .then(() => {
            // 清理本地状态
            localStorage.removeItem("isLoggedIn"); // 移除登录状态标记
            // 跳转回登录页
            window.location.href = "../index.html"; // 页面跳转至首页/登录页
        })
        .catch(err => {
            // 如果后端请求失败，也要强制跳转
            window.location.href = "../index.html"; // 即使报错也强制跳转回登录页
        });
    }
}
/**
 * =========================================================================
 * 【新功能区域】11. 消息中心（读取、展示留言、以及 Admin 实时 Reply 回复逻辑）
 * =========================================================================
 */

// 1. 页面加载时/切换标签时读取所有用户消息 (强制挂载到 window 全局对象)
window.restoreUserMessages = function() {
    console.log("🚀 restoreUserMessages 开始运行了！"); // 在控制台打印日志

    fetch('../message.php?action=admin_get_all') // 发送 GET 请求获取所有用户留言
    .then(res => {
        console.log("📡 收到 PHP 响应状态:", res.status); // 打印响应状态码
        return res.json(); // 解析为 JSON
    })
    .then(data => {
        console.log("📦 解析出来的 JSON 数据:", data); // 打印解析后的数据
        
        const gridContainer = document.getElementById('admin-messages-grid'); // 获取消息网格容器
        if (!gridContainer) {
            console.error("❌ 找不到 HTML 容器: admin-messages-grid"); // 找不到则报错
            return;
        }

        if (data.success && data.messages.length > 0) {
            gridContainer.innerHTML = ''; // 清空旧的静态模拟卡片

            data.messages.forEach(msg => {
                // 判断是否已经回复
                const replyStatus = msg.reply 
                    ? `<span style="color: #2ec4b6;"><strong>Replied: </strong>${msg.reply}</span>` 
                    : `<span style="color: #e71d36; font-weight: bold;">⚠️ Unreplied</span>`; // 有回复则显示内容，无则显示未回复提示

                // 兼容 Users 表里的 e-mail 字段命名
                const userEmail = msg['e-mail'] || msg.email || 'No Email'; // 获取用户邮箱

                // 动态生成卡片并渲染
                gridContainer.innerHTML += `
                    <div class="booth-card" style="margin-bottom: 20px; border: 1px solid #eee; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                            <h3 style="margin: 0; color: #4F6D7A;">📝 Subject: ${msg.subject}</h3>
                            <span style="font-size: 0.85rem; color: #999;">${msg.created_at}</span>
                        </div>
                        <p class="booth-info" style="margin: 10px 0 5px 0;"><strong>👤 From User:</strong> ${msg.username} (${userEmail})</p>
                        
                        <!-- 用户留言具体内容 -->
                        <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 10px; border: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: #334155;">
                                ${msg.content}
                            </p>
                        </div>

                        <!-- 状态区 -->
                        <div style="margin-top: 10px; font-size: 0.9rem;">
                            <strong>Status:</strong> ${replyStatus}
                        </div>

                        <!-- 回复提交输入区域 (💡 已经绑定正确的数据库主键 msg.m_id) -->
                        <div style="margin-top: 12px; display: ${msg.reply ? 'none' : 'flex'}; gap: 8px;">
                            <input type="text" id="reply-input-${msg.m_id}" placeholder="Type your reply here..." 
                                   style="flex: 1; padding: 8px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem;">
                            <button onclick="window.submitAdminReply(${msg.m_id})" 
                                    style="padding: 8px 16px; background-color: #4F6D7A; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; font-weight: bold;">
                                Reply
                            </button>
                        </div>
                    </div>
                `; // 拼接消息卡片 HTML 并插入容器
            });
        } else {
            gridContainer.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">No messages from users yet.</p>'; // 无消息时显示暂无留言提示
        }
    })
    .catch(err => {
        console.error("❌ Fetch 过程中出错:", err); // 捕获并打印错误
    });
};

// 2. 管理员点击“Reply”按钮提交回复到数据库 (强制挂载到 window 全局对象)
window.submitAdminReply = function(messageId) {
    const replyInput = document.getElementById(`reply-input-${messageId}`); // 获取对应的回复输入框元素
    if (!replyInput) return; // 找不到则返回
    
    const replyContent = replyInput.value.trim(); // 获取输入的回复内容并去除首尾空格

    if (!replyContent) {
        alert('Please enter a reply text first!'); // 检查输入是否为空
        return;
    }

    fetch('../message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=admin_reply&message_id=${messageId}&reply=${encodeURIComponent(replyContent)}`
    }) // 发送 POST 请求提交管理员回复
    .then(res => res.json()) // 解析为 JSON
    .then(data => {
        alert(data.message); // 弹出后端返回的提示信息
        if (data.success) {
            replyInput.value = ''; // 清空输入框
            window.restoreUserMessages(); // 回复成功后重新刷新列表
        }
    })
    .catch(err => {
        alert('Failed to send reply: ' + err.message); // 弹出发送失败提示
    });
};

// 自执行的活动数据加载模块，不依赖你原有的函数名
(function() {
    function fetchAndRenderEvents() {
        const eventsGrid = document.getElementById('events-grid'); // 获取事件网格容器
        if (!eventsGrid) return; // 如果当前页面或者当前Tab没找到这个容器，就不执行

        // 发送请求到 get_events.php (根据你的目录结构，home.js在子目录，用 '../get_events.php')
        fetch('../get_events.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应异常，状态码: ' + response.status); // 检查网络响应
                }
                return response.json(); // 解析为 JSON
            })
            .then(res => {
                eventsGrid.innerHTML = ''; // 清空原有内容或加载提示

                if (!res.success) {
                    eventsGrid.innerHTML = `<div style="color:red; padding:20px;">数据加载失败: ${res.message}</div>`; // 显示加载失败错误信息
                    return;
                }

                const eventsList = res.data; // 获取活动列表数据
                if (!eventsList || eventsList.length === 0) {
                    eventsGrid.innerHTML = `<div style="color:#718096; padding:20px; text-align:center; width:100%;">暂无活动数据。</div>`; // 显示暂无数据提示
                    return;
                }

                // 循环遍历数据，生成卡片并塞入容器
                eventsList.forEach(event => {
                    const card = document.createElement('div'); // 创建卡片 div
                    card.className = 'event-card'; // 绑定你 home.css 里的卡片类名
                    
                    // 动态组装卡片 HTML 结构
                    card.innerHTML = `
                        <div style="background:#fff; border-radius:12px; padding:20px; box-shadow:0 4px 6px rgba(0,0,0,0.05); border:1px solid #edf2f7; display:flex; flex-direction:column; gap:10px; text-align:left;">
                            <span style="font-size:12px; color:#a0aec0;"># ${event.event_id}</span>
                            <h3 style="margin:0; color:#2d3748; font-size:18px;">${escapeHtml(event.event_name)}</h3>
                            <p style="margin:0; font-size:14px; color:#4a5568;"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.venue)}</p>
                            <p style="margin:0; font-size:13px; color:#718096;"><i class="far fa-calendar-alt"></i> ${event.date} | ${event.time}</p>
                            <p style="margin:0; font-size:14px; color:#718096; flex-grow:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                                ${escapeHtml(event.description)}
                            </p>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top:1px solid #edf2f7; padding-top:10px;">
                                <span style="color:#38a169; font-weight:bold; font-size:16px;">RM ${parseFloat(event.booth_price).toFixed(2)}</span>
                            </div>
                        </div>
                    `; // 填充卡片 HTML
                    eventsGrid.appendChild(card); // 将卡片加入网格容器
                });
            })
            .catch(error => {
                console.error('获取活动数据失败:', error); // 打印错误日志
                eventsGrid.innerHTML = `<div style="color:red; padding:20px;">数据加载失败: ${error.message}</div>`; // 显示失败提示
            });
    }

    // 防 XSS 转义工具函数
    function escapeHtml(text) {
        return text ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : ''; // 转义特殊字符防止 XSS 攻击
    }

    // 监听页面加载或配合选项卡切换触发
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchAndRenderEvents); // 若还在加载则监听 DOMContentLoaded
    } else {
        fetchAndRenderEvents(); // 若已加载完成则直接执行
    }

    // 暴露给全局，以防你的选项卡切换代码需要手动刷新它
    window.refreshAdminEvents = fetchAndRenderEvents; // 挂载刷新函数到全局 window 对象
})();

// 自执行的活动数据加载模块（带 Edit / Delete 功能）
(function() {
    function fetchAndRenderEvents() {
        const eventsGrid = document.getElementById('events-grid'); // 获取事件网格容器
        if (!eventsGrid) return; // 找不到则返回

        fetch('../get_events.php') // 发送请求获取活动数据
            .then(response => {
                if (!response.ok) throw new Error('网络响应异常，状态码: ' + response.status); // 检查响应状态
                return response.json(); // 解析为 JSON
            })
            .then(res => {
                eventsGrid.innerHTML = ''; // 清空容器

                if (!res.success) {
                    eventsGrid.innerHTML = `<div style="color:red; padding:20px;">数据加载失败: ${res.message}</div>`; // 显示加载失败错误信息
                    return;
                }

                const eventsList = res.data; // 获取活动列表
                if (!eventsList || eventsList.length === 0) {
                    eventsGrid.innerHTML = `<div style="color:#718096; padding:20px; text-align:center; width:100%;">暂无活动数据。</div>`; // 显示暂无数据提示
                    return;
                }

                eventsList.forEach(event => {
                    const card = document.createElement('div'); // 创建卡片元素
                    card.className = 'event-card'; // 设置卡片类名 
                    
                    // 动态组装卡片，并在价格旁边加入了 Edit 和 Delete 按钮
                    card.innerHTML = `
                        <div style="background:#fff; border-radius:12px; padding:20px; box-shadow:0 4px 6px rgba(0,0,0,0.05); border:1px solid #edf2f7; display:flex; flex-direction:column; gap:10px; text-align:left; position:relative;">
                            <span style="font-size:12px; color:#a0aec0;"># ${event.event_id}</span>
                            <h3 style="margin:0; color:#2d3748; font-size:18px;">${escapeHtml(event.event_name)}</h3>
                            <p style="margin:0; font-size:14px; color:#4a5568;"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.venue)}</p>
                            <p style="margin:0; font-size:13px; color:#718096;"><i class="far fa-calendar-alt"></i> ${event.date} | ${event.time}</p>
                            <p style="margin:0; font-size:14px; color:#718096; flex-grow:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                                ${escapeHtml(event.description)}
                            </p>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top:1px solid #edf2f7; padding-top:10px;">
                                <span style="color:#38a169; font-weight:bold; font-size:16px;">RM ${parseFloat(event.booth_price).toFixed(2)}</span>
                                
                                <!-- 操作按钮容器 -->
                                <div style="display:flex; gap:8px;">
                                    <button class="btn-edit" data-id="${event.event_id}" style="padding:6px 12px; background:#4a5568; color:#fff; border:none; border-radius:6px; font-size:12px; cursor:pointer; font-weight:500;">编辑</button>
                                    <button class="btn-delete" data-id="${event.event_id}" style="padding:6px 12px; background:#e53e3e; color:#fff; border:none; border-radius:6px; font-size:12px; cursor:pointer; font-weight:500;">删除</button>
                                </div>
                            </div>
                        </div>
                    `; // 填充带编辑删除按钮的卡片 HTML
                    
                    // 绑定编辑点击事件
                    card.querySelector('.btn-edit').addEventListener('click', function(e) {
                        e.stopPropagation(); // 阻止事件冒泡
                        const eventId = this.getAttribute('data-id'); // 获取当前按钮的事件 ID
                        editEvent(eventId); // 调用编辑函数
                    });

                    // 绑定删除点击事件
                    card.querySelector('.btn-delete').addEventListener('click', function(e) {
                        e.stopPropagation(); // 阻止事件冒泡 
                        const eventId = this.getAttribute('data-id'); // 获取当前按钮的事件 ID
                        deleteEvent(eventId); // 调用删除函数
                    });

                    eventsGrid.appendChild(card); // 将卡片加入网格容器
                });
            })
            .catch(error => {
                console.error('获取活动数据失败:', error); // 打印错误日志
                eventsGrid.innerHTML = `<div style="color:red; padding:20px;">数据加载失败: ${error.message}</div>`; // 显示失败提示
            });
    }
})();

// ==========================================
// 逻辑处理函数 (Part 2 代码整合及全局挂载)
// ==========================================

// 将所有核心函数显式挂载到 window 对象上，确保在 HTML 行内事件（如 onclick）中可被安全调用
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.loadApplications = loadApplications;
window.renderTable = renderTable;
window.updateStatus = updateStatus;
window.handleAction = handleAction;

// 1. 编辑事件的逻辑
function editEvent(id) {
    // 做法 A：直接跳转到 edit_event.php 并带上 ID
    window.location.href = `../edit_event.php?id=${id}`;
    
    // 如果你打算用弹窗（Modal）处理，可以在这里写触发弹窗显示并回填数据的逻辑
}

// 2. 删除事件的逻辑
function deleteEvent(id) {
    if (confirm(`确定要删除 ID 为 #${id} 的活动吗？此操作不可恢复！`)) {
        // 发送请求到后端的删除 API
        fetch(`../delete_event.php?id=${id}`, {
            method: 'GET' // 或者 'POST'，取决于你删除接口怎么写
        })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                alert('删除成功！');
                if (typeof fetchAndRenderEvents === 'function') {
                    fetchAndRenderEvents(); // 重新刷新列表
                }
            } else {
                alert('删除失败: ' + res.message);
            }
        })
        .catch(error => {
            console.error('删除请求出错:', error);
            alert('删除请求失败，请检查网络或后端接口。');
        });
    }
}

// 防 XSS 转义函数
function escapeHtml(text) {
    return text ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';
}

// 页面加载时的自动初始化监听
document.addEventListener("DOMContentLoaded", function() {
    if (typeof fetchAndRenderEvents === 'function') {
        fetchAndRenderEvents();
    }
});

// 异步从 admin_application.php 获取数据
function loadApplications() {
    // 💡 精准定位到 HTML 中的 tbody ID
    const tbody = document.getElementById('applications-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">Loading...</td></tr>';

    fetch('../admin_application.php')
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {
                renderTable(res.data);
            } else {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red; padding:20px;">Error: ${res.message}</td></tr>`;
            }
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red; padding:20px;">Failed to connect backend.</td></tr>';
        });
}

// 把数据显示成带审批按钮的完整表格
function renderTable(data) {
    const tbody = document.getElementById('applications-table-body');
    if (!tbody) return; 

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">No applications found.</td></tr>';
        return;
    }

    let html = '';
    data.forEach(app => {
        let actionButtons = '';
        if (app.status === 'Pending') {
            actionButtons = `
                <button onclick="updateStatus(${app.application_id}, 'Approved')" style="background-color: #28a745; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; margin-right: 5px;">Approve</button>
                <button onclick="updateStatus(${app.application_id}, 'Denied')" style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;">Deny</button>
            `;
        } else {
            actionButtons = `<span style="color: #6c757d;">Processed</span>`;
        }

        let statusColor = '#ffc107'; 
        if (app.status === 'Approved') statusColor = '#28a745'; 
        if (app.status === 'Denied') statusColor = '#dc3545'; 

        html += `
            <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 12px;">${app.application_id}</td>
                <td style="padding: 12px;">${app.user_id}</td>
                <td style="padding: 12px;">${app.event_id}</td>
                <td style="padding: 12px;">${app.booth_id}</td>
                <td style="padding: 12px;">${app.product_category}</td>
                <td style="padding: 12px;">${app.product_name}</td>
                <td style="padding: 12px; color: ${statusColor}; font-weight: bold;">${app.status}</td>
                <td style="padding: 12px;">${actionButtons}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// 提交审批结果给后端
function updateStatus(id, newStatus) {
    if (!confirm(`Are you sure you want to ${newStatus} this application?`)) return;

    fetch('../admin_application.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: id, status: newStatus })
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            alert(res.message);
            loadApplications(); // 刷新列表
        } else {
            alert('Error: ' + res.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert('Request failed.');
    });
}

// 处理 Approve / Deny 按钮点击的备用方法
function handleAction(id, newStatus) {
    if (!confirm(`Are you sure you want to ${newStatus} this application?`)) return;

    fetch('admin_application.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            application_id: id,
            status: newStatus
        })
    })
    .then(response => response.json())
    .then(res => {
        if (res.status === 'success') {
            alert(res.message);
            loadApplications(); // 重新加载数据刷新列表
        } else {
            alert('Error: ' + res.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert('An error occurred.');
    });
}

// 暴力兜底：只要页面一加载，直接拉取后端应用申请数据
console.log("🚀 调试：正在强行绕过点击事件，直接拉取后端申请数据...");
loadApplications();