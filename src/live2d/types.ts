import { CharacterState } from '../types';

export interface Live2DModelConfig {
  version: string;
  fileReferences: {
    moc: string;
    textures: string[];
    physics?: string;
    pose?: string;
    expressions?: Array<{
      name: string;
      file: string;
    }>;
    motions?: Record<
      string,
      Array<{
        file: string;
        fade_in_time?: number;
        fade_out_time?: number;
      }>
    >;
  };
  groups?: Array<{
    target: string;
    name: string;
    ids: string[];
  }>;
}

export interface Live2DParameterMap {
  eyeLOpen?: number;
  eyeROpen?: number;
  mouthOpenY?: number;
  mouthForm?: number;
  angleX?: number;
  angleY?: number;
  angleZ?: number;
  bodyAngleX?: number;
  breath?: number;
}

export interface Live2DModelState {
  currentState: CharacterState;
  isLoaded: boolean;
  modelName: string;
  error?: string;
}

export interface Live2DSetupInstructions {
  cubismCoreUrl: string;
  documentationUrl: string;
  requiredFiles: string[];
  instructions: string[];
}
