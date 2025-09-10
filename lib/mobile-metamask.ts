/**
 * 移动端MetaMask深度链接集成
 * 支持在手机浏览器中调起MetaMask APP进行签名
 */

interface MobileDetectionResult {
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isMetaMaskMobile: boolean
  hasMetaMaskApp: boolean
}

export class MobileMetaMaskHelper {
  /**
   * 检测移动端环境
   */
  static detectMobileEnvironment(): MobileDetectionResult {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isIOS: false,
        isAndroid: false,
        isMetaMaskMobile: false,
        hasMetaMaskApp: false
      }
    }

    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isIOS = /iphone|ipad|ipod/i.test(userAgent)
    const isAndroid = /android/i.test(userAgent)
    const isMetaMaskMobile = /metamask/i.test(userAgent)
    
    // 检测是否有MetaMask APP (通过检测ethereum对象)
    const hasMetaMaskApp = Boolean(window.ethereum?.isMetaMask)

    return {
      isMobile,
      isIOS,
      isAndroid,
      isMetaMaskMobile,
      hasMetaMaskApp
    }
  }

  /**
   * 生成MetaMask深度链接
   */
  static generateDeepLink(params: {
    method: string
    params: any[]
    dappUrl: string
  }): string {
    const { method, params: methodParams, dappUrl } = params
    
    const deepLinkParams = {
      method,
      params: methodParams,
      dappUrl,
      chainId: '0x38', // BSC mainnet - 可以动态设置
    }

    // 对参数进行编码
    const encodedParams = encodeURIComponent(JSON.stringify(deepLinkParams))
    
    // MetaMask深度链接格式
    return `https://metamask.app.link/dapp/${dappUrl}?params=${encodedParams}`
  }

  /**
   * 为移动端优化的签名请求
   */
  static async requestSignatureOnMobile(
    message: string, 
    address: string,
    options: {
      fallbackToNormal?: boolean
      timeout?: number
    } = {}
  ): Promise<string> {
    const { fallbackToNormal = true, timeout = 60000 } = options
    const detection = this.detectMobileEnvironment()

    console.log('🔍 移动端环境检测:', detection)

    if (!detection.isMobile) {
      // 非移动端，使用常规方式
      return this.requestNormalSignature(message, address)
    }

    // 移动端处理
    if (detection.isMetaMaskMobile) {
      // 在MetaMask APP内，直接使用window.ethereum
      console.log('📱 在MetaMask APP内，使用内置ethereum')
      return this.requestNormalSignature(message, address)
    }

    if (detection.hasMetaMaskApp && window.ethereum) {
      // 有MetaMask扩展，先尝试常规方式
      console.log('📱 检测到MetaMask，尝试常规签名...')
      try {
        return await this.requestNormalSignature(message, address)
      } catch (error) {
        console.log('❌ 常规签名失败，尝试深度链接:', error)
        if (fallbackToNormal) {
          return this.requestSignatureViaDeepLink(message, address, timeout)
        }
        throw error
      }
    }

    // 没有MetaMask或需要使用深度链接
    console.log('📱 使用深度链接调起MetaMask APP')
    return this.requestSignatureViaDeepLink(message, address, timeout)
  }

  /**
   * 通过深度链接请求签名
   */
  static async requestSignatureViaDeepLink(
    message: string,
    address: string,
    timeout: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const detection = this.detectMobileEnvironment()
      
      // 创建深度链接
      const currentUrl = window.location.origin
      const deepLinkUrl = this.generateDeepLink({
        method: 'personal_sign',
        params: [message, address],
        dappUrl: currentUrl
      })

      console.log('🔗 生成的深度链接:', deepLinkUrl)

      // 显示用户指引
      this.showMobileSigningInstructions(deepLinkUrl, detection)

      // 监听页面可见性变化 (用户从MetaMask返回)
      let isResolved = false
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && !isResolved) {
          console.log('📱 用户返回页面，检查签名结果...')
          this.checkSignatureResult(message, address)
            .then(signature => {
              if (signature) {
                isResolved = true
                resolve(signature)
                this.hideMobileSigningInstructions()
              }
            })
            .catch(console.error)
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      // 超时处理
      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          document.removeEventListener('visibilitychange', handleVisibilityChange)
          this.hideMobileSigningInstructions()
          reject(new Error(`Signature request timeout (${timeout / 1000}s)`))
        }
      }, timeout)

      // 打开深度链接
      try {
        if (detection.isIOS) {
          // iOS: 使用 window.location.href
          window.location.href = deepLinkUrl
        } else if (detection.isAndroid) {
          // Android: 创建隐藏的a标签点击
          const link = document.createElement('a')
          link.href = deepLinkUrl
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else {
          // 其他情况
          window.open(deepLinkUrl, '_blank')
        }
      } catch (error) {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        clearTimeout(timeoutId)
        this.hideMobileSigningInstructions()
        reject(new Error('Unable to open MetaMask APP: ' + error.message))
      }
    })
  }

  /**
   * 常规签名请求
   */
  static async requestNormalSignature(message: string, address: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found')
    }

    return await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address]
    })
  }

  /**
   * 检查签名结果 (模拟检查，实际可能需要服务器端配合)
   */
  static async checkSignatureResult(message: string, address: string): Promise<string | null> {
    // 这里可以实现检查逻辑
    // 例如：检查localStorage、调用API等
    // 目前返回null，表示需要其他方式获取签名
    return null
  }

  /**
   * 显示移动端签名指引
   */
  static showMobileSigningInstructions(deepLinkUrl: string, detection: MobileDetectionResult) {
    // 移除现有的指引弹窗
    this.hideMobileSigningInstructions()

    const overlay = document.createElement('div')
    overlay.id = 'metamask-mobile-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `

    const modal = document.createElement('div')
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin: 20px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `

    const title = document.createElement('h3')
    title.textContent = 'Open MetaMask to Sign'
    title.style.cssText = `
      margin: 0 0 16px 0;
      color: #1a1a1a;
      font-size: 20px;
      font-weight: 600;
    `

    const description = document.createElement('p')
    description.innerHTML = `
      Please complete the signature in MetaMask APP,<br>
      then return to this page.
    `
    description.style.cssText = `
      margin: 0 0 24px 0;
      color: #666;
      font-size: 16px;
      line-height: 1.5;
    `

    const buttonContainer = document.createElement('div')
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      flex-direction: column;
    `

    const openButton = document.createElement('button')
    openButton.textContent = '🦊 Open MetaMask'
    openButton.style.cssText = `
      background: #f6851b;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    `
    openButton.onmouseover = () => openButton.style.background = '#e2761b'
    openButton.onmouseout = () => openButton.style.background = '#f6851b'
    openButton.onclick = () => {
      try {
        if (detection.isIOS) {
          window.location.href = deepLinkUrl
        } else {
          window.open(deepLinkUrl, '_blank')
        }
      } catch (error) {
        console.error('Failed to open MetaMask:', error)
      }
    }

    const cancelButton = document.createElement('button')
    cancelButton.textContent = 'Cancel'
    cancelButton.style.cssText = `
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
    `
    cancelButton.onmouseover = () => {
      cancelButton.style.background = '#f5f5f5'
      cancelButton.style.borderColor = '#bbb'
    }
    cancelButton.onmouseout = () => {
      cancelButton.style.background = 'transparent'
      cancelButton.style.borderColor = '#ddd'
    }
    cancelButton.onclick = () => this.hideMobileSigningInstructions()

    buttonContainer.appendChild(openButton)
    buttonContainer.appendChild(cancelButton)

    modal.appendChild(title)
    modal.appendChild(description)
    modal.appendChild(buttonContainer)
    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    // 添加点击外部关闭功能
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.hideMobileSigningInstructions()
      }
    }
  }

  /**
   * 隐藏移动端签名指引
   */
  static hideMobileSigningInstructions() {
    const overlay = document.getElementById('metamask-mobile-overlay')
    if (overlay) {
      overlay.remove()
    }
  }

  /**
   * 检查是否可以使用深度链接
   */
  static canUseDeepLink(): boolean {
    const detection = this.detectMobileEnvironment()
    return detection.isMobile && !detection.isMetaMaskMobile
  }

  /**
   * 获取适合的MetaMask安装链接
   */
  static getMetaMaskInstallUrl(): string {
    const detection = this.detectMobileEnvironment()
    
    if (detection.isIOS) {
      return 'https://apps.apple.com/app/metamask/id1438144202'
    } else if (detection.isAndroid) {
      return 'https://play.google.com/store/apps/details?id=io.metamask'
    } else {
      return 'https://metamask.io/download/'
    }
  }
}