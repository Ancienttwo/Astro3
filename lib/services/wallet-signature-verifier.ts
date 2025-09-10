/**
 * 钱包签名验证服务
 * 
 * 专门负责验证WalletConnect产生的签名
 * 确保签名的有效性和安全性
 */

import { ethers } from 'ethers'
import { WalletSignatureParams, WalletIntegrationError } from '../types/wallet-integration'

export class WalletSignatureVerifier {
  /**
   * 验证钱包签名
   * 
   * @param params 签名验证参数
   * @returns 验证是否通过
   */
  async verifySignature(params: WalletSignatureParams): Promise<boolean> {
    const { signature, message, walletAddress } = params

    console.log('🔐 开始验证钱包签名:', {
      walletAddress,
      messageLength: message.length,
      signatureLength: signature.length,
      messagePreview: message.substring(0, 100) + '...',
      signaturePreview: signature.substring(0, 20) + '...'
    })

    try {
      // 验证输入参数
      this.validateInputs(params)

      // 使用ethers.js验证签名
      const recoveredAddress = ethers.verifyMessage(message, signature)
      const normalizedRecovered = recoveredAddress.toLowerCase()
      const normalizedExpected = walletAddress.toLowerCase()

      console.log('🔐 签名验证结果:', {
        recoveredAddress: normalizedRecovered,
        expectedAddress: normalizedExpected,
        isMatch: normalizedRecovered === normalizedExpected
      })

      if (normalizedRecovered !== normalizedExpected) {
        console.error('❌ 签名验证失败: 钱包地址不匹配')
        throw new WalletIntegrationError(
          'Signature verification failed: address mismatch',
          'SIGNATURE_INVALID',
          {
            recovered: normalizedRecovered,
            expected: normalizedExpected
          }
        )
      }

      console.log('✅ 钱包签名验证成功:', normalizedExpected)
      return true

    } catch (error) {
      console.error('❌ 钱包签名验证过程中出现错误:', error)

      if (error instanceof WalletIntegrationError) {
        throw error
      }

      // 处理ethers.js的验证错误
      if (error instanceof Error) {
        if (error.message.includes('invalid signature')) {
          throw new WalletIntegrationError(
            'Invalid signature format',
            'SIGNATURE_INVALID',
            { originalError: error.message }
          )
        }
        
        if (error.message.includes('invalid hex string')) {
          throw new WalletIntegrationError(
            'Invalid signature hex format',
            'SIGNATURE_INVALID',
            { originalError: error.message }
          )
        }
      }

      throw new WalletIntegrationError(
        'Signature verification failed',
        'SIGNATURE_INVALID',
        { originalError: error }
      )
    }
  }

  /**
   * 验证输入参数的有效性
   */
  private validateInputs(params: WalletSignatureParams): void {
    const { signature, message, walletAddress } = params

    if (!signature || typeof signature !== 'string') {
      throw new WalletIntegrationError(
        'Signature is required and must be a string',
        'SIGNATURE_INVALID'
      )
    }

    if (!message || typeof message !== 'string') {
      throw new WalletIntegrationError(
        'Message is required and must be a string',
        'SIGNATURE_INVALID'
      )
    }

    if (!walletAddress || typeof walletAddress !== 'string') {
      throw new WalletIntegrationError(
        'Wallet address is required and must be a string',
        'SIGNATURE_INVALID'
      )
    }

    // 验证钱包地址格式
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!ethAddressRegex.test(walletAddress)) {
      throw new WalletIntegrationError(
        'Invalid Ethereum address format',
        'SIGNATURE_INVALID',
        { address: walletAddress }
      )
    }

    // 规范化签名格式
    let normalizedSignature = signature
    if (!normalizedSignature.startsWith('0x')) {
      normalizedSignature = '0x' + normalizedSignature
    }

    // 验证签名是有效的十六进制字符串
    const hexPattern = /^0x[a-fA-F0-9]+$/
    if (!hexPattern.test(normalizedSignature)) {
      throw new WalletIntegrationError(
        'Invalid signature format - must be hexadecimal',
        'SIGNATURE_INVALID',
        { 
          signature: signature.substring(0, 20) + '...',
          length: signature.length 
        }
      )
    }

    // 验证签名长度 (允许130-132个字符的范围以支持不同钱包)
    // 标准以太坊签名：65字节 = 130个十六进制字符 + "0x" = 132个字符
    // 某些钱包可能返回131个字符 (去掉前导零)
    const expectedLengths = [131, 132] // 131 (129 hex + 0x) or 132 (130 hex + 0x)
    if (!expectedLengths.includes(normalizedSignature.length)) {
      throw new WalletIntegrationError(
        'Invalid signature length - expected 130 or 132 characters',
        'SIGNATURE_INVALID',
        { 
          signature: signature.substring(0, 20) + '...',
          length: signature.length,
          normalizedLength: normalizedSignature.length
        }
      )
    }

    // 更新参数中的签名为规范化版本
    params.signature = normalizedSignature

    console.log('✅ 输入参数验证通过')
  }

  /**
   * 验证消息是否符合EIP-4361标准 (Sign-In with Ethereum)
   */
  validateSIWEMessage(message: string): boolean {
    try {
      // 基本的SIWE消息格式检查
      const lines = message.split('\n')
      
      // 应该包含域名
      if (!lines[0] || !lines[0].includes(' wants you to sign in')) {
        return false
      }

      // 应该包含地址
      const addressLine = lines.find(line => line.startsWith('0x'))
      if (!addressLine) {
        return false
      }

      // 应该包含nonce
      const nonceLine = lines.find(line => line.startsWith('Nonce:'))
      if (!nonceLine) {
        return false
      }

      console.log('✅ SIWE消息格式验证通过')
      return true

    } catch (error) {
      console.warn('⚠️ SIWE消息格式验证失败:', error)
      return false
    }
  }

  /**
   * 从消息中提取钱包地址
   */
  extractAddressFromMessage(message: string): string | null {
    try {
      const lines = message.split('\n')
      const addressLine = lines.find(line => line.match(/^0x[a-fA-F0-9]{40}$/))
      return addressLine || null
    } catch (error) {
      console.error('❌ 从消息中提取地址失败:', error)
      return null
    }
  }
}

// 导出单例实例
export const walletSignatureVerifier = new WalletSignatureVerifier()