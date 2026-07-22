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
    const fullId = document.getElementById(tabId) ? tabId : ('tab-' + tabId);
    
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
    const s = document.getElementById('event-search').value.toLowerCase();
    const st = document.getElementById('state-filter') ? document.getElementById('state-filter').value : "";
    const mo = document.getElementById('month-filter').value;
    
    document.querySelectorAll('#event-grid .booth-card').forEach(c => {
        const title = c.querySelector('h3') ? c.querySelector('h3').innerText.toLowerCase() : "";
        const state = c.getAttribute('data-state') || "";
        const month = c.getAttribute('data-month') || "";
        
        // 只有当所有条件都满足时，才显示
        const matchS = title.includes(s);
        const matchSt = (st === "" || state === st);
        const matchMo = (mo === "" || month === mo);
        
        c.style.display = (matchS && matchSt && matchMo) ? 'block' : 'none';
    });
}

/**
 * 显示活动详细信息
 */
function showEventDetail(title, date, loc, time, desc, price) {
    document.getElementById('d-title').innerText = title;
    document.getElementById('d-date').innerText = date;
    document.getElementById('d-venue').innerText = loc;
    document.getElementById('d-time').innerText = time;
    document.getElementById('d-desc').innerText = desc;
    
    // 直接使用传入的 price 参数，而不是去访问 event 对象
    document.getElementById('d-price').innerText = price ? ('$' + price) : 'No Price Data';
    
    // 将当前活动标题记录到全局变量，方便后续表单调用
    window.currentEventTitle = title;
    
    // 切换到详情页面
    switchTab('event-detail');
}

/**
 * 打开摊位申请表单
 */
function openApplyForm() {
    // 确保从详情页的标题获取最新的标题，而不是依赖可能为空的全局变量
    const detailTitle = document.getElementById('d-title').innerText;
    const formTitleEl = document.getElementById('form-event-title');
    
    if (formTitleEl) {
        formTitleEl.innerText = "Apply: " + detailTitle;
    }
    
    // 切换到申请表单页面
    switchTab('apply-form');
}

/**
 * 提交摊位申请
 */
/**
 * 核心逻辑：移除所有 localStorage 依赖
 * 确保所有请求通过 Session 自动鉴权
 */

// 1. 个人资料加载
/**
 * 最终版 user.js
 * 纯粹的 Session 鉴权模式，完全移除 localStorage
 */

// 1. 加载资料
function loadProfile() {
    // 这里不需要传任何参数，服务器通过 Session 自动识别谁在访问
    fetch('../profile.php?action=get_profile')
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const user = result.data;
                document.getElementById('view-name').textContent = user.username;
                document.getElementById('view-phone').textContent = user.phone;
                document.getElementById('view-email').textContent = user.email;
                document.getElementById('view-business').textContent = user.business_name;
            } else {
                console.error("Failed to load profile:", result.message);
            }
        })
        .catch(err => console.error("Network error:", err));
}

// 2. 保存资料
async function saveProfile() {
    const payload = new URLSearchParams({
        action: 'update_profile',
        username: document.getElementById('edit-name').value.trim(),
        phone: document.getElementById('edit-phone').value.trim(),
        business_name: document.getElementById('edit-business').value.trim()
    });

    try {
        const response = await fetch('../profile.php', {
            method: 'POST',
            body: payload
        });

        const result = await response.json();
        if (result.success) {
            alert("Profile updated successfully!");
            location.reload(); // 简单有效，刷新以同步 UI
        } else {
            alert("Failed to save profile: " + result.message);
        }
    } catch (error) {
        alert("Network error occurred while saving profile");
    }
}

// 初始化
document.addEventListener("DOMContentLoaded", loadProfile);

// 3. 提交摊位申请
async function submitApplication() {
    const selectedBooth = document.querySelector('input[name="booth_id"]:checked');
    if (!selectedBooth) {
        alert("Please select a booth!");
        return;
    }

    const payload = {
        action: 'submit',
        // 不再从 localStorage 获取 email，后端直接从 Session 获取用户ID
        event_id: window.currentEventId,
        booth_id: selectedBooth.value,
        product_category: document.getElementById('prod-cat').value,
        product_name: document.getElementById('prod-name').value
    };

    const response = await fetch('../application.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.success) {
        alert("Application submitted successfully!");
        location.reload();
    } else {
        alert("Submission failed: " + result.message);
    }
}

// 4. 页面初始化加载
document.addEventListener("DOMContentLoaded", function() {
    // 如果存在相关加载函数，全部改为无参调用
    if (typeof loadProfile === 'function') loadProfile();
    // 如有历史记录加载，也改为无参
    if (typeof loadApplicationHistory === 'function') loadApplicationHistory();
});

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

    // 安全检查：如果页面没找到这些 ID，报错提示你
    if (!viewDiv || !editForm || !btn) {
        console.error("Failed to find HTML elements, please check if the IDs match!", {viewDiv, editForm, btn});
        return;
    }

    if (editForm.style.display === 'none' || editForm.style.display === '') {
        viewDiv.style.display = 'none';
        editForm.style.display = 'block';
        btn.textContent = '✖';
    } else {
        viewDiv.style.display = 'block';
        editForm.style.display = 'none';
        btn.textContent = '✏️';
    }
}

/**
 * 保存修改后的个人资料
 */


/**
 * 登出系统
 */
function logout() { 
    window.location.href = "../index.html"; 
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
function sendMessageToAdmin() {
    // 1. 获取输入内容
    const subject = document.getElementById('msg-subject').value;
    const content = document.getElementById('msg-content').value;

    // 2. 准备数据发送给 PHP (后端)
    const payload = new URLSearchParams();
    payload.append('action', 'send_message');
    payload.append('subject', subject);
    payload.append('content', content);
    payload.append('email', localStorage.getItem('userEmail')); // 确保传递email以便PHP查到user_id

    // 3. 发送给服务器
    fetch('/message.php', { // get message from db
        method: 'POST',
        body: payload
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("🎉 " + data.message);
            // 清空表单
            document.getElementById('admin-message-form').reset();
            // 刷新历史记录列表
            if (typeof loadMessageHistory === 'function') {
                loadMessageHistory();
            }
        } else {
            alert("❌ " + data.message);
        }
    })
    .catch(error => {
        console.error("请求失败:", error);
        alert("Failed to connect to server, please check the PHP file path");
    });
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

    // 1. 提取日期中的月份 (假设 event.date 是 "2026-08-15")
    const dateStr = event.event_date || event.date || '';
    const month = dateStr ? dateStr.split('-')[1] : ''; // 提取出 "08"
    
    // 2. 将数据绑定到卡片属性上 (核心修改点)
    card.setAttribute('data-month', month);
    card.setAttribute('data-state', event.venue_state || ''); // 确保你的数据库返回了 state 字段

    // 3. 渲染卡片内容
    const displayDate = dateStr || 'Empty';
    card.innerHTML = `
        <h3>${event.event_name || 'Empty'}</h3>
        <p>📍 ${event.venue || 'Empty'} | 📅 ${displayDate}</p>
    `;
    
    // 将卡片加入网格
    grid.appendChild(card);
    
    // ... 保持你原有的点击事件逻辑不变 ...
                    // 点击事件：填充详情并切换面板
                    // 点击事件：填充详情并切换面板
card.onclick = function() {
    // 💡【核心修正】把当前点击的活动ID存入全局变量，确保提交表单时能读取到
    window.currentEventId = event.event_id; 
    
    // 打印完整对象以供调试
    console.log("ID:", window.currentEventId);
    console.log("CLick to view:", event);

    // 填充详情页内容 (以下代码保持原样)
    const dTitle = document.getElementById('d-title');
    const dVenue = document.getElementById('d-venue');
    const dDate = document.getElementById('d-date');
    const dTime = document.getElementById('d-time');
    const dDesc = document.getElementById('d-desc');
    const dPrice = document.getElementById('d-price');

    if (dTitle) dTitle.innerText = event.event_name || '-';
    if (dVenue) dVenue.innerText = event.venue || 'Empty';
    if (dDate) dDate.innerText = event.event_date || event.date || 'Empty';
    if (dTime) dTime.innerText = event.event_time || event.time || 'Empty';
    if (dDesc) dDesc.innerText = event.description || 'Empty';
    if (dPrice) dPrice.innerText = event.booth_price ? ('$' + event.booth_price) : 'No Price Data';
    
    const formTitle = document.getElementById('form-event-title');
    if (formTitle) {
        formTitle.innerText = event.event_name || 'Empty';
    }

    // 接下来调用加载摊位和切换面板的函数
    loadBooths(event.event_id);
    switchTab('event-detail');
};

                    grid.appendChild(card);
                });
            } else {
                console.error("Failed to load data:", result.message);
            }
        })
        .catch(err => console.error("Network request error:", err));
        loadProfile();
});
/**
 * 加载并显示指定活动的摊位
 * @param {number} eventId - 活动ID
 */
function loadBooths(eventId) {
    // 调试弹窗
    alert("Loading event: " + eventId);
    
    // 1. 获取容器
    const container = document.getElementById('booth-container');
    
    // 2. 如果页面没找到这个容器，报错并终止
    if (!container) {
        console.error("Failed to find booth-container, please check if the HTML contains <div id='booth-container'></div>");
        return;
    }

    // 3. 显示加载中提示
    container.innerHTML = 'Loading...'; 

    // 4. 请求后端 API
    fetch(`../get_booths.php?event_id=${eventId}`)
        .then(response => response.json())
        .then(result => {
            // 清空加载提示
            container.innerHTML = ''; 
            
            if (result.success && result.data && result.data.length > 0) {
                result.data.forEach(booth => {
                    // 创建 HTML 结构：单选按钮 + 摊位号
                    const label = document.createElement('label');
                    label.style.display = 'block'; // 让每个选项换行显示
                    label.innerHTML = `
                        <input type="radio" name="booth_id" value="${booth.booth_id}"> 
                        ${booth.booth_number}
                    `;
                    container.appendChild(label);
                });
            } else {
                container.innerHTML = '该活动暂无可用摊位。';
            }
        })
        .catch(err => {
            console.error("Failed to load booths:", err);
            container.innerHTML = 'Failed to load booths, please try again.';
        });
}

//5.显示apply history
function loadApplicationHistory() {
    const email = localStorage.getItem('userEmail');
    const tbody = document.getElementById('app-history-body');

    if (!email) return;

    // 调用你的 API
    fetch(`../application.php?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(result => {
            if (result.success && result.data) {
                tbody.innerHTML = ''; // 清空列表
                result.data.forEach(app => {
                    const row = `
                        <tr>
                            <td>${app.event_name || 'N/A'}</td>
                            <td>${app.booth_number || app.booth_id}</td>
                            <td>${app.product_category}</td>
                            <td>${app.product_name}</td>
                            <td class="status-${app.status.toLowerCase()}">${app.status}</td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            }
        })
        .catch(err => console.error("Failed to fetch application history:", err));
}

// 页面加载完后立即调用
document.addEventListener("DOMContentLoaded", loadApplicationHistory);

/**
 * 修改后的 loadProfile 函数
 * 不再需要传 email 参数，直接请求即可
 */



// 在 user.js 里确保有这段：
// 页面加载时自动获取历史留言
document.addEventListener('DOMContentLoaded', () => {
    fetchHistory();
});

function fetchHistory() {
    fetch('/message.php?action=user_get_history')
    .then(response => response.json())
    .then(data => {
        console.log("Failed to load history:", data); // 在控制台(F12)查看是否拿到数据
        
        const container = document.getElementById('user-message-history-grid');
        const noHistoryText = document.getElementById('no-history-text');
        
        if (!container) return; 

        // 如果有数据
        if (data && data.length > 0) {
            // 隐藏或删除默认提示文字
            if (noHistoryText) noHistoryText.style.display = 'none';
            
            // 清空旧的列表项（除了提示文字以外的动态内容）
            // 如果你想保留提示文字，可以手动删除容器内除了 no-history-text 的所有项
            
            data.forEach(msg => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.style.padding = '10px';
                item.style.border = '1px solid #e2e8f0';
                item.style.borderRadius = '8px';
                item.innerHTML = `
                    <p style="margin:0; font-weight:bold;">Subject: ${msg.subject}</p>
                    <p style="margin:5px 0;">Content: ${msg.content}</p>
                    <p style="margin:0; color: #2563eb;">Reply: ${msg.reply ? msg.reply : '<em>Pending...</em>'}</p>
                `;
                container.appendChild(item);
            });
        } else {
            // 如果数据为空，确保提示文字显示
            if (noHistoryText) noHistoryText.style.display = 'block';
        }
    })
    .catch(error => console.error("Failed to load message history:", error));
}