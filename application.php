<?php
// ==========================================================
// application.php - 摊位申请管理 API (终极完美修正版)
// ==========================================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// ----------------------------------------------------------
// 业务一：获取当前用户的申请历史 (GET)
// ----------------------------------------------------------
if ($method === 'GET') {
    $email = isset($_GET['email']) ? trim($_GET['email']) : '';

    if (empty($email)) {
        echo json_encode(["success" => false, "message" => "请先登录！"]);
        exit;
    }

    // 💡 全面更换为 LEFT JOIN，防止因 Events 或 Booth 表内无对应行而把主申请记录过滤掉
    $sql = "SELECT a.application_id, a.product_category, a.product_name, a.status, 
                   a.event_id, a.booth_id,
                   e.event_name, e.date, b.booth_number
            FROM Applications a
            JOIN Users u ON a.user_id = u.user_id
            LEFT JOIN Events e ON a.event_id = e.event_id
            LEFT JOIN Booth b ON a.booth_id = b.booth_id
            WHERE u.`e-mail` = ?
            ORDER BY a.application_id DESC";
            
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $apps = [];
        while ($row = $result->fetch_assoc()) {
            // 兜底方案：如果 Booth 表里没有配 booth_number，则直接拿字段里的 booth_id 做展示
            if (empty($row['booth_number'])) {
                $row['booth_number'] = $row['booth_id'] ? $row['booth_id'] : 'N/A';
            }
            $apps[] = $row;
        }
        
        echo json_encode(["success" => true, "data" => $apps]);
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "拉取申请查询准备失败: " . $conn->error]);
    }
    exit;
}

// ----------------------------------------------------------
// 业务二 & 三：提交申请 与 取消申请 (POST)
// ----------------------------------------------------------
if ($method === 'POST') {
    
    // 💡 核心兼容修复：如果前端 fetch 使用了 raw 格式或特殊格式导致 $_POST 为空，尝试从 php://input 解析 JSON 
    if (empty($_POST)) {
        $rawInput = file_get_contents('php://input');
        $jsonData = json_decode($rawInput, true);
        if (is_array($jsonData)) {
            $_POST = $jsonData;
        }
    }

    $action       = isset($_POST['action']) ? $_POST['action'] : 'submit';
    $email        = isset($_POST['email']) ? trim($_POST['email']) : '';
    $event_id     = isset($_POST['event_id']) ? intval($_POST['event_id']) : 0;
    $booth_id     = isset($_POST['booth_id']) ? intval($_POST['booth_id']) : 0;
    
    // ⚡ 双重兜底连招：不管前端带不带字母 s (product_category 或 products_category)，后端都能完美抓到！
    $product_cat  = isset($_POST['product_category']) ? trim($_POST['product_category']) : 
                    (isset($_POST['products_category']) ? trim($_POST['products_category']) : '');
                    
    $product_name = isset($_POST['product_name']) ? trim($_POST['product_name']) : 
                    (isset($_POST['products_name']) ? trim($_POST['products_name']) : '');

    // 【业务二：提交申请】
    if ($action === 'submit') {
 
        if (empty($email)) {
            echo json_encode(["success" => false, "message" => "登录失效，请重新登录！"]);
            exit;
        }
        if ($event_id <= 0 || $booth_id <= 0) {
            echo json_encode(["success" => false, "message" => "请先选择有效的活动和摊位！"]);
            exit;
        }

        $conn->begin_transaction();

        try {
            // 1. 获取用户 ID
            $uSql = "SELECT user_id FROM Users WHERE `e-mail` = ? LIMIT 1";
            $uStmt = $conn->prepare($uSql);
            $uStmt->bind_param("s", $email);
            $uStmt->execute();
            $uResult = $uStmt->get_result();
            $user = $uResult->fetch_assoc();
            $uStmt->close();

            if (!$user) { 
                throw new Exception("用户不存在！"); 
            }
            $user_id = $user['user_id'];

            // 2. 写入申请 (💡 彻底修正问号对齐方案：把 status 移到最后，前 5 个问号与 ssiii 变量精准一一对应)
            $insSql = "INSERT INTO Applications (product_category, product_name, user_id, event_id, booth_id, status) 
                       VALUES (?, ?, ?, ?, ?, 'Pending')";
            
            $insStmt = $conn->prepare($insSql);
            if (!$insStmt) {
                throw new Exception("SQL预处理失败: " . $conn->error);
            }
            
            // 这里的 "ssiii" 分别精准对应：分类(s)、名称(s)、用户ID(i)、活动ID(i)、摊位ID(i)
            $insStmt->bind_param("ssiii", $product_cat, $product_name, $user_id, $event_id, $booth_id);
            $insStmt->execute();
            $insStmt->close();

            // 3. 更新摊位状态
            $upBoothSql = "UPDATE Booth SET availability = 0 WHERE booth_id = ?";
            $upBoothStmt = $conn->prepare($upBoothSql);
            $upBoothStmt->bind_param("i", $booth_id);
            $upBoothStmt->execute();
            $upBoothStmt->close();

            $conn->commit();
            echo json_encode(["success" => true, "message" => "Application submitted successfully!"]);

        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "申请提交失败: " . $e->getMessage()]);
        }
    }
    
    // 【业务三：取消申请】
    if ($action === 'cancel') {
        $app_id = isset($_POST['application_id']) ? intval($_POST['application_id']) : 0;

        if ($app_id <= 0) {
            echo json_encode(["success" => false, "message" => "缺少申请记录ID。"]);
            exit;
        }

        $conn->begin_transaction();

        try {
            $getBIdSql = "SELECT booth_id FROM Applications WHERE application_id = ? LIMIT 1";
            $stmt = $conn->prepare($getBIdSql);
            $stmt->bind_param("i", $app_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $appData = $result->fetch_assoc();
            $stmt->close();

            if ($appData) {
                $booth_id = $appData['booth_id'];

                $upAppSql = "UPDATE Applications SET status = 'Cancelled' WHERE application_id = ?";
                $stmt2 = $conn->prepare($upAppSql);
                $stmt2->bind_param("i", $app_id);
                $stmt2->execute();
                $stmt2->close();

                $upBoothSql = "UPDATE Booth SET availability = 1 WHERE booth_id = ?";
                $stmt3 = $conn->prepare($upBoothSql);
                $stmt3->bind_param("i", $booth_id);
                $stmt3->execute();
                $stmt3->close();
            }

            $conn->commit();
            echo json_encode(["success" => true, "message" => "Application cancelled and booth released."]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "取消申请操作失败: " . $e->getMessage()]);
        }
    }
    exit;
}

// 兜底返回
echo json_encode(["success" => false, "message" => "不支持的请求方式。"]);
$conn->close();
?>