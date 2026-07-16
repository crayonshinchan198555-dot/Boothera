<?php
// ==========================================================
// 6. booths.php - 摊位状态 API
// ==========================================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;

    if ($event_id <= 0) {
        echo json_encode(["success" => false, "message" => "缺少有效的活动 ID！"]);
        exit;
    }

    try {
        // 查出该活动下所有可用的摊位 (假设 1 代表可用，根据你的数据库实际存值修改，比如 'Available')
        $sql = "SELECT booth_id, booth_number FROM Booth WHERE event_id = :event_id AND availability = 1";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
        $stmt->execute();
        $booths = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $booths]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "查询摊位出错: " . $e->getMessage()]);
    }
    exit;
}
?>