<?php
// ==========================================================
// admin_application.php - 后台管理 API (与 db.php 完美对接 + 摊位联动释放版)
// ==========================================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 💡 修改点 1：确保与你 userpage 的数据库文件名一致，这里改为 db.php
require_once 'db.php'; 

$method = $_SERVER['REQUEST_METHOD'];

// ---- 功能 1：获取所有申请数据 (GET) ----
if ($method === 'GET') {
    // 💡 2：把表里的 user_id, event_id, booth_id 全查出来，方便后台表格一一对应
    $query = "SELECT application_id, user_id, event_id, booth_id, product_category, product_name, status 
              FROM Applications 
              ORDER BY application_id DESC";
              
    $result = mysqli_query($conn, $query);

    if (!$result) {
        echo json_encode(["status" => "error", "message" => "Failed to fetch applications: " . mysqli_error($conn)]);
        exit;
    }

    $applications = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $applications[] = $row;
    }

    // 💡 保持返回结构为 status = success，供前端 home.js 顺利读取
    echo json_encode(["status" => "success", "data" => $applications]);
    exit;
}

// ---- 功能 2：审批操作 (POST) ----
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $application_id = $input['application_id'] ?? null;
    $status = $input['status'] ?? null; // 'Approved' 或 'Denied'

    if (!$application_id || !$status) {
        echo json_encode(["status" => "error", "message" => "缺少审批必要参数。"]);
        exit;
    }

    // 🛠️ 开启数据库事务，确保状态更新与摊位加回同时成功或同时失败
    mysqli_begin_transaction($conn);

    try {
        // 1. 更新申请表的状态
        $stmt = $conn->prepare("UPDATE Applications SET status = ? WHERE application_id = ?");
        $stmt->bind_param("si", $status, $application_id);
        
        if (!$stmt->execute()) {
            throw new Exception("更新数据库状态失败。");
        }
        $stmt->close();

        // 2. 🌟 核心修复：如果被 Denied (拒绝)，把摊位的 availability 加回为 1 🌟
        if ($status === 'Denied') {
            // 先查询这个 application 到底占用的是哪个 booth_id
            $boothQuery = $conn->prepare("SELECT booth_id FROM Applications WHERE application_id = ?");
            $boothQuery->bind_param("i", $application_id);
            $boothQuery->execute();
            $res = $boothQuery->get_result();
            
            if ($row = $res->fetch_assoc()) {
                $booth_id = $row['booth_id'];
                
                if ($booth_id) {
                    // 把对应的摊位 availability 改回 1 (代表可用)
                    $updateBooth = $conn->prepare("UPDATE Booth SET availability = 1 WHERE booth_id = ?");
                    $updateBooth->bind_param("i", $booth_id);
                    $updateBooth->execute();
                    $updateBooth->close();
                }
            }
            $boothQuery->close();
        }

        // 提交事务
        mysqli_commit($conn);
        echo json_encode(["status" => "success", "message" => "申请状态已成功更新为: " . $status]);

    } catch (Exception $e) {
        // 如果中间有任何一步崩了，撤销所有操作（回滚）
        mysqli_rollback($conn);
        echo json_encode(["status" => "error", "message" => "审批操作失败: " . $e->getMessage()]);
    }
    
    exit;
}

echo json_encode(["status" => "error", "message" => "不支持的请求方法。"]);
$conn->close();
?>