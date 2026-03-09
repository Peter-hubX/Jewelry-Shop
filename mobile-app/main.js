import { registerRootComponent } from 'expo';
import { App } from './App';
import { ExpoRoot } from 'expo-asset-allocation';

// Register the app
registerRootComponent(App);

// Start the app
export default function App() {
  return (
    <ExpoRoot />
  );
}