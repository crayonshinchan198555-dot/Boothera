<?php
// ==========================================================
// get_booths.php - 获取特定活动下可用的摊位列表
// ==========================================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

$event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;

if ($event_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid event ID"]);
    exit;
}

// 查询该活动下状态为“可用 (availability = 1)”的摊位
$sql = "SELECT booth_id, booth_number, availability 
        FROM Booth 
        WHERE event_id = ? AND availability = 1 
        ORDER BY booth_id ASC";

if ($stmt = $conn->prepare($sql)) {
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $booths = [];
    while ($row = $result->fetch_assoc()) {
        $booths[] = $row;
    }
    
    echo json_encode(["success" => true, "data" => $booths]);
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Failed to fetch booths: " . $conn->error]);
}

$conn->close();
?>