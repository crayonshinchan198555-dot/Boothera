/**Boothera 开屏动画**/
document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');

    const loginContainer = document.querySelector('.container');
    
    /* 【4行字逐个蹦出】精准时间轴明细：
      - 0.5s -> your 出来
      - 1.1s -> space, 出来
      - 1.7s -> your 出来
      - 2.3s -> stage. 出来
      - 3.2s -> 山脉 Logo 弹出
      - 4.2s -> BOOTHERA 品牌字弹出
      - 4.8s -> 画面全部完美定格
      - 5.8s -> 停留 1 秒后，整个开屏绿底平滑淡出，露出登录页
    */
    const showTimeDuration = 5800; 

    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        
        setTimeout(() => {
            splashScreen.style.display = 'none';
            
            // ⚠️ 修复：开屏动画彻底隐藏后，必须把登录页显示出来！
            if (loginContainer) {
                loginContainer.style.display = 'flex';
            }
            
        }, 800);

    }, showTimeDuration);
});

/**Login interactions**/
// 1. 登录逻辑（已修正跳转）
async function login() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('password').value;

    try {
        const response = await fetch('login.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}`
        });

        // 🚨 关键修改：先获取文本，而不是直接解析 JSON
        const text = await response.text();
        
        console.log("后端返回的原始数据:", text); // 按 F12 在控制台里看这个

        // 尝试解析 JSON，如果失败则直接显示文本
        try {
            const result = JSON.parse(text);
            if (result.success) {
                alert("🎉 登录成功！");
                window.location.href = "adminpages/home.html";
            } else {
                alert("❌ 登录失败: " + result.message);
            }
        } catch (e) {
            // 如果后端报错，这里会直接把数据库连接错误显示出来！
            document.body.innerHTML = "<h1>后端报错详情:</h1>" + text;
        }
        
    } catch (error) {
        alert("网络请求彻底失败: " + error);
    }
}
// 显示/隐藏密码
function togglePassword() {
    const x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

/**Forgot password**/
function openForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) modal.style.display = 'flex';
}

function closeForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) modal.style.display = 'none';
}

// 获取验证码按钮动作
function sendCode() {
    // ⚠️ 先获取用户填写的 Email
    const email = document.getElementById('reset-email').value.trim();
    
    // 如果没有填 Email，立刻拦截并警告
    if (!email) {
        alert("❌ Please enter your email address first!");
        return; 
    }

    // 只有填了 Email，才会通过验证并发送
    alert("🎉 A 6-digit code has been sent to " + email + ", please check your inbox!");
}

// 提交新密码动作
function submitNewPassword() {
    const email = document.getElementById('reset-email').value.trim();
    const newPass = document.getElementById('new-password').value;
    
    if(!email || !newPass) {
        alert("Please fill up！");
        return;
    }
    
    // 更新本地存储的密码
    localStorage.setItem('user_' + email, newPass);
    alert("🎉 Password reset successfully!Please login using the new password.");
    closeForgotModal();
}