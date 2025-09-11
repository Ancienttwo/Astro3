/**
 * 微信支付模块
 * 支持JSAPI支付（公众号内支付）
 */

import crypto from 'crypto'
import axios from 'axios'

export interface WechatPayConfig {
  appId: string
  mchId: string
  key: string
  notifyUrl: string
  certPath?: string
  keyPath?: string
}

export interface WechatPayOrder {
  out_trade_no: string
  total_fee: number
  body: string
  openid: string
  spbill_create_ip?: string
  time_start?: string
  time_expire?: string
  goods_tag?: string
  product_id?: string
  attach?: string
}

export interface WechatPayResult {
  return_code: string
  return_msg: string
  result_code?: string
  err_code?: string
  err_code_des?: string
  prepay_id?: string
  code_url?: string
  trade_type?: string
}

// 通用XML解析结果映射
export type WechatXmlMap = Record<string, string>

// 统一下单返回（字符串字段为主）
export interface WechatUnifiedOrderResponse extends WechatXmlMap {
  return_code: string
  return_msg?: string
  result_code?: string
  prepay_id?: string
  code_url?: string
  trade_type?: string
}

// 订单查询返回
export interface WechatOrderQueryResponse extends WechatXmlMap {
  return_code: string
  return_msg?: string
  result_code?: string
  trade_state?: string
  transaction_id?: string
  out_trade_no?: string
}

// 关闭订单返回
export interface WechatCloseOrderResponse extends WechatXmlMap {
  return_code: string
  return_msg?: string
  result_code?: string
}

// 支付回调解析后的结果
export interface WechatPaymentCallbackData extends WechatXmlMap {
  return_code: string
  result_code?: string
  out_trade_no?: string
  transaction_id?: string
  total_fee?: string
}

export interface WechatJSAPIParams {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

export class WechatPay {
  private config: WechatPayConfig

  constructor(config: WechatPayConfig) {
    this.config = config
  }

  /**
   * 创建统一下单
   * @param order 订单信息
   * @returns 支付结果
   */
  async createOrder(order: WechatPayOrder): Promise<WechatUnifiedOrderResponse> {
    const url = 'https://api.mch.weixin.qq.com/pay/unifiedorder'
    
    const params = {
      appid: this.config.appId,
      mch_id: this.config.mchId,
      nonce_str: this.generateNonceStr(),
      body: order.body,
      out_trade_no: order.out_trade_no,
      total_fee: order.total_fee,
      spbill_create_ip: order.spbill_create_ip || '127.0.0.1',
      notify_url: this.config.notifyUrl,
      trade_type: 'JSAPI',
      openid: order.openid,
      ...(order.time_start && { time_start: order.time_start }),
      ...(order.time_expire && { time_expire: order.time_expire }),
      ...(order.goods_tag && { goods_tag: order.goods_tag }),
      ...(order.product_id && { product_id: order.product_id }),
      ...(order.attach && { attach: order.attach })
    }

    // 生成签名
    const sign = this.generateSign(params)
    const payload: any = { ...params, sign }

    // 转换为XML格式
    const xml = this.objectToXml(payload)

    try {
      const response = await axios.post(url, xml, {
        headers: {
          'Content-Type': 'application/xml'
        }
      })

      const result = this.xmlToObject(response.data)
      return result
    } catch (error) {
      console.error('创建微信支付订单失败:', error)
      throw error
    }
  }

  /**
   * 生成JSAPI支付参数
   * @param prepayId 预支付ID
   * @returns JSAPI支付参数
   */
  generateJSAPIParams(prepayId: string): WechatJSAPIParams {
    const timeStamp = Math.floor(Date.now() / 1000).toString()
    const nonceStr = this.generateNonceStr()
    const packageStr = `prepay_id=${prepayId}`
    const signType = 'MD5'

    const params = {
      appId: this.config.appId,
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      package: packageStr,
      signType: signType
    }

    const paySign = this.generateSign(params)

    return {
      ...params,
      paySign: paySign
    }
  }

  /**
   * 处理支付回调
   * @param xmlData 回调XML数据
   * @returns 处理结果
   */
  async handlePaymentCallback(xmlData: string): Promise<WechatPaymentCallbackData> {
    const data = this.xmlToObject(xmlData)

    // 验证签名
    const sign = data.sign
    delete data.sign
    const calculatedSign = this.generateSign(data)

    if (sign !== calculatedSign) {
      throw new Error('支付回调签名验证失败')
    }

    // 验证支付结果
    if (data.return_code !== 'SUCCESS' || data.result_code !== 'SUCCESS') {
      throw new Error(`支付失败: ${data.return_msg || data.err_code_des}`)
    }

    return data as WechatPaymentCallbackData
  }

  /**
   * 查询订单状态
   * @param outTradeNo 商户订单号
   * @returns 订单状态
   */
  async queryOrder(outTradeNo: string): Promise<WechatOrderQueryResponse> {
    const url = 'https://api.mch.weixin.qq.com/pay/orderquery'
    
    const params = {
      appid: this.config.appId,
      mch_id: this.config.mchId,
      out_trade_no: outTradeNo,
      nonce_str: this.generateNonceStr()
    }

    const sign = this.generateSign(params)
    const payload: any = { ...params, sign }

    const xml = this.objectToXml(payload)

    try {
      const response = await axios.post(url, xml, {
        headers: {
          'Content-Type': 'application/xml'
        }
      })

      return this.xmlToObject(response.data) as WechatOrderQueryResponse
    } catch (error) {
      console.error('查询微信支付订单失败:', error)
      throw error
    }
  }

  /**
   * 关闭订单
   * @param outTradeNo 商户订单号
   * @returns 关闭结果
   */
  async closeOrder(outTradeNo: string): Promise<WechatCloseOrderResponse> {
    const url = 'https://api.mch.weixin.qq.com/pay/closeorder'
    
    const params = {
      appid: this.config.appId,
      mch_id: this.config.mchId,
      out_trade_no: outTradeNo,
      nonce_str: this.generateNonceStr()
    }

    const sign = this.generateSign(params)
    const payload: any = { ...params, sign }

    const xml = this.objectToXml(payload)

    try {
      const response = await axios.post(url, xml, {
        headers: {
          'Content-Type': 'application/xml'
        }
      })

      return this.xmlToObject(response.data) as WechatCloseOrderResponse
    } catch (error) {
      console.error('关闭微信支付订单失败:', error)
      throw error
    }
  }

  /**
   * 生成随机字符串
   * @param length 长度
   * @returns 随机字符串
   */
  private generateNonceStr(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 生成签名
   * @param params 参数对象
   * @returns 签名
   */
  private generateSign(params: any): string {
    // 排序参数
    const sortedKeys = Object.keys(params).sort()
    const sortedParams = sortedKeys.map(key => `${key}=${params[key]}`).join('&')
    
    // 添加密钥
    const stringSignTemp = `${sortedParams}&key=${this.config.key}`
    
    // MD5签名并转大写
    return crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase()
  }

  /**
   * 对象转XML
   * @param obj 对象
   * @returns XML字符串
   */
  private objectToXml(obj: any): string {
    let xml = '<xml>'
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        xml += `<${key}>${obj[key]}</${key}>`
      }
    }
    xml += '</xml>'
    return xml
  }

  /**
   * XML转对象
   * @param xml XML字符串
   * @returns 对象
   */
  private xmlToObject(xml: string): WechatXmlMap {
    const obj: WechatXmlMap = {}
    const regex = /<(\w+)>([^<]*)<\/\1>/g
    let match
    
    while ((match = regex.exec(xml)) !== null) {
      obj[match[1]] = match[2]
    }
    
    return obj
  }

  /**
   * 验证回调签名
   * @param params 参数对象
   * @param sign 签名
   * @returns 是否验证通过
   */
  verifySign(params: WechatXmlMap, sign: string): boolean {
    const calculatedSign = this.generateSign(params)
    return calculatedSign === sign
  }
}

// 工厂函数，用于创建微信支付实例
export function createWechatPay(): WechatPay {
  const config: WechatPayConfig = {
    appId: process.env.WECHAT_APP_ID || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    key: process.env.WECHAT_PAY_KEY || '',
    notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/wechat/pay/notify`
  }

  if (!config.appId || !config.mchId || !config.key) {
    throw new Error('微信支付配置缺失，请检查环境变量')
  }

  return new WechatPay(config)
}

// 生成订单号
export function generateOutTradeNo(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}${random}`
} 
