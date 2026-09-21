import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { NotificationPayload, NotificationService } from './notification.service';

type AuthedWebSocket = WebSocket & { userId?: string };

@WebSocketGateway({ path: '/notifications', cors: true })
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService, private readonly notification: NotificationService) {
    this.notification.bindGateway(this);
  }

  handleConnection(client: AuthedWebSocket, request: { url?: string }) {
    const token = new URL(request.url || '', 'http://localhost').searchParams.get('token');
    try {
      const payload = this.jwt.verify<{ sub: string }>(token || '');
      client.userId = payload.sub;
    } catch {
      client.close();
    }
  }

  push(payload: NotificationPayload) {
    const data = JSON.stringify(payload);
    this.server.clients.forEach((client) => {
      const socket = client as AuthedWebSocket;
      if (socket.readyState !== WebSocket.OPEN) return;
      // 指定了接收人时定向推送，否则广播
      if (payload.userIds?.length && !payload.userIds.includes(socket.userId || '')) return;
      socket.send(data);
    });
  }
}
