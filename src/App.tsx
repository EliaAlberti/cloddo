import { Layout } from '@/components/layout';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <Layout />
    </ErrorBoundary>
  );
}

export default App
