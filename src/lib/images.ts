const MAX_DIMENSION = 900
const JPEG_QUALITY = 0.72

/** Reads an image file, downsizes it to fit MAX_DIMENSION, and returns a compressed JPEG data URL — keeps localStorage usage reasonable. */
export function readAndResizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('קריאת הקובץ נכשלה'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('טעינת התמונה נכשלה'))
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
        const width = Math.round(img.width * scale)
        const height = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('לא ניתן לעבד את התמונה'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
