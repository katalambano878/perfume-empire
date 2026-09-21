type BrandLogoProps = {
  className?: string;
  markClassName?: string;
};

export default function BrandLogo({
  className = '',
  markClassName = 'h-10 md:h-11',
}: BrandLogoProps) {
  return (
    <img
      src="/logo-mark.png"
      alt="The Perfume Empire"
      className={`${markClassName} w-auto object-contain ${className}`}
    />
  );
}
