// ==========================================================
// 全局配置：获取当前登录用户的 Email (通常在登录成功时写入 localStorage)
// ==========================================================
// 💡 优化：移除 fallback 硬编码邮箱，严格校验登录状态
const currentUserEmail = localStorage.getItem("userEmail"); 

/**
 * 0. 页面初始化设置 (Page Initialization)
 */
document.addEventListener("DOMContentLoaded", function() {
    // 页面一加载，自动从 PHP 数据库读取该登录用户的最新个人资料
    loadUserProfile();

    // ✨ 新增：页面一加载，立刻去数据库拿真实的活动卡片，并刷到页面上
    if (typeof loadAvailableEvents === 'function') {
        loadAvailableEvents();
    } else {
        console.error("【🚨 警报】找不到 loadAvailableEvents 函数，请确保已经把第二步的 JS 代码粘贴到了这个文件的最底部！");
    }

    // 如果切换到帮助面板，需要读取留言历史
    if (typeof renderUserMessageHistory === 'function') {
        renderUserMessageHistory();
    }
});

/**
 * 核心功能：从 PHP 后端异步抓取当前用户的数据库资料并渲染到页面上
 */
function loadUserProfile() {
    if (!currentUserEmail) {
        alert("⚠️ 未检测到登录邮箱，请重新登录！");
        // 实际项目中这里可以直接 window.location.href = "login.html";
        return;
    }

    fetch(`../profile.php?action=get_profile&email=${encodeURIComponent(currentUserEmail)}`)
    .then(res => res.json())
    .then(res => {
        if (res.success) {
            const user = res.data;
            // 填入查看视图
            document.getElementById('view-name').textContent = user.username;
            document.getElementById('view-phone').textContent = user.phone;
            document.getElementById('view-email').textContent = user.email;
            document.getElementById('view-business').textContent = user.business_name;

            // 填入编辑表单
            document.getElementById('edit-name').value = user.username;
            document.getElementById('edit-phone').value = user.phone;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-business').value = user.business_name;
        } else {
            alert("加载资料失败: " + res.message);
        }
    })
    .catch(err => console.error("读取数据库个人资料出错:", err));
}

/**
 * 切换选项卡页面 (Tab Switching)
 * @param {string} tabId - 要切换到的目标选项卡ID
 */
function switchTab(tabId) {
    // 隐藏所有内容面板，并移除其 active 激活类
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    // 取消所有左侧菜单项的激活状态
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    // 显示选中的目标内容面板
    const targetTab = document.getElementById('tab-' + tabId);
    if (targetTab) targetTab.classList.add('active');
    
    // 激活对应的左侧菜单项
    const menuEl = document.getElementById('menu-' + tabId);
    if (menuEl) menuEl.classList.add('active');
    
    // 动态更新页面顶部的标题标题
    const pageTitleEl = document.getElementById('page-title');
    if (pageTitleEl) {
        if (tabId === 'help') {
            pageTitleEl.innerText = 'Help & Support';
        } else {
            pageTitleEl.innerText = tabId === 'events' ? 'Available Events' : tabId.replace('-', ' ').toUpperCase();
        }
    }

    // 💡 细节优化：如果用户切到了 profile 面板，顺手重新拉一次最新数据
    if (tabId === 'profile') {
        loadUserProfile();
    }

    if (tabId === 'my-applications') {
        loadApplications(); // 切换到该选项卡时立即拉取并渲染
    }

    // 示例：在你原本控制菜单切换的函数里加入这一行

    // ... 你原本隐藏所有面板、显示当前面板的代码 ...
    
    // ✨ 在这里加上判断：如果用户点击了活动页面，立刻去抓取数据库数据！
    if (tabId === 'available-events' || tabId === 'explore') { 
        loadAvailableEvents(); 
    }
}

// ==========================================================
// 核心功能：从后端 PHP 获取真实活动并动态渲染卡片
// ==========================================================
let allEvents = []; // 全局变量，用于缓存从数据库拿到的活动数据

function loadAvailableEvents() {
    // 1. 获取你在 HTML 里的活动网格容器
    const eventGrid = document.getElementById('event-grid');
    if (!eventGrid) {
        console.error("【🚨 错误】HTML 中找不到 id='event-grid' 的网格容器！");
        return;
    }

    // 2. 显示加载提示
    eventGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Loading available events...</p>';

    // 3. 发送请求给 src/ 目录下的 get_events.php (根据你的 Docker 根目录使用绝对路径 / )
    fetch('/get_events.php')
        .then(response => {
            if (!response.ok) throw new Error('网络请求状态异常: ' + response.status);
            return response.json();
        })
        .then(res => {
            eventGrid.innerHTML = ''; // 清空提示

            if (!res.success || !res.data || res.data.length === 0) {
                eventGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No events available at the moment.</p>';
                return;
            }

            // 缓存到全局变量中供点击详情时查询
            allEvents = res.data;

            // 4. 循环生成真实的活动卡片
            res.data.forEach(event => {
                const card = document.createElement('div');
                card.className = 'booth-card'; // 自动继承你原本完美的 CSS 样式
                card.style.cursor = 'pointer';

                // 解析日期并提取月份 (用于对应的筛选器功能)
                const dateObj = new Date(event.date);
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                card.setAttribute('data-state', event.venue || ''); 
                card.setAttribute('data-month', month);

                // 格式化日期显示形式 (例: 15 August 2026)
                const formattedDate = dateObj.toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });

                // 注入真实数据
                card.innerHTML = `
                    <h3>${event.event_name}</h3>
                    <p>📍 ${event.venue} | 📅 ${formattedDate}</p>
                `;

                // 5. 点击卡片时触发你上一关写好的 showRealEventDetail，传入真实数据库 ID
                card.onclick = () => {
                    if (typeof showRealEventDetail === 'function') {
                        showRealEventDetail(event.event_id);
                    } else if (typeof showEventDetails === 'function') {
                        showEventDetails(event.event_id); // 兼容你的旧函数名
                    }
                };

                eventGrid.appendChild(card);
            });
            console.log("🎉 数据成功从数据库渲染完成！共 " + res.data.length + " 个活动。");
        })
        .catch(error => {
            console.error('【🚨 错误】拉取数据失败:', error);
            eventGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Failed to load data. Please check F12 Console.</p>';
        });
}


/**
 * 筛选活动列表 (根据搜索关键词、州属、月份)
 */
function filterEvents() {
    const s = document.getElementById('event-search').value.toLowerCase();
    const mo = document.getElementById('month-filter').value;
    
    document.querySelectorAll('#event-grid .booth-card').forEach(c => {
        const title = c.querySelector('h3').innerText.toLowerCase();
        const state = c.getAttribute('data-state');
        const month = c.getAttribute('data-month');
        c.style.display = (title.includes(s) && (st === "" || state === st) && (mo === "" || month === mo)) ? 'block' : 'none';
    });
}

/**
 * 显示活动详细信息
 */
/**
 * 点击卡片后触发的真实详情渲染函数
 */
/**
 * 点击卡片后触发的真实详情渲染函数
 */
function showRealEventDetail(eventId) {
    // 1. 从缓存中找到对应的活动数据
    const event = allEvents.find(e => e.event_id == eventId);
    if (!event) {
        console.error("找不到该活动的数据，ID: " + eventId);
        return;
    }

    // 2. 切换到详情面板
    if (typeof switchTab === 'function') {
        switchTab('event-detail'); 
    }

    // 3. 填充详情数据
    document.getElementById('d-venue').innerText = event.venue;
    document.getElementById('d-date').innerText = event.date;
    document.getElementById('d-time').innerText = event.time;
    document.getElementById('d-desc').innerText = event.description;
    document.getElementById('d-price').innerText = event.booth_price;
    
    // 动态修改页面的 <h2> 标题为活动名称
    const titleEl = document.querySelector('#tab-event-detail h2');
    if (titleEl) titleEl.innerText = event.event_name;

    // ==========================================================
    // 💡 核心修复：强行重写“Apply Now”按钮的点击事件，把 event 传进去！
    // ==========================================================
    const applyBtn = document.querySelector('#tab-event-detail .btn-submit-event');
    if (applyBtn) {
        applyBtn.onclick = function() {
            // A. 切换到表单面板
            if (typeof switchTab === 'function') {
                switchTab('apply-form'); 
            }
            
            // B. 更改表单上方的标题（彻底告别 undefined！）
            const formTitle = document.getElementById('form-event-title');
            if (formTitle) {
                formTitle.innerText = event.event_name;
            }
            
            // C. 将真实的 event_id 记录在表单的 dataset 里
            const form = document.getElementById('application-form');
            if (form) {
                form.dataset.eventId = event.event_id;
            }

            // D. 立即加载去数据库查出来的这 10 个摊位单选框！
            loadBoothsForEvent(event.event_id);
        };
    }
}

/**
 * 切换到表单面板，并动态加载该活动的可用摊位
 */
function openApplyForm() {
    // 从 window 全局变量中拿到我们在详情页暂存的活动数据
    const event = window.currentSelectedEvent;
    
    if (!event) {
        alert("Please select an event first from the events list!");
        return;
    }

    // 1. 切换到表单面板
    if (typeof switchTab === 'function') {
        switchTab('apply-form'); 
    }
    
    // 2. 更改表单上方的标题 (完美解决 Apply: undefined 的问题)
    const formTitle = document.getElementById('form-event-title');
    if (formTitle) {
        formTitle.innerText = event.event_name;
    }
    
    // 3. 将真实的 event_id 存到表单的 dataset 里，方便提交时提取
    const form = document.getElementById('application-form');
    if (form) {
        form.dataset.eventId = event.event_id;
    }

    // 4. 触发动态加载这 10 个摊位！
    loadBoothsForEvent(event.event_id);
}

/**
 * 打开摊位申请表单
 */
function openApplyForm() {
    document.getElementById('form-event-title').innerText = window.currentEventTitle;
    switchTab('apply-form');
}

/**
 * 提交摊位申请
 */
/**
 * 提交表单申请
 */
/**
 * 提交表单申请（终极完整兼容版）
 */
/**
 * 提交表单申请（终极完整通关版）
 */
function submitApplication() {
    alert("前端JS确定百分之百跑的是新代码！！");
    // ===== 1. 获取表单容器 =====
    const form = document.getElementById('application-form');
    if (!form) {
        alert("🚨 Error: Cannot find 'application-form'!");
        return;
    }

    // ===== 2. 获取 event_id =====
    let eventId = form.dataset.eventId;
    if (!eventId && window.currentSelectedEvent) {
        eventId = window.currentSelectedEvent.event_id;
    }

    // ===== 3. 获取选中的摊位 booth_id =====
    const selectedBooth = form.querySelector('input[name="booth_id"]:checked');
    const boothId = selectedBooth ? selectedBooth.value : null;

    // ===== 4. 精准抓取文本输入框的值 =====
    // 获取申请人姓名
    const applicantNameInput = form.querySelector('input[type="text"]') || form.querySelectorAll('input')[0]; 
    const applicantName = applicantNameInput ? applicantNameInput.value.trim() : '';

    // 💡 强行穿透！直接通过 ID 现拔输入框的值，绝不使用危险的数组下标抓取
    const catInput = document.getElementById('product-category');
    const nameInput = document.getElementById('product-name');
    
    const category    = catInput ? catInput.value.trim() : '';
    const productName = nameInput ? nameInput.value.trim() : '';

    // ===== 控制台调试日志 =====
    console.log("🚀 【准备提交的数据明细】:", {
        eventId: eventId,
        boothId: boothId,
        applicantName: applicantName,
        category: category,
        productName: productName
    });

    // ===== 5. 数据完整性严格校验 =====
    if (!eventId || !boothId || !applicantName || !category || !productName) {
        alert("数据不完整，请重新选择活动、摊位，并填写所有表单内容！");
        return;
    }

    // ===== 6. 封装并构建 POST 表单数据 =====
    // 💡 核心修复：改用全新的 sendData 变量名，彻底避免与顶部原生的 formData 发生命名冲突覆盖
    const sendData = new FormData(); 
    sendData.append('action', 'submit'); // 补上后端的业务通行证
    sendData.append('event_id', eventId);
    sendData.append('booth_id', boothId);
    sendData.append('applicant_name', applicantName);
    sendData.append('product_category', category); // 确保对齐后端，不带 s
    sendData.append('product_name', productName);   // 确保对齐后端，不带 s

    const userEmail = window.currentUserEmail || localStorage.getItem("userEmail") || "";
    sendData.append('email', userEmail);

    // ===== 7. 异步发送请求给后端的 application.php =====
    fetch('/application.php', {
        method: 'POST',
        body: sendData, // 💡 核心修复：直接传标准 FormData 对象，切勿使用 .toString()，切勿手动加 Content-Type 头部
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Network error: ' + response.status);
        return response.json();
    })
    .then(res => {
        if (res.success) {
            alert("🎉 申请提交成功！请耐心等待管理员审核。");
            form.reset(); // 成功后重置清空表单
            
            // 自动跳转回申请历史列表面板
            if (typeof switchTab === 'function') {
                switchTab('my-applications');
            }
        } else {
            // 如果后端返回错误（比如捕获的事务异常或我们之前放的抓贼断点），弹窗提示真实原因
            alert("❌ 提交失败：" + res.message);
        }
    })
    .catch(error => {
        console.error("🚨 提交申请时发生错误:", error);
        alert("提交请求发生错误，请检查网络或控制台。");
    });
}
/**
 * 负责向后端拉取数据并动态渲染成表格的函数
 */
/**
 * 加载当前登录用户的申请历史记录
 */
function loadApplications() {
    // 1. 从本地存储获取当前登录用户的 Email
    const userEmail = localStorage.getItem('userEmail') || '';
    const tableBody = document.getElementById('my-apps-table-body');

    if (!tableBody) {
        console.error("【🚨 错误】找不到 id='my-apps-table-body' 的 tbody 元素，请检查你的 HTML 结构！");
        return;
    }

    if (!userEmail) {
        console.warn("【⚠️ 警报】未检测到登录用户的 Email，跳过拉取历史申请。");
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: #ff4d4f; font-weight: bold;">
                    未检测到登录状态，请重新登录后再试！
                </td>
            </tr>`;
        return;
    }

    // 2. 向后端接口发起 GET 请求
    fetch(`../application.php?email=${encodeURIComponent(userEmail)}`) 
        .then(response => {
            if (!response.ok) throw new Error('网络响应异常，状态码: ' + response.status);
            return response.json();
        })
        .then(res => {
            // 清空原本的 "Loading applications..." 提示
            tableBody.innerHTML = ''; 

            // 3. 判断后端返回的数据是否有效且不为空
            if (!res.success || !res.data || res.data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 30px; color: #888;">
                            No applications found.
                        </td>
                    </tr>`;
                return;
            }

            // 4. 循环遍历渲染数据
            res.data.forEach(app => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = "1px solid #f2f2f2";
                tr.style.fontSize = "14px";
                tr.style.color = "#333";
                tr.style.transition = "background-color 0.2s";
                
                // 悬停动效
                tr.onmouseover = () => { tr.style.backgroundColor = "#fcfcfc"; };
                tr.onmouseout = () => { tr.style.backgroundColor = "transparent"; };

                // 💡 【修复核心】统一转为小写处理，完美兼容数据库中的 'approved' 或 'Pending'
                const statusLower = (app.status || '').toLowerCase();
                let badgeBg = '#fff3cd';   // 默认 Pending (黄色)
                let badgeColor = '#856404';
                
                if (statusLower === 'approved' || statusLower === 'success') {
                    badgeBg = '#d1e7dd';   // 绿色
                    badgeColor = '#0f5132';
                } else if (statusLower === 'cancelled' || statusLower === 'rejected') {
                    badgeBg = '#f8d7da';   // 红色
                    badgeColor = '#721c24';
                }

                // 💡 【修复核心】防止 booth_number 字段为 null 时导致前端显示异常
                const boothDisplay = app.booth_number || app.booth_id || 'N/A';

                tr.innerHTML = `
                    <td style="padding: 15px 8px; font-weight: bold; color: #555;">#${app.application_id}</td>
                    <td style="padding: 15px 8px; font-weight: 500;">${escapeHtml(app.event_name || 'Event #' + (app.event_id || ''))}</td>
                    <td style="padding: 15px 8px;"><span style="background: #eef2f7; padding: 3px 8px; border-radius: 4px; font-size: 13px;">No. ${escapeHtml(boothDisplay)}</span></td>
                    <td style="padding: 15px 8px; color: #666;">${escapeHtml(app.product_category || 'General')}</td>
                    <td style="padding: 15px 8px; color: #666;">${escapeHtml(app.product_name || 'N/A')}</td>
                    <td style="padding: 15px 8px; text-align: center;">
                        <span style="padding: 5px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; background-color: ${badgeBg}; color: ${badgeColor};">
                            ${app.status.toUpperCase()}
                        </span>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('【🚨 拉取申请历史失败】', error);
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 30px; color: #ff4d4f;">
                            数据加载失败，请检查网络或联系管理员。
                        </td>
                    </tr>`;
            }
        });
}

/**
 * 简单防 XSS 注入的辅助函数
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * 💡 提示：请确保你的 Tab 切换逻辑中触发了该函数
 * 例如：
 * function switchTab(tabId) {
 *     // 其他显示隐藏逻辑...
 *     if (tabId === 'my-applications') {
 *         loadApplications();
 *     }
 * }
 */

/**
 * 取消申请事件
 */
function cancelApplication(element) {
    const card = element.closest('.booth-card');
    if (!card) return;
    const statusSpan = card.querySelector('.status-text');
    if (statusSpan) {
        statusSpan.innerText = 'Cancelled';
        statusSpan.style.color = 'red';
    }
    element.style.display = 'none';
}

/**
 * 切换个人资料的“查看”模式与“编辑”模式
 */
function toggleEdit() {
    const viewDiv = document.getElementById('profile-view');
    const editForm = document.getElementById('profile-edit-form');
    const btn = document.getElementById('edit-btn');

    if (!viewDiv || !editForm) return;

    if (editForm.style.display === 'none' || editForm.style.display === '') {
        viewDiv.style.display = 'none';
        editForm.style.display = 'block';
        if (btn) btn.textContent = '✖'; 
    } else {
        viewDiv.style.display = 'block';
        editForm.style.display = 'none';
        if (btn) btn.textContent = '✏️'; 
    }
}

/**
 * 保存修改后的个人资料并直接异步推送到 PHP MySQL 数据库
 */
function saveProfile() {
    if (!currentUserEmail) {
        alert("⚠️ 无法保存，未识别到您的登录邮箱！");
        return;
    }

    const newName = document.getElementById('edit-name').value.trim();
    const newPhone = document.getElementById('edit-phone').value.trim();
    const newBusiness = document.getElementById('edit-business').value.trim();

    const bodyParams = new URLSearchParams();
    bodyParams.append('action', 'update_profile');
    bodyParams.append('old_email', currentUserEmail); 
    bodyParams.append('username', newName);
    bodyParams.append('phone', newPhone);
    bodyParams.append('business_name', newBusiness);

    fetch('../profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString()
    })
    .then(res => res.json())
    .then(res => {
        alert(res.message);
        if (res.success) {
            loadUserProfile(); 
            toggleEdit();      
        }
    })
    .catch(err => alert("保存失败: " + err));
}

/**
 * 登出系统
 */
function logout() {
    localStorage.removeItem("userEmail"); 
    window.location.href = window.location.origin + "/src/index.html";
}

/* ========================================================== */
/* Help & Support 模块专用的逻辑函数                           */
/* ========================================================== */

/**
 * 机器人常见问题自动回复逻辑 (Robot Reply)
 */
function robotReply(type) {
    const responseBox = document.getElementById('robot-response-box');
    const robotText = document.getElementById('robot-text');
    if (!responseBox || !robotText) return;

    let answer = "";
    if (type === 'how_to_apply') {
        answer = "To apply for a booth, go to the 'Events' tab, click on any active event, click 'Apply Now', choose your booth and fill up the form!";
    } else if (type === 'refund_policy') {
        answer = "Cancellations made 7 days prior to the event are eligible for a 50% refund. No refunds will be given for last-minute cancellations.";
    } else if (type === 'payment') {
        answer = "Currently, we accept Bank Transfer and E-wallets (Touch 'n Go). Payment details will be sent via email once admin approves your application.";
    }
    
    robotText.innerText = answer;
    responseBox.style.display = "block";
}

/**
 * 留言给管理员的逻辑 (Message Admin)
 */
function sendMessageToAdmin() {
    const subjectInput = document.getElementById('msg-subject');
    const contentInput = document.getElementById('msg-content');
    
    if (!subjectInput || !contentInput) {
        alert("错误：找不到输入框，请检查 HTML 的 id 是否为 msg-subject 和 msg-content！");
        return;
    }

    const subject = subjectInput.value.trim();
    const content = contentInput.value.trim();

    if (!subject || !content) {
        alert('Please fill in all fields!');
        return;
    }

    const bodyParams = new URLSearchParams();
    bodyParams.append('email', currentUserEmail || '');
    bodyParams.append('subject', subject);
    bodyParams.append('content', content);

    fetch('../message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString()
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); 
        if (data.success) {
            const form = document.getElementById('admin-message-form');
            if (form) form.reset();
            renderUserMessageHistory();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('无法连接到后端 message.php，请检查文件是否存在！');
    });
}

/**
 * 读取并渲染当前用户的留言历史与 Admin 的回复
 */
function renderUserMessageHistory() {
    const historyGrid = document.getElementById('user-message-history-grid');
    if (!historyGrid) return;

    const emailParam = currentUserEmail ? `?email=${encodeURIComponent(currentUserEmail)}` : '';

    fetch(`../message.php${emailParam}`)
    .then(response => response.json())
    .then(allMessages => {
        historyGrid.innerHTML = '';

        if (!allMessages || allMessages.length === 0) {
            historyGrid.innerHTML = `<p id="no-history-text" style="color: #94a3b8; font-style: italic; font-size: 0.9rem;">No message history found.</p>`;
            return;
        }

        allMessages.forEach(msg => {
            const historyCard = document.createElement('div');
            historyCard.style.cssText = "background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px;";

            let replyHtml = '';
            if (msg.reply) {
                replyHtml = `
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: 4px; margin-top: 5px;">
                        <p style="margin: 0; font-size: 0.9rem; color: #166534;">
                            <strong>↪ Admin Reply:</strong> ${msg.reply}
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

            historyCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #334155; font-size: 0.95rem;">Subject: ${msg.subject}</strong>
                    <span style="font-size: 0.8rem; color: #94a3b8;">${msg.created_at || ''}</span>
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: #64748b; line-height: 1.4; background: white; padding: 8px; border-radius: 4px; border: 1px solid #f1f5f9;">
                    ${msg.content}
                </p>
                ${replyHtml}
            `;

            historyGrid.insertBefore(historyCard, historyGrid.firstChild);
        });
    })
    .catch(error => {
        console.error('Fetch history error:', error);
    });
}

/**
 * 根据活动 ID 动态拉取该活动下“可用”的摊位，并渲染单选框
 */
/**
 * 根据活动 ID 动态获取该活动下“可用(availability=1)”的摊位并渲染成单选框
 */
/**
 * 根据 eventId 去后端接口获取属于该活动的所有可用摊位，并渲染成单选框 (Radio buttons)
 */
function loadBoothsForEvent(eventId) {
    const container = document.getElementById('booth-options-container');
    if (!container) {
        console.error("找不到 id='booth-options-container' 的容器！");
        return;
    }

    // 1. 显示加载中
    container.innerHTML = '<p style="color:#888; font-size:14px;">Loading booths...</p>';

    // 2. 发送请求给后端的 get_booths.php 接口
    fetch(`/get_booths.php?event_id=${eventId}`)
        .then(response => {
            if (!response.ok) throw new Error('Network error: ' + response.status);
            return response.json();
        })
        .then(res => {
            container.innerHTML = ''; // 清空加载提示

            // 3. 过滤出可用的摊位 (根据你数据库的设计，如果是 1 代表可用，或者 'Available' 代表可用)
            // 💡 这里我们做兼容：只要 availability 是 '1'、1 或 'Available' 就算作可用
            const availableBooths = res.success && res.data 
                ? res.data.filter(b => b.availability == '1' || b.availability.toLowerCase() === 'available')
                : [];

            if (availableBooths.length === 0) {
                container.innerHTML = '<p style="color:red; font-size:14px;">⚠️ No available booths for this event.</p>';
                return;
            }

            // 4. 循环生成单选框 (Radio Buttons)
            availableBooths.forEach(booth => {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.margin = '8px 0';
                label.style.cursor = 'pointer';

                label.innerHTML = `
                    <input type="radio" name="booth_id" value="${booth.booth_id}" required style="margin-right: 8px;">
                    <span>Booth ${booth.booth_number}</span>
                `;
                container.appendChild(label);
            });
        })
        .catch(error => {
            console.error('获取摊位失败:', error);
            container.innerHTML = '<p style="color:red; font-size:14px;">Failed to load booths.</p>';
        });
}

