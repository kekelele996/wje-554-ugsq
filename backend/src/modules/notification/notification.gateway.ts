import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { NotificationPayload, NotificationService } from './notification.service';

@WebSocketGateway({ path: '/notifications', cors: true })
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService, private readonly notification: NotificationService) {
    this.notification.bindGateway(this);
  }

  handleConnection(client: WebSocket, request: { url?: string }) {
    const token = new URL(request.url || '', 'http://localhost').searchParams.get('token');
    try {
      this.jwt.verify(token || '');
    } catch {
      client.close();
    }
  }

  push(payload: NotificationPayload) {
    const data = JSON.stringify(payload);
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(data);
    });
  }
}
