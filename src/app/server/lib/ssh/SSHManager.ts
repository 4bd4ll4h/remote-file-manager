import { Client, ConnectConfig as SSHConnectOptions } from 'ssh2';
interface SessionClient {
  client: Client;
  lastActive: number;
}
type UserSessions = Map<string, SessionClient>;

class SSHManager{
    private sessions: Map<string,UserSessions>= new Map();
    private timeout = 30*60*1000;
    
    connect(userSessionId: string, serverId: string, options: SSHConnectOptions) {
        const client = new Client(); // Create a new SSH2 client
      
        client.connect(options); // Open connection with provided options
      
        // If user doesn't exist yet, create an empty map for them
        if (!this.sessions.has(userSessionId)) {
          this.sessions.set(userSessionId, new Map());
        }
      
        const userServers = this.sessions.get(userSessionId)!; // User's server map
      
        userServers.set(serverId, {
          client,
          lastActive: Date.now(),
        });
       
        return client;
      }
      
      getClient(userSessionId: string, serverId: string) {
        const userServers = this.sessions.get(userSessionId);
        console.log(this.sessions.size);
        
        if (!userServers) return null;
      
        const session = userServers.get(serverId);
        if (!session) return null;
      
        // Check for timeout
        if (Date.now() - session.lastActive > this.timeout) {
          this.disconnect(userSessionId, serverId);
          return null;
        }
      
        session.lastActive = Date.now(); // Update activity
        return session.client;
      }
      
      disconnect(userSessionId: string, serverId: string) {
        const userServers = this.sessions.get(userSessionId);
        if (!userServers) return;
      
        const session = userServers.get(serverId);
        if (session) {
          session.client.end(); // Close SSH connection
          userServers.delete(serverId); // Remove from map
      
          // If user has no more servers, clean up user too
          if (userServers.size === 0) {
            this.sessions.delete(userSessionId);
          }
        }
      }
      
      cleanup() {
        for (const [userSessionId, userServers] of this.sessions) {
          for (const [serverId, session] of userServers) {
            if (Date.now() - session.lastActive > this.timeout) {
              this.disconnect(userSessionId, serverId);
            }
          }
        }
      }
      

}

export const sshManager = new SSHManager();