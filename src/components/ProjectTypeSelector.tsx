import { Label } from '@/components/ui/label';
import { ORIENTATIONS, SECTORS, getSubtypes, type OrientationType } from '@/data/projectTaxonomy';

interface Props {
  orientation: OrientationType | '';
  sector: string;
  subtype: string;
  onChange: (value: { orientation?: OrientationType; sector?: string; subtype?: string }) => void;
}

export default function ProjectTypeSelector({ orientation, sector, subtype, onChange }: Props) {
  const subtypeOptions = getSubtypes(orientation, sector);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Orientation</Label>
        <select
          className="w-full border rounded-md px-3 py-2 bg-background"
          value={orientation}
          onChange={(e) => onChange({ orientation: e.target.value as OrientationType, sector: '', subtype: '' })}
        >
          <option value="">Select orientation</option>
          {ORIENTATIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Sector</Label>
        <select
          className="w-full border rounded-md px-3 py-2 bg-background"
          value={sector}
          onChange={(e) => onChange({ sector: e.target.value, subtype: '' })}
          disabled={!orientation}
        >
          <option value="">Select sector</option>
          {SECTORS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Subtype</Label>
        <select
          className="w-full border rounded-md px-3 py-2 bg-background"
          value={subtype}
          onChange={(e) => onChange({ subtype: e.target.value })}
          disabled={!orientation || !sector}
        >
          <option value="">Select subtype</option>
          {subtypeOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
