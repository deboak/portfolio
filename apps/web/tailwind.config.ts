import type { Config } from 'tailwindcss';
export default { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#f5f5f7', accent: '#2997ff' }, boxShadow:{soft:'0 24px 70px rgba(0,0,0,.38)'} } }, plugins: [] } satisfies Config;
