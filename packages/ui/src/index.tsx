// Styles
export { injectStyles } from "./styles.js";

// Providers & Contexts
export {
  SettingsProvider,
  useSettings,
  ToastProvider,
  useToast,
  ModalProvider,
  useModal
} from "./providers.js";

export type { ThemeSettings, Toast } from "./providers.js";

// Icons
export { Icon } from "./icons.js";
export type { IconName, IconProps } from "./icons.js";

// Reusable Components
export {
  BaseButton,
  BaseIconButton,
  BaseCard,
  BaseBadge,
  BaseTag,
  BaseLabel,
  BaseInput,
  BaseTextarea,
  BaseSelect,
  BaseCheckbox,
  BaseSwitch,
  BaseFormField,
  BaseSpinner,
  BaseSkeleton,
  BaseProgress,
  BaseEmptyState,
  BaseErrorState,
  BaseLoadingState,
  BasePagination,
  BaseDataTable,
  BaseAccordion
} from "./components.js";

export type {
  ButtonProps,
  IconButtonProps,
  CardProps,
  BadgeProps,
  TagProps,
  FormFieldProps,
  SkeletonProps,
  ProgressProps,
  StateProps,
  PaginationProps,
  Column,
  DataTableProps,
  AccordionItem
} from "./components.js";

// Layout & Grid Systems
export {
  BaseFlex,
  BaseStack,
  BaseSpacer,
  BaseGrid,
  BaseContainer,
  BaseSplitView,
  BaseAppShell
} from "./layouts.js";

export type { FlexProps, GridProps, NavItem } from "./layouts.js";
