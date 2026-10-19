import { create } from 'zustand';
import { Meeting, ChatMessage } from '../types';

export interface MeetingParticipantInfo {
  socketId: string;
  userId: string;
  displayName: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  stream?: MediaStream;
}

interface MeetingState {
  currentMeeting: Meeting | null;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  activeTab: 'chat' | 'participants' | 'ai' | 'info';
  chatMessages: ChatMessage[];
  participants: MeetingParticipantInfo[];
  setCurrentMeeting: (m: Meeting | null) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  toggleRecording: () => void;
  setAudioMuted: (muted: boolean) => void;
  setVideoOff: (videoOff: boolean) => void;
  setScreenSharing: (sharing: boolean) => void;
  setActiveTab: (tab: 'chat' | 'participants' | 'ai' | 'info') => void;
  addChatMessage: (msg: ChatMessage) => void;
  setParticipants: (list: MeetingParticipantInfo[]) => void;
  addParticipant: (p: MeetingParticipantInfo) => void;
  removeParticipant: (socketId: string) => void;
  updateParticipantMedia: (socketId: string, isMuted: boolean, isVideoOff: boolean) => void;
  updateParticipantScreenShare: (socketId: string, isScreenSharing: boolean) => void;
  updateParticipantStream: (socketId: string, stream: MediaStream) => void;
  resetMeeting: () => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  currentMeeting: null,
  isAudioMuted: false,
  isVideoOff: false,
  isScreenSharing: false,
  isRecording: false,
  activeTab: 'participants',
  chatMessages: [],
  participants: [],

  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),
  toggleAudio: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),
  toggleVideo: () => set((state) => ({ isVideoOff: !state.isVideoOff })),
  toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  setAudioMuted: (isAudioMuted) => set({ isAudioMuted }),
  setVideoOff: (isVideoOff) => set({ isVideoOff }),
  setScreenSharing: (isScreenSharing) => set({ isScreenSharing }),
  setActiveTab: (activeTab) => set({ activeTab }),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),

  setParticipants: (participants) => set({ participants }),

  addParticipant: (p) =>
    set((state) => {
      const existing = state.participants.find((x) => x.socketId === p.socketId);
      if (existing) {
        return {
          participants: state.participants.map((x) =>
            x.socketId === p.socketId ? { ...x, ...p, stream: p.stream || x.stream } : x
          ),
        };
      }
      return { participants: [...state.participants, p] };
    }),

  removeParticipant: (socketId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.socketId !== socketId),
    })),

  updateParticipantMedia: (socketId, isMuted, isVideoOff) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.socketId === socketId ? { ...p, isMuted, isVideoOff } : p
      ),
    })),

  updateParticipantScreenShare: (socketId, isScreenSharing) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.socketId === socketId ? { ...p, isScreenSharing } : p
      ),
    })),

  updateParticipantStream: (socketId, stream) =>
    set((state) => {
      const exists = state.participants.some((p) => p.socketId === socketId);
      if (exists) {
        return {
          participants: state.participants.map((p) =>
            p.socketId === socketId ? { ...p, stream } : p
          ),
        };
      }
      return {
        participants: [
          ...state.participants,
          {
            socketId,
            userId: socketId,
            displayName: 'Participant',
            isMuted: false,
            isVideoOff: false,
            isScreenSharing: false,
            stream,
          },
        ],
      };
    }),

  resetMeeting: () =>
    set({
      chatMessages: [],
      participants: [],
      isAudioMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      isRecording: false,
      activeTab: 'participants',
    }),
}));
