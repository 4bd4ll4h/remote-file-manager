import ConnectForm from "@/app/components/ConnectForm";
export const dynamic = 'force-dynamic';
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-3xl font-bold">Remote File Manager</h1>
      <p className="text-gray-600">Click the + button above to start a new session</p>
    </div>
  );
}
