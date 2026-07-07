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
        window.location.href = "/index.html"; 
        return;
    }

    // 调用函数：从电脑本地存储 (LocalStorage) 恢复之前保存过的活动和审批状态
    restoreSavedEvents();
    restoreSavedApplications();
    
    // 页面加载时自动读取并渲染来自用户发的消息（带回复功能）
    restoreUserMessages();

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
        
        // 如果切换到消息面板，把顶部标题改掉
        if (tabId === 'messages') pageTitle.innerText = "User Messages";
    }
}

/**
 * 2. 点击活动卡片，进入详情页并展示数据 (包括展示 Layout 平面图)
 */
function viewEventDetails(cardElement) {
    const title = cardElement.getAttribute('data-title');
    const venue = cardElement.getAttribute('data-venue');
    const date = cardElement.getAttribute('data-date');
    const time = cardElement.getAttribute('data-time');
    const desc = cardElement.getAttribute('data-desc');
    const price = cardElement.getAttribute('data-price');
    const booths = cardElement.getAttribute('data-booths');

    document.getElementById('detail-title').innerText = title;
    document.getElementById('detail-venue').innerText = venue;
    document.getElementById('detail-date').innerText = date;
    document.getElementById('detail-time').innerText = time;
    document.getElementById('detail-desc').innerText = desc;
    document.getElementById('detail-price').innerText = price;
    document.getElementById('detail-booths').innerText = booths; 

    const savedData = localStorage.getItem('saved_event_' + title);
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
 */
function handleAddEventSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('add-input-title').value.trim();
    const venue = document.getElementById('add-input-venue').value.trim();
    const date = document.getElementById('add-input-date').value;
    const time = document.getElementById('add-input-time').value;
    const price = document.getElementById('add-input-price').value.trim();
    const booths = document.getElementById('add-input-booths').value.trim();
    const desc = document.getElementById('add-input-desc').value.trim();
    const layoutFile = document.getElementById('add-input-layout').files[0];

    if (localStorage.getItem('saved_event_' + title)) {
        alert("An event with this title already exists!");
        return;
    }

    const finalizeEventSave = (base64String) => {
        const newEventData = {
            title: title, venue: venue, date: date, time: time,
            price: price, booths: booths, desc: desc, status: 'active',
            isCustom: true, layout: base64String
        };

        localStorage.setItem('saved_event_' + title, JSON.stringify(newEventData));

        let customTitles = JSON.parse(localStorage.getItem('custom_event_titles') || '[]');
        if (!customTitles.includes(title)) {
            customTitles.push(title);
            localStorage.setItem('custom_event_titles', JSON.stringify(customTitles));
        }

        createEventCardInDOM(newEventData);
        alert(`🎉 Event "${title}" created successfully!`);

        document.getElementById('add-event-form').reset();
        document.getElementById('layout-preview-container').style.display = 'none';
        switchTab('events');
    };

    if (layoutFile) {
        const reader = new FileReader();
        reader.onload = function(e) { finalizeEventSave(e.target.result); };
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

    const card = document.createElement('div');
    card.className = 'booth-card clickable-card';
    
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

    const allCards = document.querySelectorAll('#tab-events .booth-card');
    allCards.forEach(card => {
        if (card.querySelector('h3').innerText === currentTitle) {
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

    const savedDataStr = localStorage.getItem('saved_event_' + currentTitle);
    let eventData = savedDataStr ? JSON.parse(savedDataStr) : { title: currentTitle, status: 'active', isCustom: false };

    eventData.venue = newVenue; eventData.date = newDate; eventData.time = newTime;
    eventData.desc = newDesc; eventData.price = newPrice; eventData.booths = newBooths;

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
                const statusParagraph = card.querySelector('.event-status-text');
                if (statusParagraph) {
                    statusParagraph.innerHTML = '💡 Status: <span class="status-deleted-text">Deleted</span>';
                }
                card.setAttribute('data-status', 'deleted');

                const savedData = localStorage.getItem('saved_event_' + currentEventName);
                let eventData = savedData ? JSON.parse(savedData) : {
                    title: currentEventName, venue: card.getAttribute('data-venue'),
                    date: card.getAttribute('data-date'), time: card.getAttribute('data-time'),
                    desc: card.getAttribute('data-desc'), price: card.getAttribute('data-price'),
                    booths: card.getAttribute('data-booths'), isCustom: false
                };
                eventData.status = 'deleted';
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

    const customTitles = JSON.parse(localStorage.getItem('custom_event_titles') || '[]');
    customTitles.forEach(title => {
        const savedData = localStorage.getItem('saved_event_' + title);
        if (savedData) { createEventCardInDOM(JSON.parse(savedData)); }
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
 * =========================================================================
 * 【新功能区域】11. 消息中心（读取、展示留言、以及 Admin 实时 Reply 回复逻辑）
 * =========================================================================
 */

/**
 * 作用：从 localStorage 读取消息，并生成带有 "Reply" 功能的卡片
 */
function restoreUserMessages() {
    const messagesGrid = document.getElementById('admin-messages-grid');
    if (!messagesGrid) return;

    // 清空现有的测试内容，确保每次加载或回复后重新洗牌渲染最新状态
    messagesGrid.innerHTML = '';

    const rawMessages = localStorage.getItem('admin_messages');
    let userMessages = rawMessages ? JSON.parse(rawMessages) : [];

    // 如果里面没有任何真实留言，我们可以先塞入一条跟你图片上一模一样的 Dummy 预设数据，供本地开发演示
    if (userMessages.length === 0) {
        userMessages = [{
            id: "msg_demo_1",
            subject: "Booth Query",
            time: "Just now",
            username: "Ali (ali@gmail.com)",
            businessName: "Uncle Rojak",
            content: "Hi Admin, I would like to know if there are any promotional discounts available if I rent Booth 1 and Booth 2 together for the upcoming Pet Lovers Carnival? Thank you!",
            reply: null // 还未回复
        }];
        localStorage.setItem('admin_messages', JSON.stringify(userMessages));
    }

    // 循环遍历渲染消息
    userMessages.forEach(msg => {
        const msgCard = document.createElement('div');
        msgCard.className = 'booth-card';
        msgCard.style.position = 'relative';
        msgCard.style.marginBottom = '20px';
        
        // 1. 判断是否已经回复过，决定是否显示 Reply 按钮或 Reply 结果
        let replySectionHtml = '';
        if (msg.reply) {
            // 如果已经有了回复内容，显示绿色背景的已回复区块
            replySectionHtml = `
                <div style="background: #f0fdf4; padding: 12px; border-radius: 6px; margin-top: 15px; border: 1px solid #bbf7d0;">
                    <p style="margin: 0; font-size: 0.9rem; color: #166534;">
                        <strong>↩️ Admin Reply:</strong> ${msg.reply}
                    </p>
                </div>
            `;
        } else {
            // 如果还没回复，则渲染出一个 "Reply" 交互动作按钮以及隐藏的动态输入表单
            replySectionHtml = `
                <div style="margin-top: 15px; text-align: right;" id="action-box-${msg.id}">
                    <button class="status-badge incoming" style="border: none; cursor: pointer; padding: 6px 16px; font-size: 0.85rem;" onclick="toggleReplyForm('${msg.id}')">
                        Reply
                    </button>
                </div>
                <div id="reply-form-${msg.id}" style="display: none; margin-top: 15px; border-top: 1px dashed #ddd; padding-top: 15px;">
                    <textarea id="reply-input-${msg.id}" placeholder="Type your response here..." style="width: 100%; min-height: 80px; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-family: inherit; font-size: 0.9rem; resize: vertical; box-sizing: border-box;"></textarea>
                    <div style="text-align: right; margin-top: 8px;">
                        <button style="background: #999; color: white; border: none; border-radius: 4px; padding: 5px 12px; cursor: pointer; font-size: 0.85rem; margin-right: 8px;" onclick="toggleReplyForm('${msg.id}')">Cancel</button>
                        <button style="background: #4F6D7A; color: white; border: none; border-radius: 4px; padding: 5px 15px; cursor: pointer; font-size: 0.85rem;" onclick="submitAdminReply('${msg.id}')">Send Response</button>
                    </div>
                </div>
            `;
        }

        // 2. 拼接卡片核心骨架
        msgCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #4F6D7A;">📝 Subject: ${msg.subject || 'No Subject'}</h3>
                <span style="font-size: 0.85rem; color: #999;">${msg.time || 'Received'}</span>
            </div>
            <p class="booth-info"><strong>👤 From User:</strong> ${msg.username || 'Anonymous User'}</p>
            <p class="booth-info"><strong>🏢 Business:</strong> ${msg.businessName || 'N/A'}</p>
            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 10px; border: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: #334155;">
                    ${msg.content || ''}
                </p>
            </div>
            ${replySectionHtml}
        `;

        // 把最新收到的消息始终推到网格面板的最顶端显示
        messagesGrid.insertBefore(msgCard, messagesGrid.firstChild);
    });
}

/**
 * 辅助交互：点击 Reply 展开或关闭输入栏
 */
function toggleReplyForm(msgId) {
    const form = document.getElementById(`reply-form-${msgId}`);
    if (form) {
        form.style.display = (form.style.display === 'none') ? 'block' : 'none';
        if (form.style.display === 'block') {
            document.getElementById(`reply-input-${msgId}`).focus();
        }
    }
}

/**
 * 核心逻辑：Admin 点击发送，保存回复到数据池中，以便 User 端同步接收
 */
function submitAdminReply(msgId) {
    const inputElement = document.getElementById(`reply-input-${msgId}`);
    if (!inputElement) return;

    const replyText = inputElement.value.trim();
    if (!replyText) {
        alert("Please write something before sending!");
        return;
    }

    // 从 localStorage 获取现有的所有消息数组
    const rawMessages = localStorage.getItem('admin_messages');
    let userMessages = rawMessages ? JSON.parse(rawMessages) : [];

    // 找到当前回复的那条特定 ID 消息对象
    const targetMessage = userMessages.find(m => m.id === msgId);
    if (targetMessage) {
        // 给这个对象挂载上全新的 reply 回复属性
        targetMessage.reply = replyText;
        
        // 重新序列化保存，确保 User 刷新页面时能够拿到这条数据
        localStorage.setItem('admin_messages', JSON.stringify(userMessages));
        
        alert("✉️ Reply sent successfully! The user will see your response on their dashboard.");
        
        // 重新刷新局部面板，将回复完美渲染出来
        restoreUserMessages();
    } else {
        alert("Error: Message data not found.");
    }
}

/**
 * 10. 安全退出 (Logout)
 */
function logout() {
    if (confirm("Are you sure you want to log out?")) {
        alert("Logging out from Booking Booth System...");
        localStorage.removeItem("isLoggedIn");
        window.location.href = "/index.html"; 
    }
}