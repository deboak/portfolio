import crypto from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/errors.js';
import { imageQueue } from '../jobs/index.js';
import { uploadOriginal } from './media.storage.js';
export const mediaService={async upload(file?:Express.Multer.File){if(!file)throw new AppError(400,'An image file is required','FILE_REQUIRED');if(!['image/jpeg','image/png','image/webp'].includes(file.mimetype))throw new AppError(415,'Only JPEG, PNG, and WebP images are supported','UNSUPPORTED_MEDIA_TYPE');const key=`originals/${crypto.randomUUID()}`;await uploadOriginal(key,file);const asset=await prisma.mediaAsset.create({data:{originalKey:key,contentType:file.mimetype}});try{await imageQueue.add('resize-image',{assetId:asset.id});return asset}catch{await prisma.mediaAsset.update({where:{id:asset.id},data:{status:'FAILED',error:'Queue unavailable'}});throw new AppError(503,'Image stored, but processing is unavailable','QUEUE_UNAVAILABLE')}},list:()=>prisma.mediaAsset.findMany({orderBy:{createdAt:'desc'},take:100})};
