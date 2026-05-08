import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { store } from '@/lib/store';
import AppShell from '@/components/AppShell';
export const dynamic = 'force-dynamic';
export default async function AppLayout({children}:{children:React.ReactNode}) {
  const session = await getSessionUser();
  if (!session) redirect('/login');
  const user = store.users.get(session.userId);
  if (!user) redirect('/login');
  return <AppShell user={{id:user.id,name:user.name,email:user.email,avatar:user.avatar,role:user.role,title:user.title,department:user.department}}>{children}</AppShell>;
}
