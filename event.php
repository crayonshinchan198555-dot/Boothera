<?php
// ==========================================================
// 5. events.php - 活动管理 API
// ==========================================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 如果传了 event_id，说明是要看某一个活动的详情
    $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;

    try {
        if ($event_id > 0) {
            // 查询单条活动详情
            $sql = "SELECT event_id, event_name, venue, date, time, description, booth_price FROM Events WHERE event_id = :event_id LIMIT 1";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            $event = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($event) {
                echo json_encode(["success" => true, "data" => $event]);
            } else {
                echo json_encode(["success" => false, "message" => "找不到该活动。"]);
            }
        } else {
            // 没有传 ID，默认查出所有活动给前端列表展示
            $sql = "SELECT event_id, event_name, venue, date, time, description, booth_price FROM Events ORDER BY date ASC";
            $stmt = $conn->query($sql);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 直接返回数组（前端可以直接循环渲染）
            echo json_encode(["success" => true, "data" => $events]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "数据库出错: " . $e->getMessage()]);
    }
    exit;
}
?>