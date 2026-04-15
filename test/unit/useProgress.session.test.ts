describe('useProgress session creation', () => {
  const fixedUUID = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // Ensure a crypto object exists for the polyfill
    // @ts-ignore
    global.crypto = {};
  });

  it('creates session with UUID on web', () => {
    jest.doMock('react-native', () => {
      const RN = jest.requireActual('react-native');
      RN.Platform = { OS: 'web', select: (obj: any) => obj.web };
      return RN;
    });
    jest.doMock('expo-secure-store', () => ({
      getItemAsync: jest.fn(),
      setItemAsync: jest.fn(),
      deleteItemAsync: jest.fn(),
    }));
    const { useProgress } = require('../../app/stores/useProgress');
    // Provide deterministic UUID after module load
    // @ts-ignore
    global.crypto.randomUUID = () => fixedUUID;
    const store = useProgress.getState();
    store.startSession('deck', 10);
    expect(useProgress.getState().currentSession?.id).toBe(fixedUUID);
  });

  it('creates session with UUID on native', () => {
    jest.doMock('react-native', () => {
      const RN = jest.requireActual('react-native');
      RN.Platform = { OS: 'ios', select: (obj: any) => obj.ios };
      return RN;
    });
    jest.doMock('expo-secure-store', () => ({
      getItemAsync: jest.fn(),
      setItemAsync: jest.fn(),
      deleteItemAsync: jest.fn(),
    }));
    const { useProgress } = require('../../app/stores/useProgress');
    // Provide deterministic UUID after module load
    // @ts-ignore
    global.crypto.randomUUID = () => fixedUUID;
    const store = useProgress.getState();
    store.startSession('deck', 10);
    expect(useProgress.getState().currentSession?.id).toBe(fixedUUID);
  });
});

