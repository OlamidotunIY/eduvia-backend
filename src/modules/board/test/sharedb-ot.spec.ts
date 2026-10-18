import { ShareDBBackendService } from '../infrastructure/sharedb/sharedb-backend.service';
import { BoardDocumentService } from '../infrastructure/sharedb/board-document.service';
import { BoardEventProcessor } from '../infrastructure/messaging/listeners/board-event.processor';

describe('ShareDB Live Board OT Sync Integration (Phase 4)', () => {
  let backend: ShareDBBackendService;
  let documentService: BoardDocumentService;

  beforeEach(() => {
    backend = new ShareDBBackendService();
    backend.onModuleInit();
    documentService = new BoardDocumentService(backend);
  });

  afterEach(() => {
    backend.onModuleDestroy();
  });

  describe('ShareDBBackendService', () => {
    it('creates and retrieves a board document snapshot', () => {
      const doc = backend.getOrCreateDocument('board-1', {
        lessonId: 'lesson-1',
        orgId: 'org-1',
        mode: 'teach',
        isLocked: false,
        sections: [],
        version: 0,
      });

      expect(doc.id).toBe('board-1');
      expect(doc.mode).toBe('teach');
      expect(doc.version).toBe(0);

      const snapshot = backend.getDocumentSnapshot('board-1');
      expect(snapshot).toEqual(doc);
    });

    it('applies server-side JSON0 operations and increments version', () => {
      backend.getOrCreateDocument('board-2', {
        mode: 'teach',
        isLocked: false,
        sections: [],
        version: 0,
      });

      backend.applyServerOp('board-2', [
        { p: ['mode'], oi: 'classwork' },
      ]);

      const updated = backend.getDocumentSnapshot('board-2');
      expect(updated?.mode).toBe('classwork');
      expect(updated?.version).toBe(1);

      // Add a section to list
      backend.applyServerOp('board-2', [
        {
          p: ['sections', 0],
          li: { id: 'sec-1', content: 'Intro text', position: 0 },
        },
      ]);

      const withSection = backend.getDocumentSnapshot('board-2');
      expect(withSection?.sections.length).toBe(1);
      expect(withSection?.sections[0].id).toBe('sec-1');
      expect(withSection?.version).toBe(2);
    });
  });

  describe('BoardDocumentService', () => {
    it('switches board mode via server op', async () => {
      await documentService.createBoardDocument('board-3', {
        mode: 'teach',
        version: 0,
      });

      await documentService.switchMode('board-3', 'assignment');

      const snapshot = await documentService.getBoardSnapshot('board-3');
      expect(snapshot?.mode).toBe('assignment');
      expect(snapshot?.version).toBe(1);
    });

    it('locks and unlocks board via server op', async () => {
      await documentService.createBoardDocument('board-4', {
        isLocked: false,
        version: 0,
      });

      await documentService.setLocked('board-4', true);
      let snapshot = await documentService.getBoardSnapshot('board-4');
      expect(snapshot?.isLocked).toBe(true);

      await documentService.setLocked('board-4', false);
      snapshot = await documentService.getBoardSnapshot('board-4');
      expect(snapshot?.isLocked).toBe(false);
      expect(snapshot?.version).toBe(2);
    });
  });

  describe('BoardEventProcessor with ShareDB & Gateway', () => {
    it('initializes ShareDB document on LessonCreatedEvent', async () => {
      const mockBoard = { id: 'board-new-123' };
      const commandBus: any = {
        execute: jest.fn().mockResolvedValue(mockBoard),
      };

      const processor = new BoardEventProcessor(commandBus, documentService);

      await processor.process({
        name: 'LessonCreatedEvent',
        data: {
          payload: {
            lessonId: 'lesson-abc',
            orgId: 'org-xyz',
          },
          correlationId: 'corr-1',
        },
      } as any);

      expect(commandBus.execute).toHaveBeenCalled();
      const snapshot = await documentService.getBoardSnapshot('board-new-123');
      expect(snapshot).not.toBeNull();
      expect(snapshot?.lessonId).toBe('lesson-abc');
      expect(snapshot?.mode).toBe('teach');
    });

    it('syncs mode change to ShareDB and broadcasts via BoardGateway', async () => {
      await documentService.createBoardDocument('board-sync-1', {
        mode: 'teach',
      });

      const broadcastModeChange = jest.fn();
      const mockGateway: any = {
        broadcastModeChange,
      };

      const processor = new BoardEventProcessor(
        {} as any,
        documentService,
        mockGateway,
      );

      await processor.process({
        name: 'BoardModeChangedEvent',
        data: {
          payload: {
            boardId: 'board-sync-1',
            mode: 'classwork',
          },
        },
      } as any);

      const snapshot = await documentService.getBoardSnapshot('board-sync-1');
      expect(snapshot?.mode).toBe('classwork');
      expect(broadcastModeChange).toHaveBeenCalledWith('board-sync-1', 'classwork');
    });

    it('syncs lock change to ShareDB and broadcasts via BoardGateway', async () => {
      await documentService.createBoardDocument('board-sync-2', {
        isLocked: false,
      });

      const broadcastLockChange = jest.fn();
      const mockGateway: any = {
        broadcastLockChange,
      };

      const processor = new BoardEventProcessor(
        {} as any,
        documentService,
        mockGateway,
      );

      await processor.process({
        name: 'BoardLockedEvent',
        data: {
          payload: {
            boardId: 'board-sync-2',
          },
        },
      } as any);

      const snapshot = await documentService.getBoardSnapshot('board-sync-2');
      expect(snapshot?.isLocked).toBe(true);
      expect(broadcastLockChange).toHaveBeenCalledWith('board-sync-2', true);
    });
  });
});
