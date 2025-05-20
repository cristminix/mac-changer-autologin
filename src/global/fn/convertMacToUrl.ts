export function convertMacToUrl(mac:string,loginUrl:string) {
  const upperMac = mac.toUpperCase();
  const encodedMac = encodeURIComponent(`T-${upperMac}`);
  return `${loginUrl}?dst=&username=${encodedMac}`;
}