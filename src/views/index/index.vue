<script setup>

</script>

<template>
  <div class="container">
    <h1 class="title">欢迎使用Exchange!管理平台</h1>

    <!-- 管理员须知 液态玻璃板块 -->
    <div class="glass-panel">
      <h2 class="sub-title">管理员须知</h2>
      <div class="notice-content">
        <p>1. 所有管理员在平台履职期间，必须严格遵守国家法律法规与平台各项规章制度，坚持合法、公正、合规开展各项管理操作。</p>
        <p>2. 平台会完整记录管理员每一步操作行为，做到全程留痕、有据可查，请规范自身言行与操作。</p>
        <p>3. 严禁包庇、纵容违规、违法用户及行为，严禁利用管理员身份滥用职权、徇私舞弊、谋取私利。</p>
        <p>4. 若出现违法违规、滥用职权等行为，平台将立即撤销管理员职位，并将相关线索移交司法机关依法处理。</p>
        <p>5. 违规人员需承担对应处罚，根据行为情节轻重、对平台造成的影响程度，依法进行相应金额赔偿，并承担一切法律后果。</p>
        <p>6. 秉持公平公正原则对待每一位用户，文明履职、认真负责，共同维护平台良好秩序。</p>
      </div>
    </div>

    <!-- 管理员手册 液态玻璃板块 -->
    <div class="glass-panel">
      <h2 class="sub-title">管理员手册</h2>
      <ul class="manual-list">
        <li>
          <span class="list-num">1</span>
          <div class="list-content">
            <strong>处理退款时卖家余额不足：</strong>您先用您自己的资金转给卖家并保留您的支付凭据，之后可联系Exchange运营团队 exchange_office@qq.com 进行核实处理。
          </div>
        </li>
        <li>
          <span class="list-num">3</span>
          <div class="list-content">
            <strong>违规商品/帖子下架处理：</strong>发现涉黄、涉赌、诈骗、虚假宣传等违规内容，对于每一件商品都需要审核，请仔细审核商品；对于帖子内容，需要管理员不定期巡查，若发现违规内容，执行驳回商品或删除帖子或评论操作，同时对发布账号直接封禁。
          </div>
        </li>
        <li>
          <span class="list-num">4</span>
          <div class="list-content">
            <strong>账号解封申请处理：</strong>仔细核对封禁原因与用户申诉理由，结合违规情节综合判断，无违规或误封情况及时解封；
          </div>
        </li>
        <li>
          <span class="list-num">5</span>
          <div class="list-content">
            <strong>交易纠纷调解：</strong>梳理交易全过程信息，引导双方友好协商，按照平台交易规则给出公正调解方案，避免矛盾激化。
          </div>
        </li>
        <li>
          <span class="list-num">6</span>
          <div class="list-content">
            <strong>平台数据查看权限：</strong>仅可因工作需要查看相关业务数据，严禁私自导出、泄露、倒卖用户个人信息、交易数据等隐私内容。
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* 全局变量 与项目其他页面统一 */
:root {
  --blur: blur(12px);
  --alpha-bg: rgba(255, 255, 255, 0.35);
  --alpha-border: rgba(255, 255, 255, 0.45);
}

* {
  font-family: "PingFang SC", "苹方-简", sans-serif !important;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  width: 100%;
  min-height: calc(100vh - 80px);
  padding: 24px;
  background: transparent !important;
}

.title {
  font-size: 26px;
  font-weight: 600;
  color: #222;
  text-align: center;
  margin-bottom: 24px;
}

.sub-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
}

/* 液态玻璃面板 全局统一样式 */
.glass-panel {
  background: var(--alpha-bg);
  backdrop-filter: var(--blur);
  border: 1px solid var(--alpha-border);
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

/* 管理员须知内容 */
.notice-content p {
  font-size: 15px;
  line-height: 1.8;
  color: #444;
  margin: 8px 0;
  text-align: left;
}

/* 管理员手册列表 */
.manual-list {
  list-style: none;
  padding: 0;
}

.manual-list li {
  display: flex;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.manual-list li:last-child {
  border-bottom: none;
}

.list-num {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: rgba(64, 158, 255, 0.3);
  color: #2277ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  margin-right: 14px;
  backdrop-filter: var(--blur);
}

.list-content {
  font-size: 15px;
  line-height: 1.7;
  color: #444;
}

.list-content strong {
  color: #222;
}
</style>