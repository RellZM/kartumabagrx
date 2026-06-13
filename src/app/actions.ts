'use server';

import fs from 'fs';
import path from 'path';

export async function uploadImageAction(formData: FormData): Promise<string> {
  const photo = formData.get('photo') as string; // This will be base64 string
  
  if (!photo || !photo.startsWith('data:image')) {
    throw new Error('Invalid photo data');
  }

  const matches = photo.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (matches && matches.length === 3) {
    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const fileName = `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    return `/uploads/${fileName}`;
  }

  throw new Error('Failed to process image');
}
