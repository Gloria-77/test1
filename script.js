const STORAGE_KEY = "qa-work-english-checkin-v1";
const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeRecognition = null;
let activeListeningSession = null;
let activePassageSession = null;

const dayOne = {
  title: "第 1 天：外企测试英语启动",
  phase: "第 1 周",
  band: "工作基础",
  goals: [
    "认识并能读出 30 个软件测试工作高频词。",
    "看懂单词音标，先跟着系统语音模仿发音。",
    "掌握会议时间、版本号、缺陷编号的基础听力表达。",
    "读懂一段简单的英文需求/缺陷描述。",
    "能用英文完成 30 秒测试工程师自我介绍。"
  ],
  tasks: [
    { title: "工作单词 + 音标", time: "30 分钟", desc: "学习 30 个测试高频词，看音标、听单词、跟读例句。" },
    { title: "会议听力", time: "30 分钟", desc: "练时间、版本号、Bug 编号和会议安排。" },
    { title: "英文需求阅读", time: "30 分钟", desc: "读短文，圈出需求、实际结果、预期结果。" },
    { title: "项目口语", time: "30 分钟", desc: "读测试工程师自我介绍，录音 30 秒。" }
  ],
  content: [
    {
      type: "words",
      title: "30 个软件测试工作高频词",
      words: [
        ["requirement", "需求 | I need to confirm the requirement first."],
        ["scenario", "场景 | This scenario should be covered by automation."],
        ["expected", "预期的 | The expected result is a success message."],
        ["actual", "实际的 | The actual result is an error message."],
        ["reproduce", "复现 | I can reproduce this issue on the test environment."],
        ["defect", "缺陷 | I created a defect in Jira."],
        ["severity", "严重程度 | The severity is high because payment is blocked."],
        ["priority", "优先级 | The priority should be changed to high."],
        ["regression", "回归测试 | We need to run regression tests before release."],
        ["automation", "自动化 | I use pytest for API automation testing."],
        ["assertion", "断言 | The assertion checks the response code."],
        ["endpoint", "接口地址 | This endpoint returns user information."],
        ["payload", "请求体 | Please check the request payload."],
        ["response", "响应 | The response body contains an error code."],
        ["token", "令牌 | The token expires after two hours."],
        ["database", "数据库 | I verify the result in the database."],
        ["environment", "环境 | The issue only happens in the staging environment."],
        ["release", "发布 | The release is planned for Friday."],
        ["rollback", "回滚 | We may need a rollback plan."],
        ["clarify", "澄清 | I want to clarify one requirement."],
        ["request", "请求 | The request header is missing the token."],
        ["status", "状态 | The order status should be updated to paid."],
        ["parameter", "参数 | This parameter is required."],
        ["validation", "校验 | The validation rule is not correct."],
        ["coverage", "覆盖率 | We need better test coverage for payment."],
        ["configuration", "配置 | The configuration is different in staging."],
        ["developer", "开发人员 | I discussed the issue with the developer."],
        ["production", "生产环境 | We should not test with fake data in production."],
        ["log", "日志 | The log shows a database timeout."],
        ["workaround", "临时解决方案 | There is a workaround, but it is not user-friendly."]
      ]
    },
    {
      type: "list",
      title: "今天必须背熟的 5 个工作句子",
      items: [
        "I work as a software testing engineer.",
        "I am responsible for API testing and regression testing.",
        "I found an issue in the login API.",
        "The actual result is different from the expected result.",
        "Could you help me clarify this requirement?"
      ]
    },
    {
      type: "list",
      title: "会议听力小练习",
      intro: "把你听到的时间、版本号、编号写下来：",
      items: [
        "The daily stand-up starts at ten thirty.",
        "The release version is two point three point one.",
        "The defect ID is QA one zero eight seven.",
        "The regression test should finish before six p.m.",
        "The API returned status code five hundred.",
        "Please update the test case by Friday.",
        "The meeting is moved to Wednesday morning.",
        "The ticket number is BUG two four six eight.",
        "The test account ends with nine seven seven.",
        "The sprint review starts at three fifteen."
      ]
    },
    {
      type: "text",
      title: "英文工作短文",
      body: "A software testing engineer needs to understand requirements before writing test cases. If the requirement is unclear, the tester should ask questions and confirm the expected behavior with the product manager. Clear communication helps the team avoid rework and find problems earlier."
    },
    {
      type: "list",
      title: "测试工程师自我介绍",
      items: [
        "My name is ____.",
        "I work as a software testing engineer.",
        "My main work includes API testing, writing test cases, and reporting defects.",
        "I have experience with pytest-based automation testing.",
        "I usually communicate with developers and product managers.",
        "I want to improve my workplace English so I can work better in an international team."
      ]
    }
  ],
  reminder: "<strong>今天别求快。</strong>重点是把测试工作里的英文说出口。先能表达清楚，再慢慢变自然。"
};

const weeklyPlans = [
  "工作基础：自我介绍、岗位职责、日常任务表达。",
  "需求沟通：确认需求、提问、复述理解、会议总结。",
  "Bug 描述：复现步骤、实际结果、预期结果、影响范围。",
  "接口测试：请求、响应、状态码、Token、数据库校验。",
  "自动化测试：pytest、fixture、数据驱动、断言、报告。",
  "项目协作：Jira、PR、代码评审、版本发布、风险提醒。",
  "会议表达：站会、评审会、缺陷会、同步进度。",
  "邮件消息：英文邮件、Slack/Jira 评论、礼貌催办。",
  "测试策略：测试计划、优先级、覆盖范围、风险分析。",
  "质量意识：稳定性、可用性、性能、安全、用户体验。",
  "问题推动：定位问题、提供证据、推动修复、验证结果。",
  "项目讲述：用英文讲 pytest 自动化项目和个人贡献。",
  "外企面试：自我介绍、项目问答、行为面试表达。",
  "综合模拟：英文会议 + Bug 说明 + 项目介绍组合练习。",
  "短板修复：只练最卡的发音、句型和表达场景。",
  "最终复盘：整理可背诵的外企 QA 工作英语材料。"
];

const dailyFocus = [
  "岗位介绍", "需求澄清", "测试用例", "Bug 复现", "实际和预期", "接口请求", "响应断言",
  "Token 鉴权", "数据库校验", "pytest 框架", "数据驱动", "Allure 报告", "CI 自动执行", "回归测试",
  "Jira 评论", "站会汇报", "风险提醒", "发布验证", "英文邮件", "项目面试", "团队协作"
];

const wordBank = [
  ["analyse", "分析", "I analyse the failed test result carefully."],
  ["application", "应用程序", "This application has a login issue."],
  ["assertion", "断言", "The assertion checks the business code."],
  ["authentication", "认证", "The API requires token authentication."],
  ["authorization", "授权", "The user does not have authorization for this action."],
  ["available", "可用的", "The test environment is available now."],
  ["boundary", "边界", "We should test the boundary values."],
  ["branch", "分支", "The fix is on the release branch."],
  ["checklist", "检查清单", "I use a checklist for regression testing."],
  ["clarify", "澄清", "Could you clarify the expected behavior?"],
  ["client", "客户端", "The issue happens on the iOS client."],
  ["comment", "评论", "I added a comment in Jira."],
  ["compatible", "兼容的", "This feature should be compatible with older versions."],
  ["configuration", "配置", "The configuration is different in staging."],
  ["confirm", "确认", "Please confirm the requirement with the product manager."],
  ["consistent", "一致的", "The API response should be consistent."],
  ["coverage", "覆盖率", "We need better test coverage for payment."],
  ["critical", "严重的", "This is a critical issue because users cannot pay."],
  ["database", "数据库", "I verified the order status in the database."],
  ["deadline", "截止日期", "The testing deadline is this Thursday."],
  ["debug", "调试", "The developer needs more logs to debug the issue."],
  ["defect", "缺陷", "I linked the defect to the test case."],
  ["dependency", "依赖", "This task has a dependency on the backend service."],
  ["description", "描述", "The bug description should be clear and complete."],
  ["developer", "开发人员", "I discussed the issue with the developer."],
  ["endpoint", "接口地址", "This endpoint is used to create an order."],
  ["environment", "环境", "The issue cannot be reproduced in production."],
  ["evidence", "证据", "Screenshots and logs are useful evidence."],
  ["exception", "异常", "The server throws an exception when the payload is empty."],
  ["expected", "预期的", "The expected result is that the user logs in successfully."],
  ["failure", "失败", "The failure is caused by invalid test data."],
  ["feature", "功能", "This feature needs more negative test cases."],
  ["fixture", "夹具", "I use a pytest fixture to prepare the token."],
  ["framework", "框架", "I built an API automation framework with pytest."],
  ["impact", "影响", "This issue has a high impact on user checkout."],
  ["implementation", "实现", "The implementation does not match the requirement."],
  ["incident", "事故", "The team reviewed the incident after release."],
  ["integration", "集成", "Integration testing found a data issue."],
  ["invalid", "无效的", "The API should reject invalid parameters."],
  ["Jira", "项目管理工具", "I updated the Jira ticket with test evidence."],
  ["log", "日志", "The log shows a database timeout."],
  ["maintain", "维护", "We maintain test scripts after each release."],
  ["mock", "模拟", "We use mock data when the third-party service is unavailable."],
  ["parameter", "参数", "This parameter is required."],
  ["payload", "请求体", "The request payload is missing the phone number."],
  ["permission", "权限", "The user permission is not configured correctly."],
  ["priority", "优先级", "The priority should be high for this defect."],
  ["production", "生产环境", "We should not test with fake data in production."],
  ["pytest", "Python 测试框架", "I use pytest to run API automation tests."],
  ["quality", "质量", "Quality is the responsibility of the whole team."],
  ["regression", "回归测试", "Regression testing is required before release."],
  ["release", "发布", "The release is blocked by two high-priority defects."],
  ["reproduce", "复现", "I can reproduce the issue with these steps."],
  ["request", "请求", "The request header is missing the token."],
  ["response", "响应", "The response body contains the wrong status."],
  ["review", "评审", "We review test cases before execution."],
  ["risk", "风险", "There is a risk if we skip payment testing."],
  ["rollback", "回滚", "The team prepared a rollback plan."],
  ["scenario", "场景", "This scenario covers an expired token."],
  ["scope", "范围", "The testing scope includes login and payment."],
  ["severity", "严重程度", "The severity is medium because there is a workaround."],
  ["Sprint", "敏捷迭代", "This story is planned for the next sprint."],
  ["stable", "稳定的", "The test environment is not stable today."],
  ["status", "状态", "The order status should be updated to paid."],
  ["summary", "总结", "Please add a short summary to the ticket."],
  ["timeout", "超时", "The request timed out after ten seconds."],
  ["token", "令牌", "The token should be refreshed before it expires."],
  ["trace", "追踪", "We need to trace the request ID in the logs."],
  ["trigger", "触发", "This action triggers a notification."],
  ["update", "更新", "I updated the test case after the requirement changed."],
  ["validate", "校验", "We need to validate the response schema."],
  ["verify", "验证", "I verified the fix on the staging environment."],
  ["workaround", "临时解决方案", "There is a workaround, but it is not user-friendly."]
];

const phoneticBank = {
  actual: "/ˈæktʃuəl/",
  analyse: "/ˈænəlaɪz/",
  application: "/ˌæplɪˈkeɪʃən/",
  assertion: "/əˈsɜːrʃən/",
  authentication: "/ɔːˌθentɪˈkeɪʃən/",
  authorization: "/ˌɔːθərəˈzeɪʃən/",
  automation: "/ˌɔːtəˈmeɪʃən/",
  available: "/əˈveɪləbl/",
  behavior: "/bɪˈheɪvjər/",
  boundary: "/ˈbaʊndəri/",
  branch: "/bræntʃ/",
  checklist: "/ˈtʃeklɪst/",
  clarify: "/ˈklærəfaɪ/",
  client: "/ˈklaɪənt/",
  comment: "/ˈkɑːment/",
  compatible: "/kəmˈpætəbl/",
  configuration: "/kənˌfɪɡjəˈreɪʃən/",
  confirm: "/kənˈfɜːrm/",
  consistent: "/kənˈsɪstənt/",
  coverage: "/ˈkʌvərɪdʒ/",
  critical: "/ˈkrɪtɪkl/",
  database: "/ˈdeɪtəbeɪs/",
  deadline: "/ˈdedlaɪn/",
  debug: "/ˌdiːˈbʌɡ/",
  defect: "/ˈdiːfekt/",
  dependency: "/dɪˈpendənsi/",
  description: "/dɪˈskrɪpʃən/",
  developer: "/dɪˈveləpər/",
  endpoint: "/ˈendpɔɪnt/",
  environment: "/ɪnˈvaɪrənmənt/",
  evidence: "/ˈevɪdəns/",
  exception: "/ɪkˈsepʃən/",
  expected: "/ɪkˈspektɪd/",
  failure: "/ˈfeɪljər/",
  feature: "/ˈfiːtʃər/",
  fixture: "/ˈfɪkstʃər/",
  framework: "/ˈfreɪmwɜːrk/",
  impact: "/ˈɪmpækt/",
  implementation: "/ˌɪmplɪmenˈteɪʃən/",
  incident: "/ˈɪnsɪdənt/",
  integration: "/ˌɪntɪˈɡreɪʃən/",
  invalid: "/ɪnˈvælɪd/",
  jira: "/ˈdʒɪrə/",
  log: "/lɔːɡ/",
  maintain: "/meɪnˈteɪn/",
  mock: "/mɑːk/",
  parameter: "/pəˈræmɪtər/",
  payload: "/ˈpeɪloʊd/",
  permission: "/pərˈmɪʃən/",
  priority: "/praɪˈɔːrəti/",
  production: "/prəˈdʌkʃən/",
  pytest: "/ˌpaɪˈtest/",
  quality: "/ˈkwɑːləti/",
  regression: "/rɪˈɡreʃən/",
  release: "/rɪˈliːs/",
  reproduce: "/ˌriːprəˈduːs/",
  request: "/rɪˈkwest/",
  requirement: "/rɪˈkwaɪərmənt/",
  response: "/rɪˈspɑːns/",
  review: "/rɪˈvjuː/",
  risk: "/rɪsk/",
  rollback: "/ˈroʊlbæk/",
  scenario: "/səˈnɑːrioʊ/",
  scope: "/skoʊp/",
  severity: "/səˈverəti/",
  sprint: "/sprɪnt/",
  stable: "/ˈsteɪbl/",
  status: "/ˈsteɪtəs/",
  summary: "/ˈsʌməri/",
  timeout: "/ˈtaɪmaʊt/",
  token: "/ˈtoʊkən/",
  trace: "/treɪs/",
  trigger: "/ˈtrɪɡər/",
  update: "/ˌʌpˈdeɪt/",
  validate: "/ˈvælɪdeɪt/",
  validation: "/ˌvælɪˈdeɪʃən/",
  verify: "/ˈverɪfaɪ/",
  workaround: "/ˈwɜːrkaraʊnd/"
};

const translationBank = {
  a: "一个；一项",
  about: "关于",
  action: "操作；行动",
  actions: "操作；行动",
  add: "添加",
  after: "在……之后",
  also: "也；同样",
  and: "和；并且",
  app: "应用程序",
  ask: "询问；提出问题",
  based: "基于",
  before: "在……之前",
  behavior: "行为；表现",
  better: "更好的",
  body: "响应体；正文",
  build: "构建；版本包",
  business: "业务",
  can: "能够；可以",
  case: "用例；情况",
  cases: "用例；情况",
  changes: "变更；修改",
  check: "检查",
  checks: "检查项",
  clear: "清楚的；明确的",
  code: "代码；状态码",
  comments: "评论；备注",
  communication: "沟通",
  completed: "已完成的",
  correct: "正确的",
  create: "创建",
  data: "数据",
  defined: "已定义的",
  describe: "描述",
  different: "不同的",
  discussion: "讨论",
  easier: "更容易的",
  earlier: "更早地",
  environment: "环境",
  evidence: "证据",
  existing: "已有的",
  explain: "解释",
  faster: "更快地",
  fields: "字段",
  file: "文件",
  find: "发现；找到",
  fix: "修复",
  flow: "流程",
  for: "为了；对于",
  from: "来自；从……",
  good: "好的",
  has: "有；拥有",
  help: "帮助",
  helpful: "有帮助的",
  helps: "帮助",
  if: "如果",
  important: "重要的",
  in: "在……里面",
  include: "包括",
  input: "输入",
  inputs: "输入",
  interview: "面试",
  is: "是",
  issue: "问题；缺陷",
  issues: "问题；缺陷",
  it: "它",
  jira: "项目/缺陷管理工具",
  logic: "逻辑",
  main: "主要的",
  make: "使；制作",
  may: "可能",
  manager: "经理；负责人",
  members: "成员",
  negative: "异常的；反向的",
  needs: "需要",
  next: "下一个；下一步",
  not: "不；没有",
  of: "……的",
  on: "在……上",
  open: "打开的；未关闭的",
  or: "或者",
  parameters: "参数",
  performed: "被执行",
  plan: "计划",
  point: "要点；观点",
  points: "要点；观点",
  prevent: "防止；避免",
  problems: "问题",
  product: "产品",
  project: "项目",
  quickly: "快速地",
  questions: "问题",
  qa: "质量保证；测试岗位",
  report: "报告",
  reports: "报告",
  requirement: "需求",
  requirements: "需求",
  result: "结果",
  results: "结果",
  rework: "返工",
  safely: "安全地",
  same: "相同的",
  service: "服务",
  should: "应该",
  simple: "简单的",
  specific: "具体的",
  steps: "步骤",
  story: "需求故事",
  summary: "总结",
  team: "团队",
  tester: "测试人员",
  testing: "测试",
  tests: "测试",
  the: "这个；该",
  this: "这个",
  to: "去；为了",
  understand: "理解",
  unclear: "不清楚的",
  useful: "有用的",
  user: "用户",
  users: "用户",
  verify: "验证",
  was: "是；被",
  when: "当……时",
  where: "在哪里",
  whether: "是否",
  why: "为什么",
  with: "和；带有",
  work: "工作",
  writing: "编写；写作"
};

const sentenceBank = [
  "I work as a software testing engineer.",
  "My main responsibility is to ensure software quality.",
  "I usually communicate with developers and product managers.",
  "Could you clarify the expected behavior for this scenario?",
  "The actual result is different from the expected result.",
  "I can reproduce this issue on the staging environment.",
  "I attached screenshots and logs to the Jira ticket.",
  "This defect blocks the payment flow, so the priority should be high.",
  "I use pytest to build and maintain API automation tests.",
  "The test data is separated from the test logic.",
  "The fixture prepares the token before the test starts.",
  "The assertion checks the response code and business fields.",
  "We should run regression tests before the release.",
  "I verified the fix and the issue is no longer reproducible.",
  "There is a risk if we skip the database validation.",
  "I will update the test case after the requirement is confirmed.",
  "The automation report helps the team understand failed cases quickly.",
  "I need more information before I can estimate the testing time.",
  "From a QA perspective, this behavior may confuse users.",
  "Let me summarize my understanding of the requirement."
];

const listeningBank = [
  "The daily stand-up starts at ten thirty.",
  "The defect ID is QA one zero eight seven.",
  "The API returned status code four zero one.",
  "The API returned status code five hundred.",
  "The release version is two point three point one.",
  "The test account ends with nine seven seven.",
  "The regression test should finish before six p.m.",
  "The sprint review is moved to Wednesday morning.",
  "The staging environment will be unavailable for thirty minutes.",
  "Please update the Jira ticket before five thirty.",
  "The pull request number is PR three two six.",
  "The failed case is test login with an expired token.",
  "The request ID is A seven C nine two.",
  "The database table is order underscore detail.",
  "The meeting has been postponed to next Monday.",
  "The bug was reproduced on iOS version seventeen point five.",
  "The automation job runs at eight every morning.",
  "The report contains twenty failed cases and one hundred passed cases.",
  "The deadline for test execution is Friday noon.",
  "The release candidate is version one point nine point zero."
];

const readingTopics = [
  {
    title: "Requirement clarification",
    body: "Before writing test cases, a QA engineer should understand the requirement and confirm unclear points. If the expected behavior is not defined, different team members may make different assumptions. A short question in a meeting or a written summary after discussion can prevent rework."
  },
  {
    title: "Bug report quality",
    body: "A good bug report should include a clear title, test environment, preconditions, steps to reproduce, actual result, expected result and evidence. Developers can fix issues faster when the report is specific. Screenshots, logs and request IDs are often useful evidence."
  },
  {
    title: "API testing",
    body: "API testing checks whether a service returns the correct response for different requests. A tester should verify the status code, response body, business fields and database result. Negative cases are also important because invalid parameters should be handled safely."
  },
  {
    title: "Pytest automation",
    body: "A pytest automation project is easier to maintain when common logic is separated from test cases. Fixtures can prepare tokens or test data. Data-driven tests can run the same logic with different inputs, and reports can help the team understand failures quickly."
  },
  {
    title: "Regression testing",
    body: "Regression testing is performed before a release to make sure existing features still work after code changes. The scope should be based on risk, changed modules and important user flows. Automation is useful for stable and repeated regression scenarios."
  },
  {
    title: "Stand-up update",
    body: "In a daily stand-up, a QA engineer usually gives a short update about completed work, current tasks and blockers. The update should be clear and brief. If a blocker needs discussion, it is better to follow up after the meeting."
  },
  {
    title: "Release risk",
    body: "When a release has open defects, QA should explain the risk in simple language. The team needs to know which users are affected, whether there is a workaround and whether the defect blocks the main flow. Clear risk communication helps managers make better decisions."
  },
  {
    title: "Jira communication",
    body: "Jira comments should be short, factual and easy to follow. A useful comment may say what was tested, where it was tested, what evidence was attached and what action is needed next. This style is especially helpful for international teams."
  },
  {
    title: "Working with developers",
    body: "A QA engineer and a developer should work together to understand the root cause of an issue. QA can provide steps, logs and test data, while the developer checks the code and service behavior. Good cooperation makes defect fixing faster."
  },
  {
    title: "Interview project explanation",
    body: "When explaining an automation project in an interview, it is important to describe the background, your responsibility, the framework structure and the result. A strong answer also explains why you used data-driven testing, fixtures, reports and CI execution."
  }
];

function createDetailedPlan(index) {
  const dayNumber = index + 1;
  const week = Math.floor(index / 7);
  const dayInWeek = (index % 7) + 1;
  const weekTheme = weeklyPlans[week].split("：")[0];
  const focus = dailyFocus[index % dailyFocus.length];
  const outputModule = dayInWeek % 2 === 0 ? "口语汇报" : "工作写作";

  return {
    title: `第 ${dayNumber} 天：${weekTheme} · ${focus}`,
    phase: `第 ${week + 1} 周`,
    band: week < 4 ? "工作基础" : week < 8 ? "测试场景" : week < 12 ? "项目表达" : "外企面试",
    goals: [
      weeklyPlans[week],
      `完成今天的 ${focus} 主题词、句子、会议听力和工作短文。`,
      dayInWeek % 2 === 0 ? "录一段 45 秒英文工作汇报，听回放找出一个卡顿点。" : "写 5 句英文 Jira/邮件风格句子，注意信息清楚。",
      "记录今天最想在工作里用起来的一句话。"
    ],
    tasks: [
      { title: "工作单词 + 音标", time: "20 分钟", desc: `学习 ${focus} 主题 15 个词，看音标并跟读 5 个核心工作句。` },
      { title: "会议听力", time: "35 分钟", desc: "听时间、版本号、缺陷编号、状态码和会议安排，写下你听到的内容。" },
      { title: "工作短文阅读", time: "35 分钟", desc: "读需求、Bug、接口或项目相关短文，找出关键信息。" },
      { title: outputModule, time: "30 分钟", desc: dayInWeek % 2 === 0 ? "按工作汇报提示录音 45 秒，练清楚表达。" : "按英文工作消息框架写 5 句，并大声读出来。" }
    ],
    content: [
      {
        type: "words",
        title: `15 个 ${focus} 高频词`,
        words: makeWordSet(index)
      },
      {
        type: "list",
        title: "今天必须跟读的 5 个句子",
        items: makeSentenceSet(index)
      },
      {
        type: "list",
        title: "会议听力小练习",
        intro: "先点“听”，把你听到的英文、数字、版本号或编号写进笔记：",
        items: makeListeningSet(index)
      },
      {
        type: "text",
        title: "工作短文",
        body: makeReading(index).body
      },
      {
        type: "list",
        title: "工作理解问题",
        intro: `短文主题：${makeReading(index).title}。请像工作中看英文信息一样找答案：`,
        items: makeReadingQuestions(index)
      },
      {
        type: "list",
        title: dayInWeek % 2 === 0 ? "口语汇报任务" : "工作写作任务",
        intro: dayInWeek % 2 === 0 ? "录音 45 秒；如果卡住，就先读下面的句子：" : "把下面句子改成你自己的 Jira 评论、邮件或会议总结：",
        items: makeOutputSet(index)
      }
    ],
    reminder: `<strong>${weekTheme}</strong>。今天主题是 ${focus}，练一句你明天上班就能用的英文。`
  };
}

function makeWordSet(index) {
  return Array.from({ length: 15 }, (_, offset) => {
    const [word, meaning, sentence] = wordBank[(index * 7 + offset) % wordBank.length];
    return [word, `${meaning} | ${sentence}`];
  });
}

function makeSentenceSet(index) {
  return Array.from({ length: 5 }, (_, offset) => sentenceBank[(index * 3 + offset) % sentenceBank.length]);
}

function makeListeningSet(index) {
  return Array.from({ length: 10 }, (_, offset) => listeningBank[(index * 5 + offset) % listeningBank.length]);
}

function makeReading(index) {
  return readingTopics[index % readingTopics.length];
}

function makeReadingQuestions(index) {
  const topic = makeReading(index);
  return [
    `What is the main idea of "${topic.title}"?`,
    "What information should QA confirm or report?",
    "What evidence, risk or next action is mentioned?",
    "Find one useful work sentence and read it aloud.",
    "Write one short Jira-style summary in your own words."
  ];
}

function makeOutputSet(index) {
  const dayInWeek = (index % 7) + 1;
  const focus = dailyFocus[index % dailyFocus.length].toLowerCase();
  if (dayInWeek % 2 === 0) {
    return [
      `Today I worked on ${focus}.`,
      "I completed the main test scenarios and found one issue.",
      "The issue can be reproduced on the staging environment.",
      "I have attached the logs and screenshots in Jira.",
      "My next step is to verify the fix after the developer updates the build."
    ];
  }

  return [
    `I tested the ${focus} scenario today.`,
    "The actual result is different from the expected result.",
    "Please check the attached logs and screenshots.",
    "Could you confirm whether this behavior is expected?",
    "After the fix is ready, I will run regression testing again."
  ];
}

const plans = Array.from({ length: 112 }, (_, index) => index === 0 ? dayOne : createDetailedPlan(index));

const state = loadState();
let currentDay = Number(state.currentDay || 0);

const els = {
  completedDays: document.getElementById("completedDays"),
  totalMinutes: document.getElementById("totalMinutes"),
  streakDays: document.getElementById("streakDays"),
  daySelect: document.getElementById("daySelect"),
  prevDay: document.getElementById("prevDay"),
  nextDay: document.getElementById("nextDay"),
  taskProgressText: document.getElementById("taskProgressText"),
  taskProgressBar: document.getElementById("taskProgressBar"),
  phaseLabel: document.getElementById("phaseLabel"),
  dayTitle: document.getElementById("dayTitle"),
  completeDayButton: document.getElementById("completeDayButton"),
  targetBand: document.getElementById("targetBand"),
  goalsList: document.getElementById("goalsList"),
  tasksList: document.getElementById("tasksList"),
  studyContent: document.getElementById("studyContent"),
  minutesInput: document.getElementById("minutesInput"),
  difficultySelect: document.getElementById("difficultySelect"),
  noteInput: document.getElementById("noteInput"),
  blockerInput: document.getElementById("blockerInput"),
  weeklyReminder: document.getElementById("weeklyReminder")
};

init();

function init() {
  plans.forEach((_, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `第 ${index + 1} 天`;
    els.daySelect.appendChild(option);
  });

  els.daySelect.addEventListener("change", () => {
    currentDay = Number(els.daySelect.value);
    state.currentDay = currentDay;
    saveState();
    render();
  });

  els.prevDay.addEventListener("click", () => {
    currentDay = Math.max(0, currentDay - 1);
    state.currentDay = currentDay;
    saveState();
    render();
  });

  els.nextDay.addEventListener("click", () => {
    currentDay = Math.min(plans.length - 1, currentDay + 1);
    state.currentDay = currentDay;
    saveState();
    render();
  });

  [els.minutesInput, els.difficultySelect, els.noteInput, els.blockerInput].forEach((element) => {
    element.addEventListener("input", persistCurrentDay);
  });

  els.studyContent.addEventListener("click", (event) => {
    const speakButton = event.target.closest("[data-speak]");
    if (speakButton) {
      stopListeningPractice();
      stopPassageReading();
      speakEnglish(speakButton.dataset.speak, Number(speakButton.dataset.rate || "0.85"));
      if (speakButton.classList.contains("passage-word")) {
        showWordTranslation(speakButton, speakButton.dataset.speak);
      }
      return;
    }

    const translateButton = event.target.closest("[data-translate-control]");
    if (translateButton) {
      translateInputWord(translateButton);
      return;
    }

    const passageButton = event.target.closest("[data-passage-control]");
    if (passageButton) {
      togglePassageReading(passageButton);
      return;
    }

    const listeningButton = event.target.closest("[data-listening-control]");
    if (listeningButton) {
      stopPassageReading();
      toggleListeningPractice(listeningButton);
      return;
    }

    const readButton = event.target.closest("[data-read-target]");
    if (readButton) {
      stopListeningPractice();
      stopPassageReading();
      startFollowRead(readButton);
    }
  });

  els.studyContent.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const input = event.target.closest(".translation-input");
    if (!input) return;

    event.preventDefault();
    const section = input.closest(".content-block");
    const button = section?.querySelector("[data-translate-control]");
    if (button) translateInputWord(button);
  });

  els.completeDayButton.addEventListener("click", () => {
    const record = ensureRecord(currentDay);
    record.completed = !record.completed;
    record.completedAt = record.completed ? new Date().toISOString() : "";
    saveState();
    render();
  });

  render();
}

function render() {
  const plan = plans[currentDay];
  const record = ensureRecord(currentDay);
  els.daySelect.value = String(currentDay);
  els.phaseLabel.textContent = plan.phase;
  els.dayTitle.textContent = plan.title;
  els.targetBand.textContent = plan.band;
  els.weeklyReminder.innerHTML = plan.reminder;

  els.goalsList.innerHTML = "";
  plan.goals.forEach((goal) => {
    const li = document.createElement("li");
    li.textContent = goal;
    els.goalsList.appendChild(li);
  });

  els.tasksList.innerHTML = "";
  plan.tasks.forEach((task, index) => {
    const row = document.createElement("label");
    row.className = "task-item";
    row.innerHTML = `
      <input type="checkbox" data-task-index="${index}" ${record.tasks[index] ? "checked" : ""} />
      <span>
        <p class="task-title">${escapeHtml(task.title)}</p>
        <p class="task-desc">${escapeHtml(task.desc)}</p>
      </span>
      <span class="task-time">${escapeHtml(task.time)}</span>
    `;
    els.tasksList.appendChild(row);
  });

  els.tasksList.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const index = Number(event.target.dataset.taskIndex);
      ensureRecord(currentDay).tasks[index] = event.target.checked;
      saveState();
      updateStats();
    });
  });

  els.studyContent.innerHTML = "";
  plan.content.forEach((block) => els.studyContent.appendChild(renderContentBlock(block)));

  els.minutesInput.value = record.minutes || "";
  els.difficultySelect.value = record.difficulty || "";
  els.noteInput.value = record.note || "";
  els.blockerInput.value = record.blocker || "";
  els.completeDayButton.textContent = record.completed ? "取消完成" : "完成今日打卡";
  els.completeDayButton.classList.toggle("done", record.completed);

  updateStats();
}

function renderContentBlock(block) {
  const section = document.createElement("div");
  section.className = "content-block";
  const title = document.createElement("h4");
  title.textContent = block.title;
  section.appendChild(title);

  if (block.type === "words") {
    const helper = document.createElement("p");
    helper.className = "speech-helper";
    helper.textContent = "先看音标，再点“听单词”模仿发音；点“我的跟读”可以录你的发音并给出反馈。";
    section.appendChild(helper);
    const grid = document.createElement("div");
    grid.className = "word-grid";
    block.words.forEach(([word, desc]) => {
      const [meaning, sentence = ""] = desc.split(" | ");
      const phonetic = getPhonetic(word);
      const card = document.createElement("div");
      card.className = "word-card";
      card.innerHTML = `
        <div class="word-main">
          <strong>${escapeHtml(word)}</strong>
          ${phonetic ? `<em class="phonetic">${escapeHtml(phonetic)}</em>` : ""}
          <span>${escapeHtml(desc)}</span>
        </div>
        <div class="speech-actions">
          <button type="button" class="speech-button" data-speak="${escapeHtml(word)}" data-rate="0.72">听单词</button>
          ${sentence ? `<button type="button" class="speech-button" data-speak="${escapeHtml(sentence)}" data-rate="0.82">听例句</button>` : ""}
          <button type="button" class="speech-button read-button" data-read-target="${escapeHtml(sentence || word)}">我的跟读</button>
        </div>
        <div class="read-feedback" aria-live="polite"></div>
      `;
      grid.appendChild(card);
    });
    section.appendChild(grid);
  }

  if (block.type === "list") {
    if (block.intro) {
      const intro = document.createElement("p");
      intro.textContent = block.intro;
      section.appendChild(intro);
    }

    const isListeningPractice = block.title.includes("听力");
    if (isListeningPractice) {
      const controls = document.createElement("div");
      controls.className = "listening-controls";
      controls.innerHTML = `
        <button type="button" class="listening-control-button" data-listening-control>开始盲听</button>
        <span class="listening-status" aria-live="polite">按一次后连续播放，本组文字会临时隐藏。</span>
      `;
      section.appendChild(controls);
    }

    const list = document.createElement("ol");
    list.className = "practice-list";
    block.items.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="practice-text">${escapeHtml(item)}</span>
        <button type="button" class="inline-speech-button" data-speak="${escapeHtml(item)}" data-rate="0.78">听</button>
        <button type="button" class="inline-speech-button read-button" data-read-target="${escapeHtml(item)}">我的跟读</button>
        <div class="read-feedback" aria-live="polite"></div>
      `;
      list.appendChild(li);
    });
    section.appendChild(list);
  }

  if (block.type === "text") {
    const controls = document.createElement("div");
    controls.className = "listening-controls passage-controls";
    controls.innerHTML = `
      <button type="button" class="listening-control-button" data-passage-control>播放整段</button>
      <span class="listening-status" aria-live="polite">按一次播放整篇短文；点击单个英文单词可听发音并查翻译。</span>
      <div class="translation-tools">
        <input class="translation-input" type="text" placeholder="输入单词查中文" aria-label="输入单词查中文" />
        <button type="button" class="translation-button" data-translate-control>查翻译</button>
      </div>
      <div class="translation-result" aria-live="polite">点短文里的单词，或输入单词查询中文意思。</div>
    `;
    section.appendChild(controls);

    const paragraph = document.createElement("p");
    paragraph.className = "work-passage";
    paragraph.innerHTML = renderClickablePassage(block.body);
    section.appendChild(paragraph);
  }

  return section;
}

function getPhonetic(word) {
  return phoneticBank[String(word || "").toLowerCase()] || "";
}

function renderClickablePassage(text) {
  return String(text || "")
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) return part;
      const match = part.match(/^([^A-Za-z]*)([A-Za-z][A-Za-z'-]*)([^A-Za-z]*)$/);
      if (!match) return escapeHtml(part);

      const [, prefix, word, suffix] = match;
      return `${escapeHtml(prefix)}<button type="button" class="passage-word" data-speak="${escapeHtml(word)}" data-rate="0.72" title="点我听发音并查翻译">${escapeHtml(word)}</button>${escapeHtml(suffix)}`;
    })
    .join("");
}

function translateInputWord(button) {
  const section = button.closest(".content-block");
  const input = section?.querySelector(".translation-input");
  const word = input?.value?.trim() || "";
  showWordTranslation(button, word);
}

function showWordTranslation(sourceElement, rawWord) {
  const section = sourceElement.closest(".content-block");
  const result = section?.querySelector(".translation-result");
  const input = section?.querySelector(".translation-input");
  const word = normalizeLookupWord(rawWord);
  if (!result || !word) return;

  if (input) input.value = word;

  const translation = lookupTranslation(word);
  result.className = `translation-result ${translation ? "has-result" : "missing-result"}`;
  result.innerHTML = translation
    ? `<strong>${escapeHtml(word)}</strong><span>${escapeHtml(translation)}</span>`
    : `<strong>${escapeHtml(word)}</strong><span>暂未收录这个词。可以先记到复盘笔记里，我后续帮你补进词库。</span>`;
}

function normalizeLookupWord(word) {
  return String(word || "")
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/g, "")
    .trim();
}

function lookupTranslation(word) {
  const normalized = normalizeLookupWord(word);
  if (!normalized) return "";

  const fromWordBank = wordBank.find(([item]) => item.toLowerCase() === normalized);
  if (fromWordBank) return fromWordBank[1];

  return translationBank[normalized] || "";
}

function togglePassageReading(button) {
  if (activePassageSession?.button === button) {
    stopPassageReading();
    return;
  }

  stopListeningPractice();
  stopPassageReading();

  const section = button.closest(".content-block");
  const passage = section?.querySelector(".work-passage");
  const status = section?.querySelector(".listening-status");
  const text = passage?.textContent?.trim() || "";

  if (!section || !passage || !status || !text) return;

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    status.textContent = "当前浏览器不支持语音播放。请用 iPhone Safari 打开。";
    return;
  }

  window.speechSynthesis.cancel();

  activePassageSession = { button, section, status, passage };
  section.classList.add("passage-playing");
  button.textContent = "停止播放";
  button.classList.add("is-playing");
  status.textContent = "正在播放整篇短文。可以先只听，不看文字。";

  const utterance = createEnglishUtterance(text, 0.78);
  utterance.onend = () => finishPassageReading("整篇短文播放完成。现在可以点单个单词复听。");
  utterance.onerror = () => finishPassageReading("播放中断了，请再点一次播放整段。");
  window.speechSynthesis.speak(utterance);
}

function finishPassageReading(message) {
  if (!activePassageSession) return;

  const session = activePassageSession;
  activePassageSession = null;
  session.section.classList.remove("passage-playing");
  session.button.textContent = "重新播放";
  session.button.classList.remove("is-playing");
  session.status.textContent = message;
}

function stopPassageReading() {
  if (!activePassageSession) return;

  const session = activePassageSession;
  activePassageSession = null;
  window.speechSynthesis?.cancel();
  session.section.classList.remove("passage-playing");
  session.button.textContent = "播放整段";
  session.button.classList.remove("is-playing");
  session.status.textContent = "已停止。按一次播放整篇短文；点击单个英文单词可单独听。";
}

function toggleListeningPractice(button) {
  if (activeListeningSession?.button === button) {
    stopListeningPractice();
    return;
  }

  stopListeningPractice();

  const section = button.closest(".content-block");
  const items = Array.from(section?.querySelectorAll(".practice-list li") || []);
  const texts = items.map((item) => item.querySelector(".practice-text")?.textContent?.trim()).filter(Boolean);
  const status = section?.querySelector(".listening-status");

  if (!texts.length || !section || !status) return;

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    status.textContent = "当前浏览器不支持语音播放。请用 iPhone Safari 打开。";
    return;
  }

  window.speechSynthesis.cancel();

  activeListeningSession = {
    button,
    section,
    status,
    items,
    texts,
    index: 0,
    stopped: false
  };

  section.classList.add("focus-listening");
  button.textContent = "停止盲听";
  button.classList.add("is-playing");
  playNextListeningItem();
}

function playNextListeningItem() {
  const session = activeListeningSession;
  if (!session || session.stopped) return;

  session.items.forEach((item) => item.classList.remove("is-current"));

  if (session.index >= session.texts.length) {
    session.status.textContent = "本组听力播放完成。可以先默写，再点单句核对。";
    const doneButton = session.button;
    const doneSection = session.section;
    activeListeningSession = null;
    doneButton.textContent = "重新盲听";
    doneButton.classList.remove("is-playing");
    doneSection.classList.remove("focus-listening");
    return;
  }

  const currentText = session.texts[session.index];
  const currentItem = session.items[session.index];
  currentItem?.classList.add("is-current");
  session.status.textContent = `正在播放第 ${session.index + 1} / ${session.texts.length} 句。`;

  const utterance = createEnglishUtterance(currentText, 0.78);
  utterance.onend = () => {
    if (!activeListeningSession || activeListeningSession.stopped) return;
    activeListeningSession.index += 1;
    window.setTimeout(playNextListeningItem, 700);
  };
  utterance.onerror = () => {
    if (!activeListeningSession || activeListeningSession.stopped) return;
    activeListeningSession.status.textContent = "播放中断了，请再点一次开始盲听。";
    stopListeningPractice();
  };

  window.speechSynthesis.speak(utterance);
}

function stopListeningPractice() {
  if (!activeListeningSession) return;

  activeListeningSession.stopped = true;
  window.speechSynthesis?.cancel();
  activeListeningSession.section?.classList.remove("focus-listening");
  activeListeningSession.items?.forEach((item) => item.classList.remove("is-current"));
  activeListeningSession.button.textContent = "开始盲听";
  activeListeningSession.button.classList.remove("is-playing");
  activeListeningSession.status.textContent = "已停止。按一次后连续播放，本组文字会临时隐藏。";
  activeListeningSession = null;
}

function startFollowRead(button) {
  const targetText = button.dataset.readTarget || "";
  const feedback = button.closest(".word-card, li")?.querySelector(".read-feedback");
  if (!targetText || !feedback) return;

  if (!SpeechRecognitionApi) {
    feedback.className = "read-feedback warning";
    feedback.innerHTML = "当前浏览器不支持语音识别。请用 iPhone Safari 打开 HTTPS 网址，并允许麦克风权限。";
    return;
  }

  if (activeRecognition) {
    activeRecognition.abort();
    activeRecognition = null;
  }

  const recognition = new SpeechRecognitionApi();
  activeRecognition = recognition;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  button.disabled = true;
  button.textContent = "正在听...";
  feedback.className = "read-feedback listening";
  feedback.innerHTML = `请跟读：<strong>${escapeHtml(targetText)}</strong>`;

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || "";
    const result = compareReading(targetText, transcript);
    feedback.className = `read-feedback ${result.score >= 80 ? "good" : result.score >= 55 ? "ok" : "warning"}`;
    feedback.innerHTML = renderReadingFeedback(targetText, transcript, result);
  };

  recognition.onerror = (event) => {
    const message = event.error === "not-allowed"
      ? "没有麦克风权限。请在 Safari 里允许麦克风后再试。"
      : "这次没有识别成功，请放慢速度、靠近手机再读一遍。";
    feedback.className = "read-feedback warning";
    feedback.textContent = message;
  };

  recognition.onend = () => {
    button.disabled = false;
    button.textContent = "我的跟读";
    activeRecognition = null;
  };

  recognition.start();
}

function compareReading(targetText, transcript) {
  const targetWords = normalizeWords(targetText);
  const spokenWords = normalizeWords(transcript);
  const matched = [];
  const missing = [];
  const extra = [];
  const used = new Set();

  targetWords.forEach((word) => {
    const index = spokenWords.findIndex((spoken, spokenIndex) => !used.has(spokenIndex) && spoken === word);
    if (index >= 0) {
      used.add(index);
      matched.push(word);
    } else {
      missing.push(word);
    }
  });

  spokenWords.forEach((word, index) => {
    if (!used.has(index)) extra.push(word);
  });

  const score = targetWords.length ? Math.round((matched.length / targetWords.length) * 100) : 0;
  return { score, matched, missing, extra };
}

function normalizeWords(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9. ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function renderReadingFeedback(targetText, transcript, result) {
  const summary = result.score >= 80
    ? "很好，基本读对了。"
    : result.score >= 55
      ? "接近了，把漏掉的词再读慢一点。"
      : "先别急，跟着原音一句一句慢读。";
  const missing = result.missing.length ? result.missing.join(", ") : "无";
  const extra = result.extra.length ? result.extra.join(", ") : "无";
  return `
    <p><strong>得分：</strong>${result.score}% - ${summary}</p>
    <p><strong>目标：</strong>${escapeHtml(targetText)}</p>
    <p><strong>你读成：</strong>${escapeHtml(transcript || "没有识别到内容")}</p>
    <p><strong>需要重读：</strong>${escapeHtml(missing)}</p>
    <p><strong>多读/识别偏差：</strong>${escapeHtml(extra)}</p>
  `;
}

function speakEnglish(text, rate = 0.85) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    alert("当前浏览器不支持语音播放。请在 iPhone Safari 中打开。");
    return;
  }

  const cleanText = String(text || "").replace(/____/g, "your name").trim();
  if (!cleanText) return;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(createEnglishUtterance(cleanText, rate));
}

function createEnglishUtterance(text, rate = 0.85) {
  const cleanText = String(text || "").replace(/____/g, "your name").trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voices = window.speechSynthesis.getVoices();
  utterance.voice =
    voices.find((voice) => voice.lang === "en-US" && /Samantha|Ava|Allison|Susan|Karen/i.test(voice.name)) ||
    voices.find((voice) => voice.lang === "en-GB") ||
    voices.find((voice) => voice.lang.startsWith("en")) ||
    null;
  utterance.lang = utterance.voice?.lang || "en-US";
  utterance.rate = Math.min(Math.max(rate, 0.55), 1);
  utterance.pitch = 1;
  return utterance;
}

function persistCurrentDay() {
  const record = ensureRecord(currentDay);
  record.minutes = els.minutesInput.value;
  record.difficulty = els.difficultySelect.value;
  record.note = els.noteInput.value;
  record.blocker = els.blockerInput.value;
  saveState();
  updateStats();
}

function updateStats() {
  const records = state.records || {};
  const completedIndexes = Object.entries(records)
    .filter(([, record]) => record.completed)
    .map(([day]) => Number(day))
    .sort((a, b) => a - b);

  const minutes = Object.values(records).reduce((sum, record) => {
    return sum + (Number(record.minutes) || 0);
  }, 0);

  els.completedDays.textContent = String(completedIndexes.length);
  els.totalMinutes.textContent = String(minutes);
  els.streakDays.textContent = String(calculateStreak(completedIndexes));

  const record = ensureRecord(currentDay);
  const checked = record.tasks.filter(Boolean).length;
  const total = plans[currentDay].tasks.length;
  const percent = total ? Math.round((checked / total) * 100) : 0;
  els.taskProgressText.textContent = `${percent}%`;
  els.taskProgressBar.style.width = `${percent}%`;
}

function calculateStreak(completedIndexes) {
  if (!completedIndexes.length) return 0;
  let streak = 0;
  for (let index = 0; index < plans.length; index += 1) {
    if (completedIndexes.includes(index)) streak += 1;
    else if (index <= Math.max(...completedIndexes)) streak = 0;
  }
  return streak;
}

function ensureRecord(day) {
  state.records ||= {};
  state.records[day] ||= {
    tasks: Array(plans[day].tasks.length).fill(false),
    minutes: "",
    difficulty: "",
    note: "",
    blocker: "",
    completed: false,
    completedAt: ""
  };

  const record = state.records[day];
  while (record.tasks.length < plans[day].tasks.length) record.tasks.push(false);
  return record;
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { currentDay: 0, records: {} };
  } catch {
    return { currentDay: 0, records: {} };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
