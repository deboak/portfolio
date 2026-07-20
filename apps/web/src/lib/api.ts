export type Project = { id:string; title:string; slug:string; summary:string; description:string; technologies:string[]; repositoryUrl:string|null; liveUrl:string|null; featured:boolean };
export type Post = { id:string; title:string; slug:string; excerpt:string; content:string; publishedAt:string|null };
const baseUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
async function get<T>(path:string):Promise<T> { const response = await fetch(`${baseUrl}${path}`, { next: { revalidate: 60 } }); if (!response.ok) throw new Error(`API request failed: ${response.status}`); return (await response.json()).data as T; }
export const api = { projects:()=>get<Project[]>('/projects'), project:(slug:string)=>get<Project>(`/projects/${slug}`), posts:()=>get<Post[]>('/posts'), post:(slug:string)=>get<Post>(`/posts/${slug}`) };
