export function formatAddress(address?: string | null, size: number = 4) {
  if (!address) return "";
  if (address.length <= 2 + size * 2) return address;
  return `${address.slice(0, 6)}...${address.slice(-size)}`;
}

