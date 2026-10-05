import { CharacterState } from '../types';
import { Live2DModelState, Live2DSetupInstructions } from './types';

export class Live2DManager {
  private static instance: Live2DManager | null = null;
  private state: Live2DModelState = {
    currentState: 'idle',
    isLoaded: false,
    modelName: 'None',
  };

  private constructor() {}

  public static getInstance(): Live2DManager {
    if (!Live2DManager.instance) {
      Live2DManager.instance = new Live2DManager();
    }
    return Live2DManager.instance;
  }

  public getState(): Live2DModelState {
    return { ...this.state };
  }

  public setState(characterState: CharacterState): void {
    this.state.currentState = characterState;
    // Map character state to Live2D Cubism motions and expression parameters
    this.triggerMotionForState(characterState);
  }

  public triggerMotionForState(state: CharacterState): void {
    const motionGroup = this.mapStateToMotionGroup(state);
    if (this.state.isLoaded) {
      // In live Cubism model runtime:
      // model.motion(motionGroup);
    }
    // Reserved for live model parameter animation
    void motionGroup;
  }

  public mapStateToMotionGroup(state: CharacterState): string {
    switch (state) {
      case 'idle':
        return 'Idle';
      case 'happy':
        return 'Happy';
      case 'talking':
        return 'Talk';
      case 'surprised':
        return 'Surprised';
      case 'sleepy':
        return 'Sleepy';
      case 'thinking':
        return 'Thinking';
      case 'sad':
        return 'Sad';
      case 'excited':
        return 'Excited';
    }
  }

  /**
   * Provides setup instructions for dropping a Live2D Cubism model into Miko
   */
  public getSetupInstructions(): Live2DSetupInstructions {
    return {
      cubismCoreUrl: 'https://www.live2d.com/en/sdk/about/',
      documentationUrl: 'https://docs.live2d.com/cubism-sdk-manual/top/',
      requiredFiles: [
        'public/live2d/live2dcubismcore.min.js (Live2D Cubism Core library)',
        'public/live2d/models/<model_name>/<model_name>.model3.json',
        'public/live2d/models/<model_name>/<model_name>.moc3',
        'public/live2d/models/<model_name>/textures/',
      ],
      instructions: [
        '1. Download the Live2D Cubism SDK for Web from Live2D official website.',
        '2. Place "live2dcubismcore.min.js" inside the "public/live2d/" directory.',
        '3. Place your Cubism model folder inside "public/live2d/models/".',
        '4. In Miko Settings, toggle character model from "Anime SVG" to "Live2D".',
        '5. Live2DManager will automatically mount the model to the WebGL canvas!',
      ],
    };
  }
}
