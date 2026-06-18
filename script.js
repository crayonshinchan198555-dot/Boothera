/**Boothera 开屏动画**/
document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    
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
        }, 800);

    }, showTimeDuration);
});

/**Login interactions**/