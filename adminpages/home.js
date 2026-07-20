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
});

/**
 * 1. 切换左侧菜单 Tab 功能
 */
function switchTab(tabId) {
    console.log("正在切换到标签页:", tabId);

    // --- 第一部分：处理侧边栏高亮 ---
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    const activeMenu = document.getElementById('menu-' + tabId) || document.getElementById('menu-events');
    if (activeMenu) activeMenu.classList.add('active');

    // --- 第二部分：处理主视图面板显示/隐藏 ---
    // 隐藏所有面板
    document.querySelectorAll('.tab-panel, .tab-content, [id$="-section"]').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    // 显示目标面板
    const targetPanel = document.getElementById('tab-' + tabId) || document.getElementById(tabId + '-section');
    if (targetPanel) {
        targetPanel.style.display = 'block';
        targetPanel.classList.add('active');
    }

    // --- 第三部分：更新标题 ---
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        const titles = {
            'events': 'Events Management',
            'event-details': 'Event Details',
            'application': 'Applications',
            'add-event': 'Add New Event',
            'messages': 'User Messages'
        };
        pageTitle.innerText = titles[tabId] || "Dashboard";
    }

    // --- 第四部分：触发特殊页面加载逻辑 ---
    if (tabId === 'application' && typeof loadApplications === 'function') {
        loadApplications();
    }
    if (tabId === 'messages' && typeof restoreUserMessages === 'function') {
        restoreUserMessages();
    }
}

/**
 * 2. 点击活动卡片，进入详情页并展示数据 (包括展示 Layout 平面图)
 */
function viewEventDetails(cardElement) {
    // 🔑 获取卡片上绑定的全局唯一事件 ID
    const eventId = cardElement.getAttribute('data-id');
    const title = cardElement.getAttribute('data-title');
    const venue = cardElement.getAttribute('data-venue');
    const date = cardElement.getAttribute('data-date');
    const time = cardElement.getAttribute('data-time');
    const desc = cardElement.getAttribute('data-desc');
    const price = cardElement.getAttribute('data-price');
    const booths = cardElement.getAttribute('data-booths');

    // 💡 将 ID 存入详情区域或临时挂载在 DOM 上，以便后续的编辑和删除能精准定位
    document.getElementById('tab-event-details').setAttribute('data-current-event-id', eventId);

    document.getElementById('detail-title').innerText = title;
    document.getElementById('detail-venue').innerText = venue;
    document.getElementById('detail-date').innerText = date;
    document.getElementById('detail-time').innerText = time;
    document.getElementById('detail-desc').innerText = desc;
    document.getElementById('detail-price').innerText = price;
    document.getElementById('detail-booths').innerText = booths; 

    // 优先通过更具唯一性的 ID 从本地存储获取扩展数据，若没有则退回到以 title 读取
    let savedData = localStorage.getItem('saved_event_' + eventId) || localStorage.getItem('saved_event_' + title);
    const layoutContainer = document.getElementById('detail-layout-container');
    
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.layout) {
            layoutContainer.innerHTML = `<img src="${parsedData.layout}" alt="Booth Layout" style="width: 100%; border-radius: 8px; border: 1px solid #ddd;">`;
        } else {
            layoutContainer.innerHTML = `<p style="color: #9BB0C1; font-style: italic;">No layout map uploaded for this event.</p>`;
        }
    } else {
        layoutContainer.innerHTML = `<p style="color: #9BB0C1; font-style: italic;">No layout map uploaded for this event.</p>`;
    }

    switchTab('event-details');
}

/**
 * 3. 提交并保存新活动 (Add Event 逻辑)
 * 🚀 已升级支持携带上传文件的 FormData 请求
 */
function handleAddEventSubmit(e) {
    e.preventDefault(); 

    // 找到提交按钮并禁用它，防止连击或重复提交
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Publishing..."; // 提示正在发布
    }

    const formData = new FormData(e.target); 

    fetch('../add_event.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(res => {
        if (res.success) {
            alert('🎉 活动发布成功！');
            e.target.reset(); 
            window.location.reload(); 
        } else {
            alert('提交失败: ' + res.message);
            // 失败了就把按钮恢复
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "🚀 Publish Event";
            }
        }
    })
    .catch(error => {
        console.error('Error details:', error);
        alert('请求发送失败');
        // 出错了就把按钮恢复
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "🚀 Publish Event";
        }
    });
}

/**
 * 4. 辅助函数：根据数据在网页上画出一张新卡片 (Inject into DOM)
 */
function createEventCardInDOM(data) {
    const eventsContainer = document.getElementById('events-grid');
    if (!eventsContainer) return;

    const card = document.createElement('div');
    card.className = 'booth-card clickable-card';
    
    // 🔑 将生成的或既有的唯一 ID 绑定 to DOM 节点属性上
    card.setAttribute('data-id', data.id || ('ev_' + data.title.replace(/\s+/g, '_')));
    card.setAttribute('data-title', data.title);
    card.setAttribute('data-venue', data.venue);
    card.setAttribute('data-date', data.date);
    card.setAttribute('data-time', data.time);
    card.setAttribute('data-desc', data.desc);
    card.setAttribute('data-price', data.price);
    card.setAttribute('data-booths', data.booths);
    card.setAttribute('data-status', data.status || 'active');

    card.onclick = function() { viewEventDetails(this); };

    const statusHtml = data.status === 'deleted' ? '<span class="status-deleted-text">Deleted</span>' : 'Active';

    card.innerHTML = `
        <h3>${data.title}</h3>
        <p class="booth-info">📅 Date: ${data.date}</p>
        <p class="booth-info">🎪 Total Booths: ${data.booths}</p>
        <p class="event-status-text">💡 Status: ${statusHtml}</p>
    `;

    eventsContainer.appendChild(card);
}

/**
 * 5. 编辑活动资料 (Edit Modal Logic)
 */
function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('show-modal');
}

function editEvent() {
    // 🔑 从详情面板读取当前被编辑的 ID，并同步赋值到隐藏域中
    const currentId = document.getElementById('tab-event-details').getAttribute('data-current-event-id');
    document.getElementById('edit-event-id').value = currentId;

    document.getElementById('edit-input-title').value = document.getElementById('detail-title').innerText;
    document.getElementById('edit-input-venue').value = document.getElementById('detail-venue').innerText;
    document.getElementById('edit-input-date').value = document.getElementById('detail-date').innerText;
    document.getElementById('edit-input-time').value = document.getElementById('detail-time').innerText;
    document.getElementById('edit-input-desc').value = document.getElementById('detail-desc').innerText;
    document.getElementById('edit-input-price').value = document.getElementById('detail-price').innerText;
    document.getElementById('edit-input-booths').value = parseInt(document.getElementById('detail-booths').innerText) || 0;

    document.getElementById('edit-modal').classList.add('show-modal');
}

function saveEventChanges(event) {
    event.preventDefault();

    // 🔑 读取隐藏域主键 ID，通过 ID 实施精准操作而不再仅仅靠 Title 匹配
    const currentId = document.getElementById('edit-event-id').value;
    const currentTitle = document.getElementById('edit-input-title').value;
    const newVenue = document.getElementById('edit-input-venue').value;
    const newDate = document.getElementById('edit-input-date').value;
    const newTime = document.getElementById('edit-input-time').value;
    const newDesc = document.getElementById('edit-input-desc').value;
    const newPrice = document.getElementById('edit-input-price').value;
    const newBooths = document.getElementById('edit-input-booths').value;

    document.getElementById('detail-venue').innerText = newVenue;
    document.getElementById('detail-date').innerText = newDate;
    document.getElementById('detail-time').innerText = newTime;
    document.getElementById('detail-desc').innerText = newDesc;
    document.getElementById('detail-price').innerText = newPrice;
    document.getElementById('detail-booths').innerText = newBooths; 

    // 根据主键 ID 或标题寻找到列表里对应的卡片进行实时更新
    const allCards = document.querySelectorAll('#tab-events .booth-card');
    allCards.forEach(card => {
        if (card.getAttribute('data-id') === currentId || card.querySelector('h3').innerText === currentTitle) {
            const infoParagraphs = card.querySelectorAll('.booth-info');
            if (infoParagraphs.length >= 2) {
                infoParagraphs[0].innerText = `📅 Date: ${newDate}`;
                infoParagraphs[1].innerText = `🎪 Total Booths: ${newBooths}`; 
            }
            card.setAttribute('data-venue', newVenue);
            card.setAttribute('data-date', newDate);
            card.setAttribute('data-time', newTime);
            card.setAttribute('data-desc', newDesc);
            card.setAttribute('data-price', newPrice);
            card.setAttribute('data-booths', newBooths);
        }
    });

    const savedDataStr = localStorage.getItem('saved_event_' + currentId) || localStorage.getItem('saved_event_' + currentTitle);
    let eventData = savedDataStr ? JSON.parse(savedDataStr) : { id: currentId, title: currentTitle, status: 'active', isCustom: false };

    eventData.venue = newVenue; eventData.date = newDate; eventData.time = newTime;
    eventData.desc = newDesc; eventData.price = newPrice; eventData.booths = newBooths;

    // 同步写回两份缓存保证向下兼容
    if (currentId) localStorage.setItem('saved_event_' + currentId, JSON.stringify(eventData));
    localStorage.setItem('saved_event_' + currentTitle, JSON.stringify(eventData));
    
    alert("Event changes saved successfully!");
    closeEditModal(); 
}

/**
 * 6. 将活动状态设为已删除 (Delete Event)
 */
function deleteEvent() {
    const currentId = document.getElementById('tab-event-details').getAttribute('data-current-event-id');
    const currentEventName = document.getElementById('detail-title').innerText;
    
    if (confirm(`Are you sure you want to change the status of "${currentEventName}" to Deleted?`)) {
        const allCards = document.querySelectorAll('#tab-events .booth-card');
        allCards.forEach(card => {
            if (card.getAttribute('data-id') === currentId || card.querySelector('h3').innerText === currentEventName) {
                const statusParagraph = card.querySelector('.event-status-text');
                if (statusParagraph) {
                    statusParagraph.innerHTML = '💡 Status: <span class="status-deleted-text">Deleted</span>';
                }
                card.setAttribute('data-status', 'deleted');

                const savedData = localStorage.getItem('saved_event_' + currentId) || localStorage.getItem('saved_event_' + currentEventName);
                let eventData = savedData ? JSON.parse(savedData) : {
                    id: currentId, title: currentEventName, venue: card.getAttribute('data-venue'),
                    date: card.getAttribute('data-date'), time: card.getAttribute('data-time'),
                    desc: card.getAttribute('data-desc'), price: card.getAttribute('data-price'),
                    booths: card.getAttribute('data-booths'), isCustom: false
                };
                eventData.status = 'deleted';
                
                if (currentId) localStorage.setItem('saved_event_' + currentId, JSON.stringify(eventData));
                localStorage.setItem('saved_event_' + currentEventName, JSON.stringify(eventData));
            }
        });
        alert(`"${currentEventName}" status has been set to Deleted.`);
        switchTab('events');
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
        if (cardStatus === 'deleted') {
            card.style.display = (filterValue === 'all') ? 'block' : 'none'; 
            return;
        }
        if (filterValue === 'all' || cardStatus === filterValue) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function handleSearch() {
    const searchText = document.getElementById('global-search').value.toLowerCase();
    const cards = document.querySelectorAll('.booth-card');

    cards.forEach(card => {
        const titleText = card.querySelector('h3').innerText.toLowerCase();
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
    
    const badge = card.querySelector('.status-badge');
    if (badge) {
        badge.innerText = 'Confirmed';
        badge.className = 'status-badge incoming'; 
    }
    
    localStorage.setItem('app_status_' + titleText, 'confirmed');
    alert("Application approved successfully!");
}

/**
 * 9. 数据恢复逻辑 (Restore Data on Page Load)
 */
function restoreSavedEvents() {
    const allCards = document.querySelectorAll('#tab-events .booth-card');
    allCards.forEach(card => {
        const titleText = card.querySelector('h3').innerText;
        // 先为既有的静态 HTML 卡片补充生成虚拟 ID 以供点击联动
        const virtualId = 'ev_' + titleText.replace(/\s+/g, '_');
        card.setAttribute('data-id', virtualId);

        const savedData = localStorage.getItem('saved_event_' + virtualId) || localStorage.getItem('saved_event_' + titleText);
        
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

    // 读取通过前端新创建的自定义活动 ID 列表并渲染
    const customIds = JSON.parse(localStorage.getItem('custom_event_ids') || '[]');
    customIds.forEach(id => {
        const savedData = localStorage.getItem('saved_event_' + id);
        if (savedData) { createEventCardInDOM(JSON.parse(savedData)); }
    });

    // 向上兼容：如果原本存在旧标题列表但也需要载入的情况
    const customTitles = JSON.parse(localStorage.getItem('custom_event_titles') || '[]');
    customTitles.forEach(title => {
        const savedData = localStorage.getItem('saved_event_' + title);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            // 避免重复追加渲染
            const exists = Array.from(document.querySelectorAll('#tab-events .booth-card')).some(c => c.querySelector('h3').innerText === title);
            if (!exists) createEventCardInDOM(parsed);
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
 * 10. 用户注销登录 (Logout)
 */
function logout() {
    if (confirm("Are you sure you want to log out?")) {
        // 请求后端的注销逻辑（销毁 Session）
        fetch('../logout.php', { method: 'POST' })
        .then(() => {
            // 清理本地状态
            localStorage.removeItem("isLoggedIn");
            // 跳转回登录页
            window.location.href = "../index.html";
        })
        .catch(err => {
            // 如果后端请求失败，也要强制跳转
            window.location.href = "../index.html";
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
    console.log("🚀 restoreUserMessages 开始运行了！");

    fetch('../message.php?action=admin_get_all')
    .then(res => {
        console.log("📡 收到 PHP 响应状态:", res.status);
        return res.json();
    })
    .then(data => {
        console.log("📦 解析出来的 JSON 数据:", data);
        
        const gridContainer = document.getElementById('admin-messages-grid');
        if (!gridContainer) {
            console.error("❌ 找不到 HTML 容器: admin-messages-grid");
            return;
        }

        if (data.success && data.messages.length > 0) {
            gridContainer.innerHTML = ''; // 清空旧的静态模拟卡片

            data.messages.forEach(msg => {
                // 判断是否已经回复
                const replyStatus = msg.reply 
                    ? `<span style="color: #2ec4b6;"><strong>Replied: </strong>${msg.reply}</span>` 
                    : `<span style="color: #e71d36; font-weight: bold;">⚠️ Unreplied</span>`;

                // 兼容 Users 表里的 e-mail 字段命名
                const userEmail = msg['e-mail'] || msg.email || 'No Email';

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
                `;
            });
        } else {
            gridContainer.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">No messages from users yet.</p>';
        }
    })
    .catch(err => {
        console.error("❌ Fetch 过程中出错:", err);
    });
};

// 2. 管理员点击“Reply”按钮提交回复到数据库 (强制挂载到 window 全局对象)
window.submitAdminReply = function(messageId) {
    const replyInput = document.getElementById(`reply-input-${messageId}`);
    if (!replyInput) return;
    
    const replyContent = replyInput.value.trim();

    if (!replyContent) {
        alert('Please enter a reply text first!');
        return;
    }

    fetch('../message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=admin_reply&message_id=${messageId}&reply=${encodeURIComponent(replyContent)}`
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            replyInput.value = '';
            window.restoreUserMessages(); // 回复成功后重新刷新列表
        }
    })
    .catch(err => {
        alert('Failed to send reply: ' + err.message);
    });
};

// 自执行的活动数据加载模块，不依赖你原有的函数名
(function() {
    function fetchAndRenderEvents() {
        const eventsGrid = document.getElementById('events-grid');
        if (!eventsGrid) return; // 如果当前页面或者当前Tab没找到这个容器，就不执行

        // 发送请求到 get_events.php (根据你的目录结构，home.js在子目录，用 '../get_events.php')
        fetch('../get_events.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应异常，状态码: ' + response.status);
                }
                return response.json();
            })
            .then(res => {
                eventsGrid.innerHTML = ''; // 清空原有内容或加载提示

                if (!res.success) {
                    eventsGrid.innerHTML = `<div style="color:red; padding:20px;">数据加载失败: ${res.message}</div>`;
                    return;
                }

                const eventsList = res.data;
                if (!eventsList || eventsList.length === 0) {
                    eventsGrid.innerHTML = `<div style="color:#718096; padding:20px; text-align:center; width:100%;">暂无活动数据。</div>`;
                    return;
                }

                // 循环遍历数据，生成卡片并塞入容器
                eventsList.forEach(event => {
                    const card = document.createElement('div');
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
                    `;
                    eventsGrid.appendChild(card);
                });
            })
            .catch(error => {
                console.error('获取活动数据失败:', error);
                eventsGrid.innerHTML = `<div style="color:red; padding:20px;">数据加载失败: ${error.message}</div>`;
            });
    }

    // 防 XSS 转义工具函数
    function escapeHtml(text) {
        return text ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';
    }

    // 监听页面加载或配合选项卡切换触发
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchAndRenderEvents);
    } else {
        fetchAndRenderEvents();
    }

    // 暴露给全局，以防你的选项卡切换代码需要手动刷新它
    window.refreshAdminEvents = fetchAndRenderEvents;
})();

// 自执行的活动数据加载模块（带 Edit / Delete 功能）
(function() {
    function fetchAndRenderEvents() {
        const eventsGrid = document.getElementById('events-grid');
        if (!eventsGrid) return; 

        fetch('../get_events.php')
            .then(response => {
                if (!response.ok) throw new Error('网络响应异常，状态码: ' + response.status);
                return response.json();
            })
            .then(res => {
                eventsGrid.innerHTML = ''; 

                if (!res.success) {
                    eventsGrid.innerHTML = `<div style="color:red; padding:20px;">数据加载失败: ${res.message}</div>`;
                    return;
                }

                const eventsList = res.data;
                if (!eventsList || eventsList.length === 0) {
                    eventsGrid.innerHTML = `<div style="color:#718096; padding:20px; text-align:center; width:100%;">暂无活动数据。</div>`;
                    return;
                }

                eventsList.forEach(event => {
                    const card = document.createElement('div');
                    card.className = 'event-card'; 
                    
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
                    `;
                    
                    // 绑定编辑点击事件
                    card.querySelector('.btn-edit').addEventListener('click', function(e) {
                        e.stopPropagation(); // 阻止事件冒泡
                        const eventId = this.getAttribute('data-id');
                        editEvent(eventId);
                    });

                    // 绑定删除点击事件
                    card.querySelector('.btn-delete').addEventListener('click', function(e) {
                        e.stopPropagation(); 
                        const eventId = this.getAttribute('data-id');
                        deleteEvent(eventId);
                    });

                    eventsGrid.appendChild(card);
                });
            })
            .catch(error => {
                console.error('获取活动数据失败:', error);
                eventsGrid.innerHTML = `<div style="color:red; padding:20px;">数据加载失败: ${error.message}</div>`;
            });
    }

    // ==========================================
    // 逻辑处理函数
    // ==========================================

    // 1. 编辑事件的逻辑
    function editEvent(id) {
        // 做法 A：直接跳转到 edit_event.php 并带上 ID
        window.location.href = `../edit_event.php?id=${id}`;
        
        // 如果你打算用弹窗（Modal）处理，可以在这里写触发弹窗显示并回填数据的逻辑
    }

    // 2. 删除事件的逻辑
    function deleteEvent(id) {
        if (confirm(`确定要删除 ID 为 #${id} 的活动吗？此操作不可恢复！`)) {
            // 发送请求到后端的删除 API（比如你项目里如果有 delete_event.php 的话）
            fetch(`../delete_event.php?id=${id}`, {
                method: 'GET' // 或者 'POST'，取决于你删除接口怎么写
            })
            .then(response => response.json())
            .then(res => {
                if (res.success) {
                    alert('删除成功！');
                    fetchAndRenderEvents(); // 重新刷新列表
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

    function escapeHtml(text) {
        return text ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchAndRenderEvents);
    } else {
        fetchAndRenderEvents();
    }

    window.refreshAdminEvents = fetchAndRenderEvents;
})();

// 修改或扩展你的 switchTab 函数
// 核心切换函数
// 核心切换函数


// 异步从 admin_application.php 获取数据
function loadApplications() {
    // 💡 精准定位到 HTML 图 3 中的 tbody ID
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

// 把数据显示成带审批按钮的表格
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

// 处理 Approve / Deny 按钮点击
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
// 暴力兜底：只要页面一刷新，别管点没点菜单，先强行执行拉取数据
console.log("🚀 调试：正在强行绕过点击事件，直接拉取后端数据...");
loadApplications();

