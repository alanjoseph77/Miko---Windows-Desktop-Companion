import { Live2DModelConfig } from './types';

export class ModelLoader {
  /**
   * Validates and loads a Live2D model3.json file from the specified URL or path.
   */
  public static async loadModelConfig(modelJsonUrl: string): Promise<Live2DModelConfig> {
    try {
      const response = await fetch(modelJsonUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch model definition: ${response.statusText}`);
      }

      const data: unknown = await response.json();
      if (!ModelLoader.isValidModelConfig(data)) {
        throw new Error('Invalid Live2D model3.json structure.');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`ModelLoader error: ${message}`);
    }
  }

  /**
   * Validates whether an object adheres to standard Live2D Cubism model3.json structure
   */
  public static isValidModelConfig(data: unknown): data is Live2DModelConfig {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;
    const fileRefs = obj.FileReferences as Record<string, unknown> | undefined;

    // Both camelCase and PascalCase can exist in Cubism configs
    const refs = (fileRefs || obj.fileReferences) as Record<string, unknown> | undefined;
    if (!refs) return false;

    const hasMoc = typeof (refs.Moc || refs.moc) === 'string';
    const hasTextures = Array.isArray(refs.Textures || refs.textures);

    return hasMoc && hasTextures;
  }
}
