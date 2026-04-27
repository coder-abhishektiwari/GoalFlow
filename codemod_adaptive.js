const fs = require('fs');

const files = [
  'src/components/CurrentStepCard.tsx',
  'src/components/GoalCard.tsx',
  'src/components/ProgressRing.tsx',
  'src/components/StepItem.tsx',
  'src/screens/CelebrationScreen.tsx',
  'src/screens/GoalAddWizard.tsx',
  'src/screens/GoalDetailScreen.tsx',
  'src/screens/GoalsListScreen.tsx',
  'src/screens/HomeScreen.tsx',
  'src/screens/InsightsScreen.tsx',
  'src/screens/OnboardingScreen.tsx',
  'src/screens/SettingsScreen.tsx'
];

for (const f of files) {
  let code = fs.readFileSync(f, 'utf8');
  
  if (!code.includes('useThemeColors')) {
    // Attempt to add useThemeColors to existing theme import
    code = code.replace(/import\s*\{([^}]+?Colors[^}]+?)\}\s*from\s*['"]\.\.?[/\\]theme['"];/, 'import {$1, useThemeColors} from \'../theme\';');
    
    // If it STILL doesn't have it, add it manually
    if (!code.includes('useThemeColors')) {
      code = `import { useThemeColors } from '../theme';\n` + code;
    }
  }

  // Ensure we don't double inject
  if (!code.includes('createStyles(Colors)')) {
    // Replace StyleSheet.create
    code = code.replace(/const styles = StyleSheet\.create\(\{/g, 'const createStyles = (Colors: any) => StyleSheet.create({');
    
    // Inject hooks
    const compRegex = /(export const [A-Za-z0-9_]+(?::\s*React\.FC<[^>]*>)?\s*=\s*\([^)]*\)(?: \: [^{]+)?\s*=>\s*\{)/g;
    code = code.replace(compRegex, `$1\n  const Colors = useThemeColors();\n  const styles = createStyles(Colors);\n`);
  }
  
  fs.writeFileSync(f, code);
  console.log('Processed', f);
}
