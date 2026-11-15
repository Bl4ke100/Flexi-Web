import { memo, type ImgHTMLAttributes } from "react";
import { responsiveImage } from "@/lib/responsive-image";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & { src: string; alt: string };

function OptimizedImage({ src, alt, sizes = "100vw", loading = "lazy", decoding = "async", ...props }: Props) {
  return <img {...responsiveImage(src, sizes)} alt={alt} loading={loading} decoding={decoding} {...props} />;
}

export default memo(OptimizedImage);
