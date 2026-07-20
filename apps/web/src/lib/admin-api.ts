'use client';
const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
let accessToken: string | null = null;
const csrf = () => sessionStorage.getItem('csrf_token') ?? decodeURIComponent(document.cookie.split('; ').find(v=>v.startsWith('csrf_token='))?.split('=')[1] ?? '');

async function raw(path:string, init:RequestInit={}) { const multipart=typeof FormData!=='undefined'&&init.body instanceof FormData;return fetch(`${base}${path}`, { ...init, credentials:'include', headers:{...(multipart?{}:{'content-type':'application/json'}),...init.headers} }); }
async function refresh() { let token=csrf(); if(!token){const setup=await raw('/auth/csrf');if(!setup.ok)return false;token=(await setup.json()).data.csrfToken;sessionStorage.setItem('csrf_token',token)} const response=await raw('/auth/refresh',{method:'POST',headers:{'x-csrf-token':token}}); if(!response.ok) return false; const data=(await response.json()).data;accessToken=data.accessToken;sessionStorage.setItem('csrf_token',data.csrfToken);return true; }

export async function adminFetch<T>(path:string, init:RequestInit={}, retry=true):Promise<T> {
  const method=(init.method??'GET').toUpperCase();
  const headers:Record<string,string>={...(init.headers as Record<string,string>),...(accessToken?{authorization:`Bearer ${accessToken}`}:{})};
  if(!['GET','HEAD'].includes(method)) headers['x-csrf-token']=csrf();
  let response=await raw(path,{...init,headers});
  if(response.status===401 && retry && await refresh()) return adminFetch<T>(path,init,false);
  if(!response.ok){const body=await response.json().catch(()=>null);throw new Error(body?.error?.message??`Request failed (${response.status})`)}
  return response.status===204 ? undefined as T : (await response.json()).data as T;
}
export async function login(email:string,password:string){const response=await raw('/auth/login',{method:'POST',body:JSON.stringify({email,password})});const body=await response.json();if(!response.ok)throw new Error(body?.error?.message??'Login failed');accessToken=body.data.accessToken;sessionStorage.setItem('csrf_token',body.data.csrfToken);return body.data;}
export async function logout(){await adminFetch<void>('/auth/logout',{method:'POST'});accessToken=null;sessionStorage.removeItem('csrf_token');}

export type LiveNotification={id:string;type:'contact.submitted'|'contact.updated'|'media.updated'|'system';title:string;message:string;createdAt:string;data?:Record<string,unknown>};
export async function streamAdminNotifications(signal:AbortSignal,onNotification:(event:LiveNotification)=>void,onConnected?:()=>void){
  if(!accessToken&&!await refresh())throw new Error('Authentication required');
  let response=await raw('/admin/notifications/stream',{headers:{authorization:`Bearer ${accessToken}`},signal});
  if(response.status===401&&await refresh())response=await raw('/admin/notifications/stream',{headers:{authorization:`Bearer ${accessToken}`},signal});
  if(!response.ok||!response.body)throw new Error(`Live notifications unavailable (${response.status})`);
  const reader=response.body.getReader();const decoder=new TextDecoder();let buffer='';onConnected?.();
  while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true}).replaceAll('\r\n','\n');let boundary=buffer.indexOf('\n\n');while(boundary>=0){const block=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);boundary=buffer.indexOf('\n\n');if(block.startsWith(':'))continue;let event='message';const data:string[]=[];for(const line of block.split('\n')){if(line.startsWith('event:'))event=line.slice(6).trim();if(line.startsWith('data:'))data.push(line.slice(5).trimStart())}if(event==='notification'&&data.length){try{onNotification(JSON.parse(data.join('\n')) as LiveNotification)}catch{}}}}
}
