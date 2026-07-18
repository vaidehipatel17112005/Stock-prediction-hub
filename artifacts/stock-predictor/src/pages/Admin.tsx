import { useAdminGetStats, useAdminListUsers, useAdminDeleteUser } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Users, Database, Cpu, Activity, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function Admin() {
  const { data: stats, isLoading: statsLoading } = useAdminGetStats({ query: { refetchInterval: 5000 } });
  const { data: usersData, refetch: refetchUsers } = useAdminListUsers();
  const deleteUserMutation = useAdminDeleteUser();
  const { toast } = useToast();

  const handleDeleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      deleteUserMutation.mutate(
        { userId: id },
        {
          onSuccess: () => {
            toast({ title: "User deleted" });
            refetchUsers();
          },
          onError: () => toast({ title: "Failed to delete user", variant: "destructive" })
        }
      );
    }
  };

  if (statsLoading) {
    return <div className="flex justify-center py-20"><Activity className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-destructive">
          <ShieldAlert className="w-8 h-8" /> System Administration
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-white/5"><CardContent className="p-6"><div className="flex justify-between items-start"><p className="text-sm text-muted-foreground font-medium">Total Users</p><Users className="w-4 h-4 text-primary" /></div><p className="text-3xl font-bold font-mono mt-2">{stats?.totalUsers}</p></CardContent></Card>
        <Card className="bg-card border-white/5"><CardContent className="p-6"><div className="flex justify-between items-start"><p className="text-sm text-muted-foreground font-medium">Total Predictions</p><Activity className="w-4 h-4 text-primary" /></div><p className="text-3xl font-bold font-mono mt-2">{stats?.totalPredictions}</p></CardContent></Card>
        <Card className="bg-card border-white/5"><CardContent className="p-6"><div className="flex justify-between items-start"><p className="text-sm text-muted-foreground font-medium">Trained Models</p><Database className="w-4 h-4 text-primary" /></div><p className="text-3xl font-bold font-mono mt-2">{stats?.totalModels}</p></CardContent></Card>
        <Card className="bg-card border-white/5"><CardContent className="p-6"><div className="flex justify-between items-start"><p className="text-sm text-muted-foreground font-medium">Active Jobs</p><Cpu className="w-4 h-4 text-primary" /></div><p className="text-3xl font-bold font-mono mt-2 text-accent">{stats?.activeJobs}</p></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Server Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span className="font-mono">{stats?.cpuUsage.toFixed(1)}%</span>
              </div>
              <Progress value={stats?.cpuUsage} className="h-2 [&>div]:bg-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span className="font-mono">{stats?.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={stats?.memoryUsage} className="h-2 [&>div]:bg-accent" />
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-sm text-muted-foreground">Uptime: <span className="text-foreground font-mono">{Math.floor((stats?.serverUptime || 0) / 3600)}h {Math.floor(((stats?.serverUptime || 0) % 3600) / 60)}m</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Popular Symbols</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.popularSymbols?.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground w-4">{i + 1}.</span>
                    <span className="font-bold">{item.symbol}</span>
                  </div>
                  <Badge variant="secondary" className="font-mono">{item.count} queries</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="text-lg">User Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Predictions</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersData?.users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 font-mono">{u.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{u.username}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={u.role === 'admin' ? 'border-destructive text-destructive' : 'border-primary/30 text-primary'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{u.predictionsCount}</td>
                    <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} disabled={u.role === 'admin'} className="text-destructive hover:bg-destructive/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
