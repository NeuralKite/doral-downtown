import { createFileRoute } from '@tanstack/react-router';
import BusinessDashboard from '../../components/business/BusinessDashboard';

export const Route = createFileRoute('/business/')({
  component: BusinessPage,
});

function BusinessPage() {
  return <BusinessDashboard />;
}