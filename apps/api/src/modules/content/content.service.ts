import type { cache } from '../../lib/cache.js';
import { AppError } from '../../lib/errors.js';
import type { PostRepository, ProjectRepository } from './content.repository.js';
import type { ListQuery, PostInput, ProjectInput } from './content.schemas.js';
const keys = {
  projects: 'content:projects',
  posts: 'content:posts',
  project: (slug: string) => `content:project:${slug}`,
  post: (slug: string) => `content:post:${slug}`,
};
export class ContentService {
  constructor(
    private readonly projectsRepository: ProjectRepository,
    private readonly postsRepository: PostRepository,
    private readonly cacheStore: typeof cache,
  ) {}
  private async required<T>(value: Promise<T | null>) {
    const result = await value;
    if (!result) throw new AppError(404, 'Content not found', 'NOT_FOUND');
    return result;
  }
  private async cached<T>(key: string, load: () => Promise<T>) {
    const hit = await this.cacheStore.get<T>(key);
    if (hit) return hit;
    const value = await load();
    await this.cacheStore.set(key, value);
    return value;
  }
  private invalidateProjects() {
    return Promise.all([
      this.cacheStore.deleteByPrefix(keys.projects),
      this.cacheStore.deleteByPrefix('content:project:'),
    ]);
  }
  private invalidatePosts() {
    return Promise.all([
      this.cacheStore.deleteByPrefix(keys.posts),
      this.cacheStore.deleteByPrefix('content:post:'),
    ]);
  }
  projects(publishedOnly = true, page: ListQuery = { limit: 20 }) {
    return publishedOnly
      ? this.cached(`${keys.projects}:${page.cursor ?? 'first'}:${page.limit}`, () =>
          this.projectsRepository.list(true, page),
        )
      : this.projectsRepository.list(false, page);
  }
  project(slug: string) {
    return this.cached(keys.project(slug), () =>
      this.required(this.projectsRepository.bySlug(slug)),
    );
  }
  async createProject(data: ProjectInput) {
    const value = await this.projectsRepository.create(data);
    await this.invalidateProjects();
    return value;
  }
  async updateProject(id: string, data: ProjectInput) {
    const value = await this.projectsRepository.update(id, data);
    await this.invalidateProjects();
    return value;
  }
  async deleteProject(id: string) {
    const value = await this.projectsRepository.remove(id);
    await this.invalidateProjects();
    return value;
  }
  posts(publishedOnly = true, page: ListQuery = { limit: 20 }) {
    return publishedOnly
      ? this.cached(`${keys.posts}:${page.cursor ?? 'first'}:${page.limit}`, () =>
          this.postsRepository.list(true, page),
        )
      : this.postsRepository.list(false, page);
  }
  post(slug: string) {
    return this.cached(keys.post(slug), () => this.required(this.postsRepository.bySlug(slug)));
  }
  async createPost(data: PostInput) {
    const value = await this.postsRepository.create(data);
    await this.invalidatePosts();
    return value;
  }
  async updatePost(id: string, data: PostInput) {
    const value = await this.postsRepository.update(id, data);
    await this.invalidatePosts();
    return value;
  }
  async deletePost(id: string) {
    const value = await this.postsRepository.remove(id);
    await this.invalidatePosts();
    return value;
  }
}
