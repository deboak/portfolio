const api=process.env.INTERNAL_API_URL??process.env.NEXT_PUBLIC_API_URL??'http://localhost:4000/api/v1';
export async function GET(){const response=await fetch(`${api}/resume`,{cache:'no-store'});if(!response.ok)return new Response('Resume is not available',{status:response.status});const body=await response.json() as {data:{url:string}};return Response.redirect(body.data.url,307)}
