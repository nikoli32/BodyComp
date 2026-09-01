/**
 * Navigation Hub Configuration
 * 
 * Define all navigation items here. This is a centralized, scalable configuration
 * that can be easily extended with new pages/features without modifying HTML files.
 * 
 * Each nav item should have:
 * - label: Display text for the button
 * - href: Relative path to the page
 * - icon (optional): Emoji or icon identifier for future use
 */

const NAV_CONFIG = [
  {
    label: 'Home',
    href: 'index.html',
    icon: '🏠'
  },
  {
    label: 'Body Map',
    href: 'front_view.html',
    icon: '💪'
  },
  {
    label: 'Log Workout',
    href: 'workout.html',
    icon: '📝'
  }
  // Future items can be added here without modifying any HTML files:
  // {
  //   label: 'Settings',
  //   href: 'settings.html',
  //   icon: '⚙️'
  // },
  // {
  //   label: 'History',
  //   href: 'history.html',
  //   icon: '📊'
  // }
];
