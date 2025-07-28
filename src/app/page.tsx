import prisma from '@/lib/db'

export default async function Home() {
  const users = await prisma.user.findMany()
  return (
    <div className="text-3xl font-bold underline">hey jude {JSON.stringify(users)}</div>
  );
}
