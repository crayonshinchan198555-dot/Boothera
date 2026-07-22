<?php
// delete_event.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; // 引入数据库连接

// 检查是否传入了 id 参数
if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode(["success" => false, "message" => "Lack valid ID."]);
    exit;
}

$id = intval($_GET['id']); // 将传入的 id 转换为整数，防止 SQL 注入

// 执行删除语句
$sql = "DELETE FROM Events WHERE event_id = $id";

if ($conn->query($sql) === TRUE) {
    if ($conn->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Event deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "No corresponding event found, or it may have already been deleted."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Database deletion failed: " . $conn->error]);
}

$conn->close();
?>