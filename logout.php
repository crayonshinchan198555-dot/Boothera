<?php
session_start();
session_destroy(); // 销毁所有 session 数据
header("Location: login.html");
exit();
?>