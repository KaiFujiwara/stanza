import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/projects" />;
  }

  return <Redirect href="/login" />;
}
