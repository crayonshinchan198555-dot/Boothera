<?php
ini_set('session.cookie_path', '/');
session_start();

// 强制开启输出缓冲，防止任何意外输出破坏 JSON
ob_start(); 

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php'; 
// 注意：如果 db.php 里面已经连接了数据库，这里不要再 new mysqli(...) 了！
// 检查 db.php，如果里面已经有了 $conn，直接用就行。

// ==========================================
// 剩余逻辑...
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) { 
    ob_clean();
    die(json_encode(["success" => false, "message" => "Database connection failed"])); 
}

// 兼容前端的两种接收方式
$action = $_POST['action'] ?? $_GET['action'] ?? '';
$email = $_POST['email'] ?? $_GET['email'] ?? '';

// 💡 自动兜底：如果 Session 里没有 user_id，但是前端传了 email，查出 user_id
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id && !empty($email)) {
    $email_clean = mysqli_real_escape_string($conn, $email);
    $u_res = $conn->query("SELECT user_id FROM Users WHERE `e-mail` = '$email_clean' LIMIT 1");
    if ($u_res && $row = $u_res->fetch_assoc()) {
        $user_id = $row['user_id'];
    }
}

// =========================================================================
// 🚀 核心精准路由分发 (采用明确的 action 匹配，彻底杜绝模糊 POST 拦截)
// =========================================================================

// 【动作 A】管理员提交回复
if ($action === 'admin_reply') {
    $m_id = mysqli_real_escape_string($conn, $_POST['m_id'] ?? $_POST['message_id'] ?? '');
    $reply = mysqli_real_escape_string($conn, $_POST['reply'] ?? '');
    
    if (empty($m_id)) {
        ob_clean();
        die(json_encode(["success" => false, "message" => "Missing message ID (message_id)"]));
    }
    
    $sql = "UPDATE Message SET reply = '$reply' WHERE m_id = '$m_id'";
    
    ob_clean(); 
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "🎉 Reply submitted successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "❌ Reply failed: " . $conn->error]);
    }
    exit;
}

// 【动作 B】管理员获取所有留言
unset($messages); // 规避变量污染
if ($action === 'admin_get_all') {
    $sql = "SELECT m.*, u.name as username FROM Message m JOIN Users u ON m.user_id = u.user_id ORDER BY m.created_at DESC";
    $result = $conn->query($sql);
    $messages = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) { $messages[] = $row; }
    }
    ob_clean();
    echo json_encode(["success" => true, "messages" => $messages]);
    exit;
}

// 【动作 C】用户发送留言
if ($action === 'send_message' || (empty($action) && $_SERVER['REQUEST_METHOD'] === 'POST')) {
    if (!$user_id) { 
        ob_clean();
        die(json_encode(["success" => false, "message" => "Please login first (User ID not found)"])); 
    }
    
    $subject = mysqli_real_escape_string($conn, $_POST['subject'] ?? '');
    $content = mysqli_real_escape_string($conn, $_POST['content'] ?? '');
    
    if (empty($subject) || empty($content)) {
        ob_clean();
        die(json_encode(["success" => false, "message" => "Subject and content cannot be empty"]));
    }
    
    $sql = "INSERT INTO Message (user_id, subject, content) VALUES ('$user_id', '$subject', '$content')";
    ob_clean();
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "🎉 Message sent successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "❌ Failed to send: " . $conn->error]);
    }
    exit;
}

// 【动作 D】用户获取自己的留言历史 (兜底防崩策略)
if ($action === 'user_get_history' || $_SERVER['REQUEST_METHOD'] === 'GET' || empty($action)) {
    if (!$user_id) { 
        ob_clean();
        echo json_encode([]); 
        exit;
    }
    
    $sql = "SELECT * FROM Message WHERE user_id = '$user_id' ORDER BY created_at DESC";
    $result = $conn->query($sql);
    $messages = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) { $messages[] = $row; }
    }
    
    ob_clean();
    echo json_encode($messages);
    exit;
}

$conn->close();
?>