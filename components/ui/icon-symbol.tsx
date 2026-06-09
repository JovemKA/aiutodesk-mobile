// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconLib = 'material' | 'ionicons';
type IconSpec = { lib: IconLib; name: string };

const MAPPING = {
  'house.fill': { lib: 'material', name: 'home' },
  'person.crop.circle.fill': { lib: 'material', name: 'person' },
  'graduationcap.fill': { lib: 'material', name: 'school' },
  'briefcase.fill': { lib: 'material', name: 'work' },
  'folder.fill': { lib: 'ionicons', name: 'folder' },
  'moon.fill': { lib: 'material', name: 'dark-mode' },
  'sun.max.fill': { lib: 'material', name: 'light-mode' },
  'paperplane.fill': { lib: 'material', name: 'send' },
  'chevron.left.forwardslash.chevron.right': { lib: 'material', name: 'code' },
  'chevron.right': { lib: 'material', name: 'chevron-right' },
  'location.fill': { lib: 'ionicons', name: 'location-outline' },
  'github.fill': { lib: 'ionicons', name: 'logo-github' },
  'linkedin.fill': { lib: 'ionicons', name: 'logo-linkedin' },
  'certificate.fill': { lib: 'ionicons', name: 'ribbon' },
  'work.fill': { lib: 'material', name: 'work' },
  'message.fill': { lib: 'material', name: 'chat-bubble' },
  'book.fill': { lib: 'material', name: 'menu-book' },
  'ticket.fill': { lib: 'material', name: 'confirmation-number' },
  'magnifyingglass': { lib: 'material', name: 'search' },
  'line.3.horizontal': { lib: 'material', name: 'menu' },
  'arrow.right.square': { lib: 'material', name: 'logout' },
  'hand.thumbsup': { lib: 'material', name: 'thumb-up' },
  'hand.thumbsdown': { lib: 'material', name: 'thumb-down' },
  'sparkles': { lib: 'material', name: 'auto-awesome' },
  'exclamationmark.bubble': { lib: 'material', name: 'support-agent' },
} satisfies Record<string, IconSpec>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const spec = MAPPING[name];
  if (!spec) {
    // fallback to a simple box or a default material icon
    return <MaterialIcons color={color} size={size} name={'help'} style={style} />;
  }

  if (spec.lib === 'material') {
    return <MaterialIcons color={color} size={size} name={spec.name as any} style={style} />;
  }

  return <Ionicons color={color} size={size} name={spec.name as any} style={style} />;
}
