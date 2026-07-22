import type { cache } from '../../lib/cache.js';
import { AppError } from '../../lib/errors.js';
import type { AboutRepository, PostRepository, ProjectRepository } from './content.repository.js';
import type { AboutInput, ListQuery, PostInput, ProjectInput } from './content.schemas.js';
const keys = {
  projects: 'content:projects',
  posts: 'content:posts',
  project: (slug: string) => `content:project:${slug}`,
  post: (slug: string) => `content:post:${slug}`,
  about: 'content:about',
};
const defaultAbout: AboutInput = {
  eyebrow: 'About',
  title: 'Engineering with clarity, care, and curiosity.',
  introTitle: 'Hello, I’m Akinode.',
  intro:
    'I’m a full-stack engineer who turns ambiguous product needs into clear interfaces and dependable backend systems. I care about the details users feel and the infrastructure they never have to think about.',
  body: 'This portfolio is also a working engineering laboratory—where caching, queues, authentication, observability, and cloud storage are treated as real product concerns rather than afterthoughts.',
  valueOneTitle: 'Product thinking',
  valueOneText: 'Start with the outcome, then choose the technology.',
  valueTwoTitle: 'Backend depth',
  valueTwoText: 'Design for failure, visibility, and maintainable growth.',
  valueThreeTitle: 'Continuous learning',
  valueThreeText: 'Document decisions and turn mistakes into reusable knowledge.',
};
export class ContentService {
  constructor(
    private readonly projectsRepository: ProjectRepository,
    private readonly postsRepository: PostRepository,
    private readonly aboutRepository: AboutRepository,
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

  about() {
    return this.cached(keys.about, async () => (await this.aboutRepository.get()) ?? defaultAbout);
  }

  async updateAbout(data: AboutInput) {
    const value = await this.aboutRepository.save(data);
    await this.cacheStore.deleteByPrefix(keys.about);
    return value;
  }
}
