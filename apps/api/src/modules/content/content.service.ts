import { cache } from '../../lib/cache.js';
import { AppError } from '../../lib/errors.js';
import { postRepository, projectRepository } from './content.repository.js';
import type { ListQuery, PostInput, ProjectInput } from './content.schemas.js';

const keys = { projects: 'content:projects', posts: 'content:posts', project: (slug:string)=>`content:project:${slug}`, post: (slug:string)=>`content:post:${slug}` };
const required = async <T>(value: Promise<T | null>) => { const result=await value; if(!result)throw new AppError(404,'Content not found','NOT_FOUND'); return result; };
async function cached<T>(key:string, load:()=>Promise<T>){const hit=await cache.get<T>(key);if(hit)return hit;const value=await load();await cache.set(key,value);return value;}
async function invalidateProjects(){await Promise.all([cache.deleteByPrefix(keys.projects),cache.deleteByPrefix('content:project:')]);}
async function invalidatePosts(){await Promise.all([cache.deleteByPrefix(keys.posts),cache.deleteByPrefix('content:post:')]);}

export const contentService = {
  projects: (publishedOnly=true,page:ListQuery={limit:20}) => publishedOnly ? cached(`${keys.projects}:${page.cursor??'first'}:${page.limit}`,()=>projectRepository.list(true,page)) : projectRepository.list(false,page),
  project: (slug:string) => cached(keys.project(slug),()=>required(projectRepository.bySlug(slug))),
  async createProject(data:ProjectInput){const value=await projectRepository.create(data);await invalidateProjects();return value;},
  async updateProject(id:string,data:ProjectInput){const value=await projectRepository.update(id,data);await invalidateProjects();return value;},
  async deleteProject(id:string){const value=await projectRepository.remove(id);await invalidateProjects();return value;},
  posts: (publishedOnly=true,page:ListQuery={limit:20}) => publishedOnly ? cached(`${keys.posts}:${page.cursor??'first'}:${page.limit}`,()=>postRepository.list(true,page)) : postRepository.list(false,page),
  post: (slug:string) => cached(keys.post(slug),()=>required(postRepository.bySlug(slug))),
  async createPost(data:PostInput){const value=await postRepository.create(data);await invalidatePosts();return value;},
  async updatePost(id:string,data:PostInput){const value=await postRepository.update(id,data);await invalidatePosts();return value;},
  async deletePost(id:string){const value=await postRepository.remove(id);await invalidatePosts();return value;}
};
