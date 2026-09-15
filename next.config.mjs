/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Lets the dev server accept requests from these LAN IPs too (e.g.
  // testing on a phone) instead of only localhost. This machine has two
  // adapters — regular Wi-Fi and the Windows Mobile Hotspot virtual
  // adapter — so both are listed since either could be how a phone reaches it.
  allowedDevOrigins: ["192.168.0.123", "192.168.137.1"],
};

export default nextConfig;
