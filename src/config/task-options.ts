import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BinaryIcon,
  CalendarIcon,
  CircleCheckIcon,
  CircleIcon,
  CircleOffIcon,
  EllipsisIcon,
  MinusIcon,
  SquareCheckIcon,
  SquareXIcon,
  TextIcon,
  type LucideIcon,
} from "lucide-react";

export interface OptionItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const PRIORITY_OPTIONS: OptionItem[] = [
  { value: "none", label: "None", icon: CircleOffIcon },
  { value: "low", label: "Low", icon: ArrowDownIcon },
  { value: "medium", label: "Medium", icon: MinusIcon },
  { value: "high", label: "High", icon: ArrowUpIcon },
  { value: "urgent", label: "Urgent", icon: AlertTriangleIcon },
];

export const STATUS_OPTIONS: OptionItem[] = [
  { value: "not_started", label: "Not Started", icon: CircleIcon },
  { value: "in_progress", label: "In Progress", icon: EllipsisIcon },
  { value: "completed", label: "Completed", icon: CircleCheckIcon },
];

export const CUSTOM_FIELD_TYPES = [
  {
    value: "text",
    label: "Text",
    icon: TextIcon,
  },
  {
    value: "number",
    label: "Number",
    icon: BinaryIcon,
  },
  {
    value: "checkbox",
    label: "Checkbox",
    icon: SquareCheckIcon,
  },
  {
    value: "dateTime",
    label: "Date & Time",
    icon: CalendarIcon,
  },
];

export const CHECKBOX_OPTIONS = [
  { value: "true", label: "Checked", icon: SquareCheckIcon },
  { value: "false", label: "Un Checked", icon: SquareXIcon },
];
