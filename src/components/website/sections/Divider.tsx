interface DividerProps {
  style?: 'solid' | 'dashed' | 'dotted';
}

export default function Divider({ style = 'solid' }: DividerProps) {
  const borderStyle = style === 'dashed' ? 'border-dashed' : style === 'dotted' ? 'border-dotted' : 'border-solid';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`w-full border-t border-stone-200 ${borderStyle}`} />
    </div>
  );
}
