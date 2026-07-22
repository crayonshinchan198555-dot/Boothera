<?php
session_start();

// 1. 先进行极其严格的检查
$isLoggedIn = isset($_SESSION['user_id']);
$hasRole = isset($_SESSION['userRole']) && trim($_SESSION['userRole']) == 'admin';

// 2. 如果不满足条件，才弹窗并跳转
if (!$isLoggedIn || !$hasRole) {
    echo "<script>alert('Please sign in first!'); window.location.href='/index.html';</script>";
    exit();
}

// 3. 只有成功通过上面的检查，才会执行下面的页面代码
?>

 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boothera - Admin Dashboard</title>
    <!-- 引入外部样式表 -->
    <link rel="stylesheet" href="home.css">
</head>
<body>

    <div class="container">
        <!-- ========================================== -->
        <!-- 左侧导航栏 (Sidebar)                        -->
        <!-- ========================================== -->
        <aside class="sidebar">
            <!-- 标志区域 (Logo Section) -->
            <div class="logo-section">
                <div class="logo-container">
                    <!-- SVG 山峰标志 -->
                    <svg class="logo-mountain" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="20,50 40,20 60,50" fill="#4F6D7A"/>
                        <polygon points="45,50 60,28 75,50" fill="#7C94A1"/>
                    </svg>
                    <!-- 品牌文本 -->
                    <span class="brand-text">BOOTHERA</span>
                </div>
                <p class="subtitle">Booth System</p>
            </div>
            
            <!-- 菜单导航区 (Navigation Menu) -->
            <nav class="menu">
                <!-- 活动管理菜单 -->
                <a href="#" class="menu-item active" id="menu-events" onclick="switchTab('events')">
                    <span class="icon">🎟️</span> Events
                </a>
                <!-- 申请审批菜单 -->
                <a href="#" class="menu-item" id="menu-application" onclick="switchTab('application')">
                    <span class="icon">📝</span> Application
                </a>
                <!-- 添增活动菜单 -->
                <a href="#" class="menu-item" id="menu-add-event" onclick="switchTab('add-event')">
                    <span class="icon">➕</span> Add Event
                </a>
                
                <!-- 用户留言接收菜单 -->
                <a href="#" class="menu-item" id="menu-messages" onclick="switchTab('messages')">
                    <span class="icon">✉️</span> Messages
                </a>
            </nav>

            <!-- 右侧主内容区域（这里是你原本放别的内容的地方） -->
<div class="main-content">

    <!-- 1. 你原本可能有的 Events 区域 -->
    <div id="events-section" class="tab-content">
        <!-- 你的活动管理内容 -->
    </div>

    <!-- 2. 新增：Application 审批区域 -->
    <div id="application-section" class="tab-content" style="display: none; padding: 20px;">
        <!-- 这里用来动态渲染表格 -->
    </div>

</div>

            <!-- 侧边栏底部：登出按钮 -->
            <div class="sidebar-footer">
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
        </aside>

        <!-- ========================================== -->
        <!-- 右侧主体内容区 (Main Content)               -->
        <!-- ========================================== -->
        <main class="main-content">
            <!-- 顶部状态工具栏 -->
            <header class="top-bar">
                <h1 id="page-title">Events Management</h1>
                
                <div class="top-right-actions">
                    <!-- 搜索与状态过滤框 -->
                    <div class="search-filter-box">
                        <input type="text" id="global-search" placeholder="Search events..." oninput="handleSearch()">
                        <select id="global-filter" onchange="handleFilterChange()">
                            <option value="all">All Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="denied">Denied</option>
                        </select>
                    </div>
                    
                    <!-- 当前登录角色信息 -->
                    <div class="user-profile">
                        <span>Admin</span>
                    </div>
                </div>
            </header>

            <!-- 页面内容主体包裹容器 -->
            <section class="content-body">
                
                <!-- ------------------------------------------ -->
                <!-- 选项卡 1：活动管理面板 (Events Management)   -->
                <!-- ------------------------------------------ -->
                <div id="tab-events" class="tab-panel active">
                    <!-- 动态渲染容器 -->
                    <div class="card-grid" id="events-grid"></div>
                </div>

                <!-- ------------------------------------------ -->
                <!-- 选项卡 2：活动详情查看与管理 (Event Details) -->
                <!-- ------------------------------------------ -->
                <div id="tab-event-details" class="tab-panel">
                    <button class="btn-back" onclick="switchTab('events')">⬅️ Back to Events</button>
                    
                    <div class="detail-container">
                        <!-- 详情左侧：基础信息显示 -->
                        <div class="detail-info-section">
                            <h2 id="detail-title">Event Title</h2>
                            
                            <div class="info-group">
                                <label>Venue</label>
                                <p id="detail-venue">Location</p>
                            </div>
                            <div class="info-group">
                                <label>Date</label>
                                <p id="detail-date">Date</p>
                            </div>
                            <div class="info-group">
                                <label>Time</label>
                                <p id="detail-time">Time</p>
                            </div>
                            <div class="info-group">
                                <label>Description</label>
                                <p id="detail-desc">Details...</p>
                            </div>
                            <div class="info-group">
                                <label>Rental Price</label>
                                <p class="price-tag" id="detail-price">RM0/day</p>
                            </div>
                            <div class="info-group">
                                <label>Total Booths Available</label>
                                <p id="detail-booths">0</p> 
                            </div>
                            
                        </div>

                        <!-- 详情右侧：操作控制台 -->
                        <div class="detail-booth-section">
                            <h3>Manage Event</h3>
                            <div class="admin-manage-actions" style="margin-top: 20px; flex-direction: column;">
                                <button class="btn-edit" onclick="editEvent()">Edit Event</button>
                                <button class="btn-delete" onclick="deleteEvent()">Delete Event</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ------------------------------------------ -->
                <!-- 选项卡 3：审核申请面板 (Application Tab)    -->
                <!-- ------------------------------------------ -->
<div id="tab-application" class="tab-panel">
    <!-- 结构 -->
    <div class="table-responsive" style="padding: 20px;">
        <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <th style="padding: 12px;">App ID</th>
                    <th style="padding: 12px;">User ID</th>
                    <th style="padding: 12px;">Event ID</th>
                    <th style="padding: 12px;">Booth ID</th>
                    <th style="padding: 12px;">Product Category</th>
                    <th style="padding: 12px;">Product Name</th>
                    <th style="padding: 12px;">Status</th>
                    <th style="padding: 12px;">Actions</th>
                </tr>
            </thead>
            <tbody id="applications-table-body">
                <!-- 留给 home.js 用 fetch 拿回数据后，通过 innerHTML 动态写入 <tr> 行 -->
            </tbody>
        </table>
    </div>
</div>

                <!-- ------------------------------------------ -->
                <!-- 选项卡 4：发布新活动面板 (Add Event Tab)    -->
                <!-- ------------------------------------------ -->
                <div id="tab-add-event" class="tab-panel">
                    <div class="add-event-container">
                        <h3>➕ Create New Event</h3>
                        <form id="add-event-form" enctype="multipart/form-data">
                            <div class="form-group">
                                <label>Event Title</label>
                                <!-- 加上 name="event_name" -->
                                <input type="text" id="add-input-title" name="event_name" required placeholder="e.g. Summer Festival">
                            </div>
                            
                            <div class="form-group">
                                <label>Venue</label>
                                <!-- 加上 name="venue" -->
                                <input type="text" id="add-input-venue" name="venue" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Date</label>
                                <!-- 加上 name="date"，建议顺便把 type="text" 改为 type="date" 体验更好 -->
                                <input type="date" id="add-input-date" name="date" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Time</label>
                                <!-- 加上 name="time"，建议顺便把 type="text" 改为 type="time" 体验更好 -->
                                <input type="time" id="add-input-time" name="time" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Rental Price</label>
                                <!-- 加上 name="booth_price"，建议顺便把 type="text" 改为 type="number" step="0.01" -->
                                <input type="number" step="0.01" id="add-input-price" name="booth_price" required placeholder="e.g. 200">
                            </div>
                            
                            <div class="form-group">
                                <label>Total Booths Available</label>
                                <!-- 加上 name="total_booths" -->
                                <input type="number" id="add-input-booths" name="total_booths" required min="1" placeholder="e.g. 50">
                            </div>
                            
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label>Description</label>
                                <!-- 加上 name="description" -->
                                <textarea id="add-input-desc" name="description" rows="3" required placeholder="Event details..."></textarea>
                            </div>

                            <!-- 补上发布按钮 -->
                            <div style="margin-top: 25px;">
                                <button type="submit" style="width: 100%; padding: 14px; background: #8ba2b5; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; transition: background 0.2s;">
                                    🚀 Publish Event
                                </button>
                            </div>
                        </form>
                    </div> <!-- 👈 close .add-event-container -->
                </div>

                <!-- ------------------------------------------ -->
                <!-- 选项卡 5：用户留言板面板 (Messages Tab)       -->
                <!-- ------------------------------------------ -->
                <div id="tab-messages" class="tab-panel">
                    <div class="card-grid" id="admin-messages-grid"></div>
                </div>

                <!-- ========================================== -->
                <!-- 弹出层：编辑活动模态框 (Edit Event Modal)     -->
                <!-- ========================================== -->
                <div id="edit-modal" class="modal-overlay">
                    <div class="modal-content-box">
                        <div class="modal-header">
                            <h3>✏️ Edit Event Details</h3>
                            <span class="close-modal-btn" onclick="closeEditModal()">&times;</span>
                        </div>
                        <form id="edit-event-form" onsubmit="saveEventChanges(event)">
                            <!-- 🔑 隐藏域：保存当前编辑的活动 ID，供 JS 提交使用 -->
                            <input type="hidden" id="edit-event-id">

                            <div class="form-group">
                                <label>Event Title</label>
                                <input type="text" id="edit-input-title" required readonly style="background: #f1f5f9; color: #64748b;">
                            </div>
                            <div class="form-group">
                                <label>Venue</label>
                                <input type="text" id="edit-input-venue" required>
                            </div>
                            <div class="form-group">
                                <label>Date</label>
                                <input type="text" id="edit-input-date" required>
                            </div>
                            <div class="form-group">
                                <label>Time</label>
                                <input type="text" id="edit-input-time" required>
                            </div>
                            <div class="form-group">
                                <label>Rental Price</label>
                                <input type="text" id="edit-input-price" required>
                            </div>
                            <div class="form-group">
                                <label>Total Booths Available</label>
                                <input type="number" id="edit-input-booths" required min="1">
                            </div>
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label>Description</label>
                                <textarea id="edit-input-desc" rows="3" required></textarea>
                            </div>
                            <div class="modal-footer-actions">
                                <button type="button" class="btn-cancel" onclick="closeEditModal()">Cancel</button>
                                <button type="submit" class="btn-save-submit">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>

            </section>
        </main>
    </div>
    <script src="/adminpages/home.js"></script>
</body>
</html>