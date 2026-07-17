/**
 * 切换选项卡页面 (Tab Switching)
 * @param {string} tabId - 要切换到的目标选项卡ID
 */
function switchTab(tabId) {
    // 隐藏所有面板
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    // 取消所有菜单激活
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    // 如果 tabId 已经包含了 'tab-'，就不再重复拼接
    const fullId = tabId.startsWith('tab-') ? tabId : ('tab-' + tabId);
    
    // 显示选中的目标
    const target = document.getElementById(fullId);
    if (target) {
        target.classList.add('active');
    }
    
    // 动态更新页面顶部的标题标题 (根据当前 tabId 处理特殊命名)
    if (tabId === 'help') {
        document.getElementById('page-title').innerText = 'Help & Support';
    } else {
        document.getElementById('page-title').innerText = tabId === 'events' ? 'Available Events' : tabId.replace('-', ' ').toUpperCase();
    }
}

/**
 * 筛选活动列表 (根据搜索关键词、州属、月份)
 */
function filterEvents() {
    // 获取搜索框输入值并转成小写
    const s = document.getElementById('event-search').value.toLowerCase();
    // 获取选中的州属筛选值
    const st = document.getElementById('state-filter').value;
    // 获取选中的月份筛选值
    const mo = document.getElementById('month-filter').value;
    
    // 遍历所有的活动卡片进行匹配筛选
    document.querySelectorAll('#event-grid .booth-card').forEach(c => {
        const title = c.querySelector('h3').innerText.toLowerCase();
        const state = c.getAttribute('data-state');
        const month = c.getAttribute('data-month');
        // 判断条件：标题包含关键词、州属匹配（或未选）、月份匹配（或未选）
        c.style.display = (title.includes(s) && (st === "" || state === st) && (mo === "" || month === mo)) ? 'block' : 'none';
    });
}

/**
 * 显示活动详细信息
 */
function showEventDetail(title, date, loc, time, desc, price, booths) {
    document.getElementById('d-title').innerText = title;
    document.getElementById('d-date').innerText = date;
    document.getElementById('d-venue').innerText = loc;
    document.getElementById('d-time').innerText = time;
    document.getElementById('d-desc').innerText = desc;
    document.getElementById('d-price').innerText = event.booth_price;
    
    // 将当前活动标题记录到全局变量，方便后续表单调用
    window.currentEventTitle = title;
    // 切换到详情页面
    switchTab('event-detail');
}

/**
 * 打开摊位申请表单
 */
function openApplyForm() {
    // 自动将刚刚点击的活动标题填入表单中
    document.getElementById('form-event-title').innerText = window.currentEventTitle;
    // 切换到申请表单页面
    switchTab('apply-form');
}

/**
 * 提交摊位申请
 */
function submitApplication() {
    // 1. 获取表单数据
    const eventTitle = document.getElementById('form-event-title').innerText;
    const applicantName = document.getElementById('applicant-name').value;

    // 2. 模拟数据提交成功后的弹窗逻辑
    alert("Application submitted successfully!");

    // 3. 动态添加到 "My Applications" 面板
    const myAppsGrid = document.getElementById('my-apps-grid');
    
    // 创建一个新的卡片结构元素
    const newCard = document.createElement('div');
    newCard.className = 'booth-card';
    
    // 写入新申请卡片的 HTML 内容（包含 Pending 状态和 Cancel 按钮）
    newCard.innerHTML = `
        <h3>${eventTitle}</h3>
        <p><strong>Applicant:</strong> ${applicantName}</p>
        <p><strong>Status:</strong> <span class="status-text" style="color: orange; font-weight: bold;">Pending</span></p>
        <button class="btn-cancel" onclick="cancelApplication(this)" style="margin-top:10px; cursor:pointer;">Cancel Application</button>
    `;
    
    // 将生成的卡片追加到已申请列表中
    myAppsGrid.appendChild(newCard);

    // 4. 清空表单数据
    document.getElementById('application-form').reset();
    // 自动切换到我的申请标签页查看状态
    switchTab('my-applications');
}

/**
 * 取消申请事件
 * @param {HTMLElement} element - 触发事件的按钮本身 
 */
function cancelApplication(element) {
    // 找到当前按钮所属的卡片容器
    const card = element.closest('.booth-card');
    // 找到该卡片内的状态文本元素
    const statusSpan = card.querySelector('.status-text');
    
    // 将状态更新显示为 Cancelled
    statusSpan.innerText = 'Cancelled';
    statusSpan.style.color = 'red'; // 改为红色样式
    
    // 隐藏取消按钮，防止用户重复点击
    element.style.display = 'none';
}

/**
 * 渲染我的申请列表的数据模拟函数（如果你原本有用此函数渲染数据）
 */
function renderMyApplications() {
    // 假设 app 是应用数据对象（这里作为你保留的结构参考）
    const appHtml = `
        <div class="booth-card">
            <h3>${app.eventName}</h3>
            <p>Applicant: ${app.applicant}</p>
            <p>Status: <span class="status-text" style="color: orange;">Pending</span></p>
            <button class="btn-cancel" onclick="cancelApplication(this)" style="margin-top:10px; cursor:pointer;">Cancel Application</button>
        </div>
    `;
    document.getElementById('my-apps-grid').innerHTML += appHtml;
}

/**
 * 切换个人资料的“查看”模式与“编辑”模式
 */
function toggleEdit() {
    const viewDiv = document.getElementById('profile-view');
    const editForm = document.getElementById('profile-edit-form');
    const btn = document.getElementById('edit-btn');

    // 如果当前处于查看状态，点击后显示编辑表单
    if (editForm.style.display === 'none') {
        viewDiv.style.display = 'none';
        editForm.style.display = 'block';
        btn.textContent = '✖'; // 切换按钮为取消图标
    } else {
        // 如果当前处于编辑状态，点击后切回查看状态
        viewDiv.style.display = 'block';
        editForm.style.display = 'none';
        btn.textContent = '✏️'; // 恢复编辑图标
    }
}

/**
 * 保存修改后的个人资料
 */
function saveProfile() {
    // 从输入框获取最新修改的值
    const newName = document.getElementById('edit-name').value;
    const newPhone = document.getElementById('edit-phone').value;
    const newEmail = document.getElementById('edit-email').value;
    const newBusiness = document.getElementById('edit-business').value;

    // 更新到查看视图文本中
    document.getElementById('view-name').textContent = newName;
    document.getElementById('view-phone').textContent = newPhone;
    document.getElementById('view-email').textContent = newEmail;
    document.getElementById('view-business').textContent = newBusiness;

    alert("Profile updated successfully!");
    toggleEdit(); // 保存完成后自动切回查看模式
}

/**
 * 登出系统
 */
function logout() { 
    window.location.href = "/index.html"; 
}

/* ========================================================== */
/* 【新增加】Help & Support 模块专用的逻辑函数                   */
/* ========================================================== */

/**
 * 机器人常见问题自动回复逻辑 (Robot Reply)
 * @param {string} type - 点击的问题类型关键字
 */
function robotReply(type) {
    const responseBox = document.getElementById('robot-response-box');
    const robotText = document.getElementById('robot-text');
    
    let answer = "";
    
    // 匹配对应的问题类型，给出不同的预设回答
    if (type === 'how_to_apply') {
        answer = "To apply for a booth, go to the 'Events' tab, click on any active event, click 'Apply Now', choose your booth and fill up the form!";
    } else if (type === 'refund_policy') {
        answer = "Cancellations made 7 days prior to the event are eligible for a 50% refund. No refunds will be given for last-minute cancellations.";
    } else if (type === 'payment') {
        answer = "Currently, we accept Bank Transfer and E-wallets (Touch 'n Go). Payment details will be sent via email once admin approves your application.";
    }
    
    // 渲染文本内容到提示框中
    robotText.innerText = answer;
    // 将原本隐藏的回复框展示出来
    responseBox.style.display = "block";
}

/**
 * 留言给管理员的逻辑 (Message Admin)
 */
function sendMessageToAdmin() {
    // 获取用户输入的留言标题与正文
    const subject = document.getElementById('msg-subject').value;
    const content = document.getElementById('msg-content').value;
    
    // 纯前端环境模拟提交成果，弹出通知提示
    alert(`Message sent to Admin successfully!\n\nSubject: ${subject}`);
    
    // 成功提交后，重置清空留言表单里的内容
    document.getElementById('admin-message-form').reset();
}

/**
 * =========================================================================
 * 【新功能区域】消息历史中心（读取 Admin 的回复并实时渲染）
 * =========================================================================
 */

/**
 * 功能：读取并渲染当前用户的留言历史与 Admin 的回复
 */
function renderUserMessageHistory() {
    const historyGrid = document.getElementById('user-message-history-grid');
    if (!historyGrid) return;

    // 从 localStorage 捞出全局共享的消息池
    const rawMessages = localStorage.getItem('admin_messages');
    let allMessages = rawMessages ? JSON.parse(rawMessages) : [];

    // 如果里面有数据，清空容器以准备渲染最新状态
    if (allMessages.length > 0) {
        historyGrid.innerHTML = '';
    } else {
        // 如果完全没有记录，显示提示文本
        historyGrid.innerHTML = `<p id="no-history-text" style="color: #94a3b8; font-style: italic; font-size: 0.9rem;">No message history found.</p>`;
        return; 
    }

    // 循环画出每条记录
    allMessages.forEach(msg => {
        const historyCard = document.createElement('div');
        // 保持跟你现有的漂亮卡片边框一致
        historyCard.style.cssText = "background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;";

        // 判断 Admin 是否回复了
        let replyHtml = '';
        if (msg.reply) {
            replyHtml = `
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: 4px; margin-top: 5px;">
                    <p style="margin: 0; font-size: 0.9rem; color: #166534;">
                        <strong>↩️ Admin Reply:</strong> ${msg.reply}
                    </p>
                </div>
            `;
        } else {
            replyHtml = `
                <div style="text-align: right;">
                    <span style="background: #fef3c7; color: #d97706; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">
                        ⏳ Pending Admin Response
                    </span>
                </div>
            `;
        }

        // 注入卡片内容
        historyCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #334155; font-size: 0.95rem;">Subject: ${msg.subject}</strong>
                <span style="font-size: 0.8rem; color: #94a3b8;">${msg.time}</span>
            </div>
            <p style="margin: 0; font-size: 0.9rem; color: #64748b; line-height: 1.4; background: white; padding: 8px; border-radius: 4px; border: 1px solid #f1f5f9;">
                ${msg.content}
            </p>
            ${replyHtml}
        `;

        // 最新的留言放在最上面显示
        historyGrid.insertBefore(historyCard, historyGrid.firstChild);
    });
}

/**
 * 功能：处理 User 发送新留言的动作（带唯一ID与时间戳）
 */
function handleUserSendMessage(event) {
    event.preventDefault(); // 阻止默认刷新

    // 获取对应的 Input 和 Textarea
    const subjectInput = document.querySelector('input[placeholder="e.g., Booth Query"]');
    const contentInput = document.querySelector('textarea[placeholder="Type your message here..."]');

    if (!subjectInput || !contentInput) return;

    const subjectText = subjectInput.value.trim();
    const contentText = contentInput.value.trim();

    if (!subjectText || !contentText) {
        alert("Please fill in both Subject and Your Message!");
        return;
    }

    // 从 localStorage 获取现有的消息
    const rawMessages = localStorage.getItem('admin_messages');
    let allMessages = rawMessages ? JSON.parse(rawMessages) : [];

    // 创建一个标准的消息数据包，包含唯一 ID
    const newMessage = {
        id: "msg_" + Date.now(), 
        subject: subjectText,
        content: contentText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " Today",
        username: "Ali (ali@gmail.com)", // 这里实际开发可以动态抓取已登录的用户名
        businessName: "Uncle Rojak",     // 动态抓取商户名
        reply: null                      // 初始状态没有回复
    };

    allMessages.push(newMessage);
    localStorage.setItem('admin_messages', JSON.stringify(allMessages));

    alert("🎉 Message sent to Admin successfully!");

    // 清空输入框
    subjectInput.value = '';
    contentInput.value = '';

    // 实时更新列表
    renderUserMessageHistory();
}

document.addEventListener("DOMContentLoaded", function() {
    // 调用 get_events.php
    fetch('../get_events.php') 
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const grid = document.getElementById('event-grid');
                if (!grid) return; 
                
                grid.innerHTML = ''; // 清空原有内容

                result.data.forEach(event => {
                    const card = document.createElement('div');
                    card.className = 'booth-card';
                    card.style.cursor = 'pointer'; 

                    // 渲染卡片内容
                    const displayDate = event.event_date || event.date || '待定';
                    card.innerHTML = `
                        <h3>${event.event_name || '无名称'}</h3>
                        <p>📍 ${event.venue || '待定'} | 📅 ${displayDate}</p>
                    `;
                    
                    // 点击事件：填充详情并切换面板
                    card.onclick = function() {
                        // 打印完整对象以供调试，如果还是不显示，看控制台里的字段名是否对得上
                        console.log("点击活动的完整数据:", event);

                        // 填充详情页内容
                        const dTitle = document.getElementById('d-title');
                        const dVenue = document.getElementById('d-venue');
                        const dDate = document.getElementById('d-date');
                        const dTime = document.getElementById('d-time');
                        const dDesc = document.getElementById('d-desc');
                        const dPrice = document.getElementById('d-price');
                        const dBooths = document.getElementById('d-booths');

                        if (dTitle) dTitle.innerText = event.event_name || '无标题';
                        if (dVenue) dVenue.innerText = event.venue || '无地点';
                        if (dDate) dDate.innerText = event.event_date || event.date || '待定';
                        if (dTime) dTime.innerText = event.event_time || event.time || '待定';
                        if (dDesc) dDesc.innerText = event.description || '无详细描述';
                        if (dPrice) dPrice.innerText = event.rental_price || event.price || '面议';
                        if (dBooths) dBooths.innerText = event.total_booths || event.booths || '0';

                        // 核心修复：直接传入 HTML 中定义的完整 ID，不再加 tab- 前缀
                        // 确保你的 switchTab 函数里没有自动拼接 'tab-' 的逻辑，或者该函数已支持处理
                        switchTab('event-detail'); 
                    };

                    grid.appendChild(card);
                });
            } else {
                console.error("数据加载失败:", result.message);
            }
        })
        .catch(err => console.error("网络请求错误:", err));
});