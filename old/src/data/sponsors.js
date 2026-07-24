/**
 * 赞助 / 捐赠页面配置
 *
 * 修改此文件即可更新收款码和捐赠名单，无需改动页面组件代码。
 */

// 收款码图片路径（相对于 public/ 目录）
export const alipayQrCode = '/alipay-qrcode.png'

// 捐赠名单
// name  - 捐赠人姓名（必填）
// amount - 捐赠金额（必填，字符串，如 "10.00" 或 "一杯奶茶"）
// message - 赠言（可选，留空或删除该字段则不显示）
export const donors = [
  // 示例数据（请替换为真实捐赠记录）：
  //{ name: '匿名用户', amount: '6.66', message: '加油！' },
  // { name: '张三', amount: '18.88' },
  // { name: '李四', amount: '50.00', message: '项目很有用，支持一下~' },
]
