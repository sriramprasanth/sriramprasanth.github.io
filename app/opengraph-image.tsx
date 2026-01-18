import { size, contentType, generateHomeImage } from "../og/generateImage";

export const dynamic = "force-static";
export const alt = "dragon-slayer";
export { size, contentType };

export default async function Image() {
  return generateHomeImage();
}
