<?php
// ==========================================================
// application.php - 摊位申请管理 API (Session 鉴权版)
// ==========================================================
header("Content-Type: application/json; charset=UTF-8");
session_start(); // 必须开启 session
require_once 'db.php';

// 检查是否登录
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "请先登录！"]);
    exit;
}

$user_id = $_SESSION['user_id']; // 统一使用 session 中的 ID
$method = $_SERVER['REQUEST_METHOD'];

// ----------------------------------------------------------
// 业务一：获取当前用户的申请历史 (GET)
// ----------------------------------------------------------
if ($method === 'GET') {
    // 逻辑：直接查询当前 user_id 的所有申请
    $sql = "SELECT a.application_id, a.product_category, a.product_name, a.status, 
                   a.event_id, a.booth_id, e.event_name, e.date, b.booth_number
            FROM Applications a
            LEFT JOIN Events e ON a.event_id = e.event_id
            LEFT JOIN Booth b ON a.booth_id = b.booth_id
            WHERE a.user_id = ?
            ORDER BY a.application_id DESC";
            
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $apps = [];
        while ($row = $result->fetch_assoc()) {
            if (empty($row['booth_number'])) {
                $row['booth_number'] = $row['booth_id'] ? $row['booth_id'] : 'N/A';
            }
            $apps[] = $row;
        }
        echo json_encode(["success" => true, "data" => $apps]);
        $stmt->close();
    }
    exit;
}

// ----------------------------------------------------------
// 业务二 & 三：提交与取消 (POST)
// ----------------------------------------------------------
if ($method === 'POST') {
    // 处理 JSON 或 POST 数据
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? $_POST['action'] ?? '';
    
    // 【提交申请】
    if ($action === 'submit') {
        $event_id = intval($input['event_id'] ?? 0);
        $booth_id = intval($input['booth_id'] ?? 0);
        $product_cat = trim($input['product_category'] ?? '');
        $product_name = trim($input['product_name'] ?? '');

        if ($event_id <= 0 || $booth_id <= 0) {
            echo json_encode(["success" => false, "message" => "请选择有效的摊位！"]);
            exit;
        }

        $conn->begin_transaction();
        try {
            // 写入申请 (使用 user_id)
            $insSql = "INSERT INTO Applications (product_category, product_name, user_id, event_id, booth_id, status) VALUES (?, ?, ?, ?, ?, 'Pending')";
            $insStmt = $conn->prepare($insSql);
            $insStmt->bind_param("ssiii", $product_cat, $product_name, $user_id, $event_id, $booth_id);
            $insStmt->execute();
            
            // 更新摊位状态
            $upBoothSql = "UPDATE Booth SET availability = 0 WHERE booth_id = ?";
            $upBoothStmt = $conn->prepare($upBoothSql);
            $upBoothStmt->bind_param("i", $booth_id);
            $upBoothStmt->execute();

            $conn->commit();
            echo json_encode(["success" => true, "message" => "申请成功！"]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "系统错误"]);
        }
        exit;
    }

    // 【取消申请】
    if ($action === 'cancel') {
        $app_id = intval($input['application_id'] ?? 0);
        // 这里可以加一个校验，确保 app_id 确实属于当前 user_id
        $upAppSql = "UPDATE Applications SET status = 'Cancelled' WHERE application_id = ? AND user_id = ?";
        $stmt = $conn->prepare($upAppSql);
        $stmt->bind_param("ii", $app_id, $user_id);
        $stmt->execute();
        echo json_encode(["success" => true, "message" => "已取消"]);
        exit;
    }
}
?>