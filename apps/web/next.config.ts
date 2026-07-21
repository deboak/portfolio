import type { NextConfig } from 'next';
const development=process.env.NODE_ENV!=='production';
const securityHeaders=[{key:'Content-Security-Policy',value:`default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${development?" 'unsafe-eval'":''}; connect-src 'self'${development?' http://localhost:4000':''} https:; frame-src https:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';${development?'':' upgrade-insecure-requests;'}`},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},{key:'X-Content-Type-Options',value:'nosniff'},{key:'X-Frame-Options',value:'DENY'}];
const config: NextConfig = { output:'standalone',poweredByHeader:false,async headers(){return[{source:'/:path*',headers:securityHeaders}]} };
export default config;
