import { cache } from '../../lib/cache.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';

type ContentKind = 'project' | 'post';
const viewKey = (kind:ContentKind,id:string)=>`views:${kind}:${id}`;

async function redisKeys(pattern:string){
  const keys:string[]=[];let cursor='0';
  do {const [next,batch]=await redis.scan(cursor,'MATCH',pattern,'COUNT',100);cursor=next;keys.push(...batch);} while(cursor!=='0');
  return keys;
}

export const analyticsService = {
  async increment(kind:ContentKind,id:string){try{await redis.incr(viewKey(kind,id));}catch{/* PostgreSQL is intentionally not hit per view when Redis is unavailable. */}},
  async flushViews(){
    let locked=false;
    try {locked=(await redis.set('locks:view-flush','1','PX',55_000,'NX'))==='OK';if(!locked)return;
      for(const key of await redisKeys('views:*')){
        const [,kind,id]=key.split(':'); if(!id||(kind!=='project'&&kind!=='post'))continue;
        const raw=await redis.getdel(key);const amount=Number(raw??0);if(!Number.isSafeInteger(amount)||amount<=0)continue;
        try {if(kind==='project')await prisma.project.update({where:{id},data:{viewCount:{increment:amount}}});else await prisma.post.update({where:{id},data:{viewCount:{increment:amount}}});}
        catch {await redis.incrby(key,amount);}
      }
      await cache.deleteByPrefix('analytics:top');
    } catch {/* A later interval retries the batch. */}
    finally {if(locked)await redis.del('locks:view-flush').catch(()=>0);}
  },
  async topContent(){
    const cached=await cache.get<unknown>('analytics:top');if(cached)return cached;
    const [projects,posts]=await Promise.all([
      prisma.project.findMany({where:{published:true},orderBy:{viewCount:'desc'},take:5,select:{id:true,title:true,slug:true,viewCount:true}}),
      prisma.post.findMany({where:{published:true},orderBy:{viewCount:'desc'},take:5,select:{id:true,title:true,slug:true,viewCount:true}})
    ]);
    const value={projects,posts};await cache.set('analytics:top',value,60);return value;
  }
};
