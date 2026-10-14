import { getCategoryMeta } from '../../data/constants.js';

export default function CategoryIcon({ category, size = 'md' }) {
  const { icon: Icon, color } = getCategoryMeta(category);
  const dims = size === 'sm' ? 'h-9 w-9 rounded-lg' : 'h-11 w-11 rounded-xl';
  return (
    <div
      className={`flex shrink-0 items-center justify-center ${dims}`}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
    </div>
  );
}
