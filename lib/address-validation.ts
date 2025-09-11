import { isAddress as viemIsAddress, getAddress as viemGetAddress, zeroAddress, createPublicClient, http } from 'viem'

/**
 * 验证以太坊地址格式和校验和
 * 使用ethers.js的getAddress进行完整验证
 */
export function validateEthereumAddress(address: string): boolean {
  try {
    if (!address || typeof address !== 'string') return false;
    if (!viemIsAddress(address)) return false;
    const checksumAddress = viemGetAddress(address);
    return (
      checksumAddress === address || checksumAddress.toLowerCase() === address.toLowerCase()
    );
  } catch {
    return false;
  }
}

/**
 * 获取标准化的校验和地址
 */
export function getChecksumAddress(address: string): string | null {
  try {
    return viemGetAddress(address);
  } catch (error) {
    return null;
  }
}

/**
 * 检查地址是否为已知的恶意地址
 */
export function isKnownMaliciousAddress(address: string): boolean {
  const maliciousAddresses = new Set([
    // 已知的恶意地址列表（示例）
    '0x0000000000000000000000000000000000000000', // 零地址
    '0x000000000000000000000000000000000000dead', // 销毁地址
    // 可以添加更多已知恶意地址
  ])
  
  try {
    const checksumAddress = viemGetAddress(address.toLowerCase())
    return (
      maliciousAddresses.has(checksumAddress.toLowerCase()) ||
      checksumAddress.toLowerCase() === zeroAddress
    )
  } catch {
    return true // 无效地址也视为恶意
  }
}

/**
 * 验证地址是否为合约地址（需要provider）
 * 注意：这个函数需要网络请求，在API路由中谨慎使用
 */
export async function isContractAddress(address: string, providerUrl?: string): Promise<boolean> {
  try {
    if (!providerUrl) return false;
    const client = createPublicClient({ transport: http(providerUrl) });
    const code = await client.getBytecode({ address: viemGetAddress(address) as `0x${string}` });
    return !!code && code !== '0x';
  } catch (error) {
    console.warn('合约地址检查失败:', error);
    return false;
  }
}

/**
 * 完整的地址安全验证
 */
export function validateAddressSecurity(address: string): {
  isValid: boolean
  isChecksum: boolean
  isMalicious: boolean
  normalizedAddress: string | null
  errors: string[]
} {
  const errors: string[] = []
  let isValid = false
  let isChecksum = false
  let normalizedAddress: string | null = null
  
  // 基础格式验证
  if (!address || typeof address !== 'string') {
    errors.push('地址不能为空')
    return { isValid, isChecksum, isMalicious: true, normalizedAddress, errors }
  }
  
  // 长度和前缀检查
  if (!address.startsWith('0x') || address.length !== 42) {
    errors.push('地址格式无效')
    return { isValid, isChecksum, isMalicious: true, normalizedAddress, errors }
  }
  
  // 十六进制字符检查
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    errors.push('地址包含无效字符')
    return { isValid, isChecksum, isMalicious: true, normalizedAddress, errors }
  }
  
  // viem完整验证
  try {
    if (!viemIsAddress(address)) throw new Error('Invalid address');
    normalizedAddress = viemGetAddress(address)
    isValid = true
    isChecksum = normalizedAddress === address || normalizedAddress.toLowerCase() === address.toLowerCase()
  } catch (error) {
    errors.push('地址校验和验证失败')
    return { isValid, isChecksum, isMalicious: true, normalizedAddress, errors }
  }
  
  // 恶意地址检查
  const isMalicious = isKnownMaliciousAddress(address)
  if (isMalicious) {
    errors.push('检测到恶意地址')
  }
  
  return {
    isValid,
    isChecksum,
    isMalicious,
    normalizedAddress,
    errors
  }
}
