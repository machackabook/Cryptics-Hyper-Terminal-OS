import type { ChromeFlagOption } from '../types';
/** Native state is unknown until observed through the local broker. */
export interface ChromeBackendState {
  connected: false; flags: ChromeFlagOption[]; hardwareAccelerationActive: null; webGpuEnabled: null;
  webMidiEnabled: null; zeroCopyBuffers: null; vulkanRasterization: null; lastOptimizedTimestamp: null; backendPid: null; message: string;
}
export const getChromeBackendState = async (): Promise<ChromeBackendState> => ({connected:false,flags:[],hardwareAccelerationActive:null,webGpuEnabled:null,webMidiEnabled:null,zeroCopyBuffers:null,vulkanRasterization:null,lastOptimizedTimestamp:null,backendPid:null,message:'Use the authenticated native NEXUS developer console. This public page cannot observe native process state.'});
const requiresNative = async (): Promise<never> => {throw new Error('Requires native broker and fresh SYNAPSE capability.');};
export const toggleChromeBackendFlag=requiresNative;
export const optimizeHardwareBackend=requiresNative;
export const resetChromeBackendFlags=requiresNative;
