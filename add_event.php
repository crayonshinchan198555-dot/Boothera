<?php
// add_event.php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");

// 1. 引入你现有的数据库连接，不用重复写连接代码了
require_once 'db.php'; 

if (!isset($conn)) {
    echo json_encode(["success" => false, "message" => "数据库连接变量未找到"]);
    exit;
}

// 2. 接收前端的文本数据（对齐你的前端 html name 属性）
$event_name  = $_POST['event_name'] ?? '';
$venue       = $_POST['venue'] ?? '';
$date        = $_POST['date'] ?? '';
$time        = $_POST['time'] ?? '';
$booth_price = floatval($_POST['booth_price'] ?? 0);
$booths      = intval($_POST['total_booths'] ?? 0);
$description = $_POST['description'] ?? '';

// 基础验证
if (empty($event_name) || empty($venue)) {
    echo json_encode(["success" => false, "message" => "活动名称和场地不能为空。"]);
    exit;
}

// 3. 将数据插入到你原有的数据库表（对齐你的真实字段）
// 假定当前操作的管理员用户 ID 为 1
$user_id = 1; 

// 在 SQL 里重新把 user_id 加进去
$sql = "INSERT INTO Events (event_name, venue, date, time, description, booth_price, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

// 注意这里的参数类型变化：多加了一个整数类型的 i
$stmt->bind_param("sssssdi", $event_name, $venue, $date, $time, $description, $booth_price, $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Event added successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "SQL execution failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>