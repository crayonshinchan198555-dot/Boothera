<?php
// get_events.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; 

// 1. 获取前端传过来的 state 参数 (如果没有传，默认为 'All States')
$state = $_GET['state'] ?? 'All States';

// 2. 构建基础 SQL
$sql = "SELECT * FROM Events";

// 3. 核心：如果不是 'All States'，就根据 venue 字段进行模糊匹配
if ($state !== 'All States') {
    // 防止 SQL 注入，使用 mysqli_real_escape_string
    $safe_state = $conn->real_escape_string($state);
    $sql .= " WHERE venue LIKE '%$safe_state%'";
}

$sql .= " ORDER BY event_id DESC";

$result = $conn->query($sql);

$events = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
    echo json_encode(["success" => true, "data" => $events]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}
$conn->close();
?>