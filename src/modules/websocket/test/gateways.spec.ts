import { NotificationsGateway } from '../gateways/notifications.gateway';
import { LessonGateway } from '../gateways/lesson.gateway';
import { BoardGateway } from '../gateways/board.gateway';
import { ChatGateway } from '../gateways/chat.gateway';
import { UserGateway } from '../gateways/user.gateway';

describe('WebSocket Gateways', () => {
  let mockServer: any;

  beforeEach(() => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
  });

  describe('NotificationsGateway', () => {
    it('should send notification to user room', () => {
      const gateway = new NotificationsGateway();
      gateway.server = mockServer;

      gateway.sendToUser('user-123', { title: 'New Lesson' });

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('notification:new', {
        title: 'New Lesson',
      });
    });

    it('should send event to organization room', () => {
      const gateway = new NotificationsGateway();
      gateway.server = mockServer;

      gateway.sendToOrg('org-456', 'org:announcement', { msg: 'Hello' });

      expect(mockServer.to).toHaveBeenCalledWith('org:org-456');
      expect(mockServer.emit).toHaveBeenCalledWith('org:announcement', {
        msg: 'Hello',
      });
    });

    it('should update unread count', () => {
      const gateway = new NotificationsGateway();
      gateway.server = mockServer;

      gateway.updateUnreadCount('user-123', 5);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('notification:count', {
        unreadCount: 5,
      });
    });
  });

  describe('LessonGateway', () => {
    it('should broadcast meet link to lesson room', () => {
      const gateway = new LessonGateway();
      gateway.server = mockServer;

      gateway.broadcastMeetLink('lesson-1', 'https://meet.google.com/abc-def');

      expect(mockServer.to).toHaveBeenCalledWith('lesson:lesson-1');
      expect(mockServer.emit).toHaveBeenCalledWith('lesson:meet_link_ready', {
        lessonId: 'lesson-1',
        meetLink: 'https://meet.google.com/abc-def',
      });
    });

    it('should broadcast status change to lesson room', () => {
      const gateway = new LessonGateway();
      gateway.server = mockServer;

      gateway.broadcastStatusChange('lesson-1', 'LIVE');

      expect(mockServer.to).toHaveBeenCalledWith('lesson:lesson-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'lesson:status_changed',
        expect.objectContaining({
          lessonId: 'lesson-1',
          status: 'LIVE',
        }),
      );
    });
  });

  describe('UserGateway', () => {
    it('should publish active organization changes to the user room', () => {
      const gateway = new UserGateway();
      gateway.server = mockServer;

      gateway.activeOrganizationChanged('user-123', 'org-456');

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'user:active_organization_changed',
        { organizationId: 'org-456' },
      );
    });
  });

  describe('BoardGateway', () => {
    it('should broadcast mode change to board room', () => {
      const gateway = new BoardGateway();
      gateway.server = mockServer;

      gateway.broadcastModeChange('board-1', 'classwork');

      expect(mockServer.to).toHaveBeenCalledWith('board:board-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'board:mode_changed',
        expect.objectContaining({
          boardId: 'board-1',
          mode: 'classwork',
        }),
      );
    });

    it('should broadcast lock change to board room', () => {
      const gateway = new BoardGateway();
      gateway.server = mockServer;

      gateway.broadcastLockChange('board-1', true);

      expect(mockServer.to).toHaveBeenCalledWith('board:board-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'board:lock_changed',
        expect.objectContaining({
          boardId: 'board-1',
          isLocked: true,
        }),
      );
    });
  });

  describe('ChatGateway', () => {
    it('should broadcast message to conversation room', () => {
      const gateway = new ChatGateway();
      gateway.server = mockServer;

      gateway.broadcastMessage('conv-1', { text: 'Hello class' });

      expect(mockServer.to).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockServer.emit).toHaveBeenCalledWith('chat:new_message', {
        text: 'Hello class',
      });
    });

    it('should send direct message to user room', () => {
      const gateway = new ChatGateway();
      gateway.server = mockServer;

      gateway.sendDirectMessage('user-999', { text: 'Private note' });

      expect(mockServer.to).toHaveBeenCalledWith('user:user-999');
      expect(mockServer.emit).toHaveBeenCalledWith('chat:direct_message', {
        text: 'Private note',
      });
    });
  });
});
