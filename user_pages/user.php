<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../login.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Boothera User Dashboard</title>
    <!-- 引入外部样式表 -->
    <link rel="stylesheet" href="user.css">
</head>
<body>
    <div class="container">
        <!-- ========================================== -->
        <!-- 左侧导航栏 (Sidebar)                        -->
        <!-- ========================================== -->
        <div class="sidebar">
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
            </div>
            
            <!-- 菜单选项区 (Menu) -->
            <div class="menu">
                <!-- 活动列表选项 -->
                <a href="javascript:void(0);" class="menu-item active" id="menu-events" onclick="switchTab('events'); return false;">Events</a>
                <!-- 我的申请选项 -->
                <a href="javascript:void(0);" class="menu-item" id="menu-my-applications" onclick="switchTab('my-applications'); return false;">My Applications</a>
                <!-- 个人资料选项 -->
                <a href="javascript:void(0);" class="menu-item" id="menu-profile" onclick="switchTab('profile'); return false;">Profile</a>
                
                <!-- 【新增加的功能】: 帮助与支持选项 -->
                <a href="javascript:void(0);" class="menu-item" id="menu-help" onclick="switchTab('help'); return false;">Help & Support</a>
            </div>
            
            <!-- 侧边栏底部：登出按钮 -->
            <div class="sidebar-footer">
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- 右侧主体内容区 (Main Content)               -->
        <!-- ========================================== -->
        <div class="main-content">
            <!-- 顶部标题栏，会根据切换的页面动态改变文本 -->
            <div class="top-bar"><h1 id="page-title">Available Events</h1></div>
            
            <div class="content-body">
                
                <!-- ------------------------------------------ -->
                <!-- 选项卡 1：活动列表面板 (Events Tab)          -->
                <!-- ------------------------------------------ -->
                <div id="tab-events" class="tab-panel active">
                    <!-- 搜索与筛选工具栏 -->
                    <div class="search-filter-box">
                        <!-- 关键词输入框 -->
                        <input type="text" id="event-search" class="search-input" placeholder="Search events..." onkeyup="filterEvents()">
                        
                        <!-- 月份筛选下拉框 -->
                        <select id="month-filter" class="filter-select" onchange="filterEvents()">
                            <option value="">All Months</option>
                            <option value="01">January</option>
                            <option value="02">February</option>
                            <option value="03">March</option>
                            <option value="04">April</option>
                            <option value="05">May</option>
                            <option value="06">June</option>
                            <option value="07">July</option>
                            <option value="08">August</option>
                            <option value="09">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>
                    
                    <!-- 活动卡片网格布局容器 -->
                    <div class="card-grid" id="event-grid">
        
                    </div>
                </div>

                <!-- ------------------------------------------ -->
                <!-- 选项卡 2：活动详情面板 (Event Detail Tab)    -->
                <!-- ------------------------------------------ -->
                <div id="tab-event-detail" class="tab-panel">
                    <!-- 返回活动列表按钮 -->
                    <button onclick="switchTab('events')" class="btn-back">← Back to Events</button>
                    <!-- 详情卡片 -->
                    <div class="booth-card">
                        <h2 id="d-title">Event Title</h2>
                        <p><strong>Venue:</strong> <span id="d-venue"></span></p>
                        <p><strong>Date:</strong> <span id="d-date"></span></p>
                        <p><strong>Time:</strong> <span id="d-time"></span></p>
                        <p><strong>Description:</strong> <span id="d-desc"></span></p>
                        <p><strong>Rental Price:</strong> <span id="d-price" style="font-weight:bold;"></span></p>
                        
                        <button class="btn-submit-event" style="width: 100%; padding: 15px; margin-top:20px;" onclick="openApplyForm()">Apply Now</button>
                    </div>
                </div>

                <!-- ------------------------------------------ -->
                <!-- 选项卡 3：摊位申请表单 (Apply Form Tab)     -->
                <!-- ------------------------------------------ -->
                <div id="tab-apply-form" class="tab-panel">
                    <!-- 返回详情页按钮 -->
                    <button onclick="switchTab('event-detail')" class="btn-back">← Back to Details</button>
                    <!-- 表单卡片 -->
                    <div class="booth-card">
                        <h2><span id="form-event-title"></span></h2>
                        <form id="application-form" onsubmit="event.preventDefault(); submitApplication();">
                            <!-- 摊位选择 (单选按钮) -->
                            <p><strong>Select Booth:</strong></p>
                            <div id="booth-container"></div>

                            <!-- 申请人姓名 -->
                            <p><strong>Applicant Name:</strong></p>
                            <input type="text" id="applicant-name" class="search-input" style="width:100%;" required>
                            
                            <!-- 产品类别 -->
                            <p><strong>Products Category:</strong></p>
                            <input type="text" id="prod-cat" class="search-input" style="width:100%;" required>
                            
                            <!-- 产品名称 -->
                            <p><strong>Products Name:</strong></p>
                            <input type="text" id="prod-name" class="search-input" style="width:100%;" required>
                            
                            <!-- 提交申请按钮 -->
                            <button type="submit" class="btn-submit-event" style="width:100%; margin-top:20px;">Submit</button>
                        </form>
                    </div>
                </div>

                <!-- ------------------------------------------ -->
                <!-- 选项卡 4：我的申请面板 (My Applications Tab) -->
                <!-- ------------------------------------------ -->
               <!-- 原来的 <p>My Applications</p> 替换为下方的表格 -->
<div class="tab-panel" id="tab-my-applications">
    <h2>My Applications</h2>
    <table id="application-history-table">
        <thead>
            <tr>
                <th>Event</th>
                <th>Booth</th>
                <th>Category</th>
                <th>Product</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody id="app-history-body">
            <!-- JS 会把数据插到这里 -->
        </tbody>
    </table>
</div>

                <!-- ------------------------------------------ -->
                <!-- 选项卡 5：个人资料面板 (Profile Tab)         -->
                <!-- ------------------------------------------ -->
                <div id="tab-profile" class="tab-panel">
                    <div class="booth-card" style="position: relative;"></div>
                    <!-- 编辑个人资料的触发按钮 -->
                    <!-- 直接替换你原有的那行图标代码 -->
                    <button type="button" id="edit-btn" onclick="toggleEdit()" style="cursor: pointer; background: transparent; border: none; font-size: 20px;">
                        ✏️
                    </button>
                    <h2>Profile Details</h2>
                    
                    <!-- 个人资料查看状态区域 -->
                    <div id="profile-view">
                        <p><strong>Name:</strong> <span id="view-name"></span></p>
                        <p><strong>Phone number:</strong> <span id="view-phone"></span></p>
                        <p><strong>E-mail:</strong> <span id="view-email"></span></p>
                        <p><strong>Business name:</strong> <span id="view-business"></span></p>    
                    </div>

                    <div id="profile-edit-form" style="display: none;">
                        <p><strong>Name:</strong> <input type="text" id="edit-name"></p>
                        <p><strong>Phone:</strong> <input type="text" id="edit-phone"></p>
                        <p><strong>E-mail:</strong> <input type="email" id="edit-email"></p>
                        <p><strong>Business:</strong> <input type="text" id="edit-business"></p>
                        <button onclick="saveProfile()">Save</button>
                        <button onclick="toggleEdit()">Cancel</button>
                    </div>
                    
                </div>

                <!-- ------------------------------------------ -->
                <!-- 【新增加】选项卡 6：客服与留言面板 (Help Tab)  -->
                <!-- ------------------------------------------ -->
                <div id="tab-help" class="tab-panel">
                    <h2>Help & Support</h2>
                    
                    <!-- 采用双列响应式网格，让机器人 FAQ 和 联络管理员 左右对齐并排 -->
                    <div class="card-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 1000px;">
                        
                        <!-- 区域 A：机器人 FAQ 自动回复 (Robot Reply) -->
                        <div class="booth-card" style="margin: 0;">
                            <h3>🤖 Robot FAQ</h3>
                            <p style="color: #666; font-size: 0.9rem; margin-bottom: 15px;">Click on a question to get an instant answer:</p>
                            
                            <!-- 常见问题快捷点击按钮组 -->
                            <div class="faq-buttons" style="display: flex; flex-direction: column; gap: 10px;">
                                <button type="button" class="btn-submit-event" style="background-color: #f0f4f8; color: #333; border: 1px solid #ccc; padding: 10px; margin: 0; text-align: left;" onclick="robotReply('how_to_apply')">❓ How do I apply for a booth?</button>
                                <button type="button" class="btn-submit-event" style="background-color: #f0f4f8; color: #333; border: 1px solid #ccc; padding: 10px; margin: 0; text-align: left;" onclick="robotReply('refund_policy')">❓ What is the refund policy?</button>
                                <button type="button" class="btn-submit-event" style="background-color: #f0f4f8; color: #333; border: 1px solid #ccc; padding: 10px; margin: 0; text-align: left;" onclick="robotReply('payment')">❓ How to make payment?</button>
                            </div>
                            
                            <!-- 机器人回复结果展示框 (默认隐藏，点击问题后显示) -->
                            <div id="robot-response-box" style="margin-top: 20px; padding: 15px; background: #eef7f9; border-left: 4px solid #4F6D7A; border-radius: 4px; display: none;">
                                <strong>Robot:</strong> <span id="robot-text"></span>
                            </div>
                        </div>

                        <!-- 区域 B：给管理员发信息/留言 (Message Admin) -->
                        <div class="booth-card" style="margin: 0;">
                            <h3>✉️ Message Admin</h3>
                            <form id="admin-message-form" onsubmit="event.preventDefault(); sendMessageToAdmin();">
                                <!-- 留言主题 -->
                                <p><strong>Subject:</strong></p>
                                <input type="text" id="msg-subject" class="search-input" style="width:100%;" placeholder="e.g., Booth Query" required>
                                
                                <!-- 留言内容输入框 -->
                                <p><strong>Your Message:</strong></p>
                                <textarea id="msg-content" class="search-input" style="width:100%; height: 100px; font-family: inherit; padding: 10px; box-sizing: border-box;" placeholder="Type your message here..." required></textarea>
                                
                                <!-- 提交给管理员的按钮 -->
                                <button type="submit" class="btn-submit-event" style="width:100%; margin-top:20px;">Send Message</button>
                            </form>
                        </div>
                        <!-- 现有的 Message Admin 卡片下方，追加这个历史记录卡片 -->
                        <div class="booth-card" style="margin-top: 20px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <h3 style="margin-top: 0; color: #4F6D7A; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                                ✉️ Message History & Replies
                            </h3>
    
                            <!-- JS 会把读取到的留言和回复动态画在下面这个 grid 盒子里 -->
                            <div id="user-message-history-grid" style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">
                                <!-- 如果没有留言，默认显示一句赞美诗般的提示 -->
                                <p id="no-history-text" style="color: #94a3b8; font-style: italic; font-size: 0.9rem;">No message history found.</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </div>
    <!-- 引入外部逻辑脚本 -->
    <script src="./user.js"></script>
</body>
</html>