export const getImageUrl = (filename) => {
  if (!filename) return null;
  
  // If it's already a full URL or base64, return as is
  if (filename.startsWith('http') || filename.startsWith('data:image')) {
    return filename;
  }
  
  // If it starts with /uploads/, it's a path - return as is for client to handle
  if (filename.startsWith('/uploads/')) {
    return filename;
  }
  
  // Otherwise, create the path
  return `/uploads/${filename}`;
};
