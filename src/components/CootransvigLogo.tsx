import React from 'react';

interface CootransvigLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const CootransvigLogo: React.FC<CootransvigLogoProps> = ({
  className = 'h-10 w-auto',
  size,
  showText = false,
}) => {
  // Map preset sizes if specified
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-11 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto',
  };

  const finalClass = size ? sizeClasses[size] : className;

  return (
    <div className={`inline-flex items-center gap-2.5 ${showText ? '' : ''}`}>
      <img
        src="/logo_cootransvig.svg"
        alt="Logo Oficial COOTRANSVIG - Cooperativa de Transportadores de Villanueva La Guajira"
        className={`${finalClass} object-contain shrink-0 drop-shadow-xs`}
        loading="eager"
      />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-headline-sm text-sm sm:text-base font-black tracking-wider text-primary">
            COOTRANSVIG
          </span>
          <span className="font-label-badge text-[10px] text-on-surface-variant uppercase tracking-tight">
            Villanueva • La Guajira
          </span>
        </div>
      )}
    </div>
  );
};
