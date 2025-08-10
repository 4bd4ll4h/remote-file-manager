import { Client, ConnectConfig as SSHConnectOptions } from 'ssh2';
interface SessionClient {
  client: Client;
  lastActive: number;
}
type UserSessions = Map<string, SessionClient>;

function logSSH(event: string, details: Record<string, any>) {
  console.log(`[SSH][${new Date().toISOString()}][${event}]`, details);
}

class SSHManager{
    private sessions: Map<string,UserSessions>= new Map();
    private timeout = 30*60*1000;
    
    connect(userSessionId: string, serverId: string, options: SSHConnectOptions) {
        const client = new Client(); // Create a new SSH2 client
        logSSH('connect_attempt', { userSessionId, serverId, options });
      
        client.on('ready', () => {
          logSSH('client_ready', { userSessionId, serverId });
          
          // Store client in sessions map only after connection is ready
          if (!this.sessions.has(userSessionId)) {
            this.sessions.set(userSessionId, new Map());
          }
          
          const userServers = this.sessions.get(userSessionId)!;
          userServers.set(serverId, {
            client,
            lastActive: Date.now(),
          });
          
          logSSH('connect_success', { userSessionId, serverId });
        });
        
        client.on('error', (err) => logSSH('client_error', { userSessionId, serverId, error: err.message }));
        client.on('close', () => logSSH('client_close', { userSessionId, serverId }));
        client.on('end', () => logSSH('client_end', { userSessionId, serverId }));
      
        client.connect(options); // Open connection with provided options
        return client;
      }
      
      getClient(userSessionId: string, serverId: string) {
        const userServers = this.sessions.get(userSessionId);
        logSSH('getClient_call', { userSessionId, serverId, sessionsCount: this.sessions.size });
        
        if (!userServers) {
          logSSH('getClient_noUserSession', { userSessionId, serverId });
          return null;
        }
      
        const session = userServers.get(serverId);
        if (!session) {
          logSSH('getClient_noServerSession', { userSessionId, serverId });
          return null;
        }
      
        // Check for timeout
        if (Date.now() - session.lastActive > this.timeout) {
          logSSH('getClient_timeout', { userSessionId, serverId, lastActive: session.lastActive });
          this.disconnect(userSessionId, serverId);
          return null;
        }
      
        session.lastActive = Date.now(); // Update activity
        logSSH('getClient_success', { userSessionId, serverId });
        return session.client;
      }
      
      disconnect(userSessionId: string, serverId: string) {
        const userServers = this.sessions.get(userSessionId);
        if (!userServers) {
          logSSH('disconnect_noUserSession', { userSessionId, serverId });
          return;
        }
      
        const session = userServers.get(serverId);
        if (session) {
          logSSH('disconnect', { userSessionId, serverId });
          session.client.end(); // Close SSH connection
          userServers.delete(serverId); // Remove from map
      
          // If user has no more servers, clean up user too
          if (userServers.size === 0) {
            this.sessions.delete(userSessionId);
            logSSH('disconnect_cleanupUser', { userSessionId });
          }
        } else {
          logSSH('disconnect_noServerSession', { userSessionId, serverId });
        }
      }
      
      cleanup() {
        for (const [userSessionId, userServers] of this.sessions) {
          for (const [serverId, session] of userServers) {
            if (Date.now() - session.lastActive > this.timeout) {
              logSSH('cleanup_timeout', { userSessionId, serverId });
              this.disconnect(userSessionId, serverId);
            }
          }
        }
      }
      
      count() {
        let total = 0;
        for (const userServers of this.sessions.values()) {
          total += userServers.size;
        }
        return total;
      }

      debug() {
        const debugInfo = {
          totalSessions: this.count(),
          users: {} as Record<string, any>
        };
        
        for (const [userSessionId, userServers] of this.sessions) {
          debugInfo.users[userSessionId] = {
            serverCount: userServers.size,
            servers: {} as Record<string, any>
          };
          
          for (const [serverId, session] of userServers) {
            debugInfo.users[userSessionId].servers[serverId] = {
              lastActive: new Date(session.lastActive).toISOString(),
              timeSinceLastActive: Date.now() - session.lastActive,
              clientConnected: !!session.client
            };
          }
        }
        
        return debugInfo;
      }
}

export const sshManager = new SSHManager();