import Image from "next/image";

// Reusable Icon component
export const IconButton = ({ src, alt, text, onClick }) => (
  <div className="relative group flex items-center" onClick={onClick}>
    <Image
      unoptimized
      src={src}
      alt={alt}
      height="12"
      width="12"
      className="md:w-[0.9rem] md:h-[0.9rem] cursor-pointer"
    />
    <div className="absolute text-center left-1/2 bottom-0 transform translate-y-full -translate-x-1/2 px-2 py-1 bg-white text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs whitespace-nowrap">
      {text}
    </div>
  </div>
);
