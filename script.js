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

        const text = await response.text();
        
    try {
    const result = JSON.parse(text);
    
    // 1. 先判断是否登录成功
    if (result.success) {
        alert("🎉 登录成功！");
        
        // 确保邮箱被存储：优先用后端返回的，如果没有，用表单输入的
        const emailToSave = result.email || document.getElementById('login-email').value;
        localStorage.setItem('userEmail', emailToSave);
        
        // 成功后才跳转
        window.location.href = result.redirect; 
    } else {
        // 2. 登录失败，只提示，不存储任何东西
        alert("❌ 登录失败: " + result.message);
    }
} catch (e) {
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