import { createFileRoute } from '@tanstack/react-router';
import UserProfile from '../../components/profile/UserProfile';

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  return <UserProfile />;
}